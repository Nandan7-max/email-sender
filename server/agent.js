import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Ensure Google GenAI API key is mapped if GEMINI_API_KEY is provided
if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
  process.env.GOOGLE_GENAI_API_KEY = process.env.GEMINI_API_KEY;
}

// Supabase client initialization helper
export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

// Mailjet direct HTTP API send helper
export async function sendMailjetEmail({ to, subject, body }) {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const fromEmail = process.env.MAIL_FROM;
  const fromName = process.env.MAIL_FROM_NAME || 'Sendora';

  if (!apiKey || !secretKey || !fromEmail) {
    throw new Error('Missing Mailjet configuration: MAILJET_API_KEY, MAILJET_SECRET_KEY, or MAIL_FROM is not set in .env');
  }

  const payload = {
    Messages: [
      {
        From: {
          Email: fromEmail,
          Name: 'From Sendora'
        },
        To: [
          {
            Email: to
          }
        ],
        Subject: subject,
        TextPart: body,
        HTMLPart: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${body.replace(/\n/g, '<br/>')}</div>`
      }
    ]
  };

  const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${secretKey}`).toString('base64');

  // Attempt send with 1 retry on failure
  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.ErrorMessage || data.message || `Mailjet HTTP error ${response.status}`);
      }

      // Check status in Mailjet response message
      if (data.Messages && data.Messages[0]?.Status === 'error') {
        const errDetails = data.Messages[0].Errors?.map(e => e.ErrorMessage).join('; ') || 'Sending error';
        throw new Error(errDetails);
      }

      return { success: true, data };
    } catch (err) {
      lastError = err;
      if (attempt === 1) {
        console.warn('Mailjet attempt 1 failed, retrying once...', err.message);
      }
    }
  }

  throw lastError;
}

// Helper to log email to Supabase
// Helper to log email to Supabase and persistent fallback
import fs from 'fs';
import path from 'path';

const LOCAL_LOGS_FILE = path.resolve('local_logs.json');

function readLocalLogs() {
  try {
    if (fs.existsSync(LOCAL_LOGS_FILE)) {
      const content = fs.readFileSync(LOCAL_LOGS_FILE, 'utf8');
      return JSON.parse(content) || [];
    }
  } catch (e) {
    console.error('Error reading local logs:', e.message);
  }
  return [];
}

function appendLocalLog(entry) {
  try {
    const logs = readLocalLogs();
    logs.unshift(entry);
    fs.writeFileSync(LOCAL_LOGS_FILE, JSON.stringify(logs.slice(0, 50), null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving local log:', e.message);
  }
}

export function getLocalLogs() {
  return readLocalLogs();
}

export async function logEmail({ request, to_email, subject, body, status, error = null }) {
  const newEntry = {
    id: 'local-' + Date.now(),
    created_at: new Date().toISOString(),
    request: request || '',
    to_email,
    subject,
    body,
    status,
    error: error ? String(error) : null
  };

  appendLocalLog(newEntry);

  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error: dbError } = await supabase
        .from('email_logs')
        .insert([
          {
            request: request || '',
            to_email,
            subject,
            body,
            status,
            error: error ? String(error) : null
          }
        ])
        .select();

      if (!dbError && data) {
        return { success: true, data, storedIn: 'supabase' };
      }
    }
  } catch (err) {
    console.warn('Supabase log skipped:', err.message);
  }

  return { success: true, data: [newEntry], storedIn: 'local' };
}

// Email regex pattern for validation
export const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

/**
 * Parses user context into email components (recipient, subject, body).
 * Uses Gemini API via gemini-3.5-flash-lite, or fallback rule-based parser.
 */
export async function planAndDraftEmail(context) {
  if (!context || typeof context !== 'string' || !context.trim()) {
    throw new Error('Instruction context cannot be empty');
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are Sendora, an intelligent AI email sending agent.
The user gave this instruction: "${context}"

Analyze this instruction carefully:
1. Extract the recipient email address. If no recipient email address is present in the instruction, set "to" to empty string ("").
2. Formulate a step-by-step plan of what you determined.
3. Write a polite, clear, professional subject line.
4. Write a polite, high-quality, professional email body based on the instruction. Sign off as "From Sendora".

Respond ONLY with a valid JSON object matching this schema, without markdown formatting or code blocks:
{
  "to": "recipient email or empty string",
  "plan": "Step-by-step explanation of what the agent determined",
  "subject": "Professional email subject",
  "body": "Full professional email body"
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      const data = await res.json();
      if (data.candidates && data.candidates[0]?.content?.parts) {
        const text = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(text);
        return {
          to: parsed.to ? parsed.to.trim() : '',
          plan: parsed.plan || `Analyzed user instruction: "${context}". Extracted recipient and drafted content.`,
          subject: parsed.subject || 'Message from Sendora',
          body: parsed.body || context
        };
      } else if (data.error) {
        console.warn('Gemini API returned error:', data.error);
      }
    } catch (err) {
      console.warn('Gemini drafting failed, falling back to rule parser:', err.message);
    }
  }

  // Fallback parser if API call fails
  const emailMatch = context.match(EMAIL_REGEX);
  const to = emailMatch ? emailMatch[0] : '';
  
  let cleaned = context;
  if (to) {
    cleaned = cleaned.replace(to, '').replace(/to\s*:?/i, '').replace(/send\s*(an?\s*email\s*)?/i, '').trim();
  }

  const subject = cleaned ? (cleaned.length > 30 ? cleaned.slice(0, 30) + '...' : cleaned) : 'Message from Sendora';
  const body = `Hello,\n\n${cleaned || context}\n\nBest regards,\nFrom Sendora`;
  const plan = to
    ? `Identified recipient <${to}> from instruction. Drafted polite subject and body based on: "${context}".`
    : `Could not identify recipient email in "${context}". Requesting recipient email from user.`;

  return {
    to,
    plan,
    subject,
    body
  };
}

/**
 * Sends approved draft and records log to Supabase.
 */
export async function executeSendEmail({ to, subject, body, request }) {
  if (!to || !EMAIL_REGEX.test(to)) {
    throw new Error('Valid recipient email address is required.');
  }
  if (!subject) {
    throw new Error('Email subject is required.');
  }
  if (!body) {
    throw new Error('Email body is required.');
  }

  try {
    const result = await sendMailjetEmail({ to, subject, body });
    const logRes = await logEmail({
      request: request || `Send email to ${to}`,
      to_email: to,
      subject,
      body,
      status: 'sent',
      error: null
    });
    return {
      success: true,
      message: `Email successfully sent to ${to}`,
      result,
      dbLogged: true,
      storedIn: logRes?.storedIn || 'local'
    };
  } catch (err) {
    await logEmail({
      request: request || `Send email to ${to}`,
      to_email: to,
      subject,
      body,
      status: 'failed',
      error: err.message
    });
    throw err;
  }
}
