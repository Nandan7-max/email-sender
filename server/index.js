import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { planAndDraftEmail, executeSendEmail, getSupabaseClient } from './agent.js';

dotenv.config();

// Ensure Google GenAI API key is mapped if GEMINI_API_KEY is provided
if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
  process.env.GOOGLE_GENAI_API_KEY = process.env.GEMINI_API_KEY;
}

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow exact match or localhost in development
    if (origin === FRONTEND_URL || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    // Allow configured origin
    return callback(null, true); // Permissive in dev to avoid blocking
  },
  credentials: true
}));

app.use(express.json());

// 1. Health check route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'MailPilot Agent API' });
});

// 2. Draft email preview route
app.post('/api/draft-email', async (req, res) => {
  try {
    const { context } = req.body;
    if (!context || typeof context !== 'string' || !context.trim()) {
      return res.status(400).json({ error: 'Field "context" is required and cannot be empty.' });
    }

    const draft = await planAndDraftEmail(context.trim());
    return res.status(200).json(draft);
  } catch (error) {
    console.error('Error in /api/draft-email:', error);
    return res.status(500).json({ error: error.message || 'Failed to draft email.' });
  }
});

// 3. Send email route (sends approved draft)
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body, request } = req.body;

    if (!to || typeof to !== 'string' || !to.trim()) {
      return res.status(400).json({ error: 'Recipient email "to" is required.' });
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ error: 'Field "subject" is required.' });
    }
    if (!body || typeof body !== 'string' || !body.trim()) {
      return res.status(400).json({ error: 'Field "body" is required.' });
    }

    const result = await executeSendEmail({
      to: to.trim(),
      subject: subject.trim(),
      body: body.trim(),
      request: request || `Send email to ${to}`
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in /api/send-email:', error);
    return res.status(500).json({ error: error.message || 'Failed to send email.' });
  }
});

// 4. Get recent email logs route
app.get('/api/email-logs', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Return empty array if Supabase not configured yet
      return res.status(200).json([]);
    }

    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase query error in /api/email-logs:', error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Error in /api/email-logs:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch logs.' });
  }
});

app.listen(PORT, () => {
  console.log(`MailPilot Server listening on port ${PORT}`);
});
