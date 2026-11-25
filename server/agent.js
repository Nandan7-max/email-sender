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
        TextPart: `${body}\n\n---\nSent via Sendora Intelligent Mail Infrastructure\nSupport: kambagirinandan@gmail.com | Helpline: +91 9063889100\nTo unsubscribe or manage preferences, reply to this email.`,
        HTMLPart: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
    <tr>
      <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 20px 28px; text-align: left;">
        <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Sendora</span>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 28px; font-size: 15px; line-height: 1.7; color: #374151;">
        ${body.replace(/\n/g, '<br/>')}
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 28px; background-color: #f3f4f6; border-top: 1px solid #e5e7eb; font-size: 12px; line-height: 1.6; color: #6b7280;">
        <p style="margin: 0 0 6px 0;">This communication was dispatched on your behalf through <strong>Sendora AI Mail Services</strong>.</p>
        <p style="margin: 0 0 6px 0;">Customer Support: <a href="mailto:kambagirinandan@gmail.com" style="color: #16a34a; text-decoration: none;">kambagirinandan@gmail.com</a> | Helpline: <a href="tel:+919063889100" style="color: #16a34a; text-decoration: none;">+91 9063889100</a></p>
        <p style="margin: 0; font-size: 11px; color: #9ca3af;">All rights reserved &copy; ${new Date().getFullYear()} Sendora. To stop receiving correspondence or report any issue, reply directly to this email.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
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

export async function logEmail({ request, to_email, subject, body, status, error = null, clientId = null }) {
  const newEntry = {
    id: 'local-' + Date.now(),
    clientId: clientId || null,
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
      const prompt = `You are Sendora, an elite AI executive communications copywriter and email assistant.
The user gave this raw instruction: "${context}"

Your job is to thoroughly analyze the user's intent and topic, and generate an outstanding, professional, polished email.

RULES:
1. RECIPIENT: Extract the recipient email address. If none is mentioned, return "".
2. SUBJECT LINE: DO NOT simply copy the user's instruction words verbatim. Instead, intelligently summarize the core objective into a clean, engaging, business-standard email subject line (e.g., if user says "meeting tomorrow at 4", subject should be "Meeting Confirmation & Discussion - Tomorrow at 4:00 PM").
3. EMAIL BODY: DO NOT return a raw or robotic one-liner. Expand the user's topic into an elegant, complete, multi-paragraph email containing:
   - A warm, respectful greeting (e.g. "Dear [Recipient]," or "Hello,")
   - A clear opening sentence explaining the purpose of reaching out
   - A well-written, articulate middle paragraph expanding on the topic or question
   - A polite call to action or closing remark
   - Sign off as:
     Best regards,
     From Sendora
4. PLAN: Provide a clear 1-2 sentence explanation of how you transformed the user's input.

Respond ONLY with a valid JSON object matching this schema:
{
  "to": "recipient email or empty string",
  "plan": "Explanation of analyzed topic and crafted response",
  "subject": "Intelligent and polished subject line",
  "body": "Complete, eloquent multi-paragraph email body"
}`;

      // Try available gemini models in order if one experiences a temporary 503 spike
      const candidateModels = [
        'gemini-3.5-flash-lite',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
        'gemini-flash-lite-latest'
      ];

      let generatedData = null;

      for (const modelName of candidateModels) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
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
            generatedData = data.candidates[0].content.parts[0].text;
            break;
          } else if (data.error) {
            console.warn(`Model ${modelName} returned status ${data.error.code}:`, data.error.message);
          }
        } catch (e) {
          console.warn(`Attempt with ${modelName} failed:`, e.message);
        }
      }

      if (generatedData) {
        const parsed = JSON.parse(generatedData);
        return {
          to: parsed.to ? parsed.to.trim() : '',
          plan: parsed.plan || `Analyzed user instruction: "${context}". Extracted recipient and drafted content.`,
          subject: parsed.subject || 'Message from Sendora',
          body: parsed.body || context
        };
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

  // Generate an intelligent topic-based subject instead of copying raw words
  let subject = 'Quick Note & Follow-up';
  if (/meet|call|schedule|demo|sync/i.test(cleaned)) {
    subject = 'Upcoming Discussion & Schedule Confirmation';
  } else if (/photo|workshop|camera/i.test(cleaned)) {
    subject = 'Information Regarding the Photography Workshop';
  } else if (/project|update|status/i.test(cleaned)) {
    subject = 'Project Progress & Status Check-in';
  } else if (/hello|hi|hey|greet/i.test(cleaned)) {
    subject = 'Warm Greetings & Connecting with You';
  } else if (cleaned.length > 5) {
    subject = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    if (subject.length > 40) subject = subject.slice(0, 37) + '...';
  }

  const body = `Dear Colleague,\n\nI hope this email finds you having a productive week.\n\nI am reaching out regarding ${cleaned || 'our recent conversation'}. Please review the details at your convenience, and let me know if you have any questions or if there is anything I can assist with.\n\nLooking forward to hearing from you soon.\n\nBest regards,\nFrom Sendora`;
  const plan = to
    ? `Analyzed instruction topic for <${to}>. Generated intelligent subject "${subject}" and polished email body.`
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
export async function executeSendEmail({ to, subject, body, request, clientId }) {
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
      error: null,
      clientId
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
      error: err.message,
      clientId
    });
    throw err;
  }
}
