import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, XCircle, RefreshCw, AlertCircle, Bot, Eye } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Agent() {
  const [instruction, setInstruction] = useState('');
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [draft, setDraft] = useState(null);
  const [recipientInput, setRecipientInput] = useState('');
  const [trace, setTrace] = useState([]);
  const [alert, setAlert] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch email logs on mount
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${API_BASE}/api/email-logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Could not fetch logs from backend:', err.message);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Step 1: Draft email using agent
  const handleDraft = async (e) => {
    e.preventDefault();
    if (!instruction.trim()) {
      setAlert({ type: 'error', message: 'Please enter an instruction (e.g. "send hi to alex@example.com").' });
      return;
    }

    setLoadingDraft(true);
    setAlert(null);
    setDraft(null);
    setTrace([
      { title: '1. Instruction Received', content: `"${instruction.trim()}"` },
      { title: '2. Agent Planning', content: 'Analyzing recipient, intent, and drafting professional email...' }
    ]);

    try {
      const res = await fetch(`${API_BASE}/api/draft-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: instruction.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate email draft.');
      }

      setDraft(data);
      setRecipientInput(data.to || '');

      setTrace((prev) => [
        ...prev,
        {
          title: '3. Plan Formulated',
          content: data.plan || 'Draft ready. Awaiting user approval before dispatch.'
        },
        {
          title: '4. Observation & Preview',
          content: data.to
            ? `Recipient extracted: ${data.to}. Preview rendered for confirmation.`
            : 'No recipient email detected. Please provide the recipient address below before approving.'
        }
      ]);
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
      setTrace((prev) => [
        ...prev,
        { title: 'Agent Error', content: err.message }
      ]);
    } finally {
      setLoadingDraft(false);
    }
  };

  // Step 2: Approve and send email
  const handleApprove = async () => {
    const to = (recipientInput || draft?.to || '').trim();
    if (!to) {
      setAlert({ type: 'error', message: 'Please specify a valid recipient email address.' });
      return;
    }

    setSendingEmail(true);
    setAlert(null);

    setTrace((prev) => [
      ...prev,
      {
        title: '5. Action Approved',
        content: `User approved dispatch to ${to}. Calling tool: send_email...`
      }
    ]);

    try {
      const res = await fetch(`${API_BASE}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject: draft.subject,
          body: draft.body,
          request: instruction
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Mailjet dispatch failed.');
      }

      const observationText = data.storedIn === 'supabase'
        ? 'Mailjet returned HTTP 200. Log entry saved in Supabase database.'
        : 'Mailjet returned HTTP 200. Email delivered! Log saved in email activity log.';

      setAlert({ type: 'success', message: `Email successfully dispatched to ${to}!` });
      setTrace((prev) => [
        ...prev,
        {
          title: '6. Tool Observation',
          content: observationText
        }
      ]);

      setDraft(null);
      setInstruction('');
      setRecipientInput('');
      fetchLogs();
    } catch (err) {
      setAlert({ type: 'error', message: `Sending failed: ${err.message}` });
      setTrace((prev) => [
        ...prev,
        {
          title: '6. Tool Error',
          content: `Failed to deliver email: ${err.message}. Status recorded as failed in database.`
        }
      ]);
      fetchLogs();
    } finally {
      setSendingEmail(false);
    }
  };

  // Reject draft
  const handleReject = () => {
    setDraft(null);
    setAlert({ type: 'error', message: 'Email draft rejected. No message was sent.' });
    setTrace((prev) => [
      ...prev,
      { title: 'User Action', content: 'Draft rejected by user. The send_email tool was not called.' }
    ]);
  };

  return (
    <div className="container">
      <div className="agent-header">
        <h1 className="agent-title">AI Mail Sending Agent</h1>
        <p className="agent-subtitle">
          Type your command in natural language. MailPilot will analyze, draft, and await your confirmation before sending.
        </p>
      </div>

      {alert && (
        <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {alert.message}
        </div>
      )}

      <div className="agent-grid">
        {/* Left Column: Command & Preview */}
        <div>
          <div className="panel">
            <h2 className="panel-title">
              <span>Agent Instruction</span>
              <Bot size={18} color="var(--purple-accent)" />
            </h2>

            <form onSubmit={handleDraft}>
              <textarea
                className="agent-textarea"
                placeholder='Example: "send hi to someone@gmail.com and ask how their project is going"'
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                disabled={loadingDraft || sendingEmail}
              />

              <div className="submit-row">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loadingDraft || sendingEmail || !instruction.trim()}
                >
                  <Send size={15} />
                  <span>{loadingDraft ? 'Drafting...' : 'Plan & Draft'}</span>
                </button>
              </div>
            </form>

            {/* Approval Preview Box */}
            {draft && (
              <div className="preview-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                  <Eye size={18} color="var(--purple-accent)" />
                  <strong style={{ fontSize: 14 }}>Approval Required Before Sending</strong>
                </div>

                <div className="preview-field">
                  <div className="preview-label">Recipient Email</div>
                  <input
                    type="email"
                    className="preview-input"
                    placeholder="Enter recipient email..."
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                  />
                  {!recipientInput && (
                    <small style={{ color: '#ef4444', fontSize: 11, marginTop: 4, display: 'block' }}>
                      * Recipient address was missing from your prompt. Please fill it in.
                    </small>
                  )}
                </div>

                <div className="preview-field">
                  <div className="preview-label">Subject</div>
                  <input
                    type="text"
                    className="preview-input"
                    value={draft.subject}
                    onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  />
                </div>

                <div className="preview-field">
                  <div className="preview-label">Body Preview</div>
                  <textarea
                    className="preview-input preview-body-box"
                    style={{ minHeight: 120, resize: 'vertical' }}
                    value={draft.body}
                    onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  />
                </div>

                <div className="preview-actions">
                  <button
                    type="button"
                    className="btn-reject"
                    onClick={handleReject}
                    disabled={sendingEmail}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="btn-approve"
                    onClick={handleApprove}
                    disabled={sendingEmail || !recipientInput.trim()}
                  >
                    {sendingEmail ? 'Sending...' : 'Approve & Send'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Trace Panel */}
          {trace.length > 0 && (
            <div className="panel" style={{ marginTop: 24 }}>
              <h2 className="panel-title">
                <span>Agent Execution Trace</span>
              </h2>
              {trace.map((step, idx) => (
                <div key={idx} className="trace-step">
                  <div className="trace-title">{step.title}</div>
                  <div className="trace-content">{step.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Sent Emails Database Logs */}
        <div>
          <div className="panel">
            <div className="panel-title">
              <span>Recent Sent Emails</span>
              <button
                className="btn-secondary"
                onClick={fetchLogs}
                disabled={loadingLogs}
                style={{ padding: '4px 8px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <RefreshCw size={12} className={loadingLogs ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {logs.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <p style={{ marginBottom: 8 }}>No emails logged yet.</p>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 8, padding: 10, fontSize: 12 }}>
                  <strong>Note:</strong> If you haven't created the table in Supabase yet, run the SQL in your Supabase SQL Editor so sent emails appear here.
                </div>
              </div>
            ) : (
              <div className="logs-list">
                {logs.map((log) => (
                  <div key={log.id} className="log-item">
                    <div className="log-header">
                      <span className="log-recipient">{log.to_email || 'No recipient'}</span>
                      <span
                        className={`status-badge ${
                          log.status === 'sent' ? 'badge-sent' : 'badge-failed'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="log-subject">{log.subject || '(No subject)'}</div>
                    <div className="log-date">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                    {log.error && (
                      <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>
                        Error: {log.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
