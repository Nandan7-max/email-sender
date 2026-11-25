import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Shield, 
  Mail, Zap, Database, Send, Eye, RefreshCw, Phone, AlertTriangle, 
  ExternalLink, UserCheck, Clock, Check
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Home() {
  // Agent states for embedded agent on homepage
  const [instruction, setInstruction] = useState('');
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [draft, setDraft] = useState(null);
  const [recipientInput, setRecipientInput] = useState('');
  const [trace, setTrace] = useState([]);
  const [alert, setAlert] = useState(null);

  // Email history states
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

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
      console.warn('Could not fetch logs:', err.message);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleDraft = async (e) => {
    e.preventDefault();
    if (!instruction.trim()) {
      setAlert({ type: 'error', message: 'Please enter a prompt (e.g. "send hi to someone@gmail.com").' });
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
      if (!res.ok) throw new Error(data.error || 'Failed to generate email draft.');

      setDraft(data);
      setRecipientInput(data.to || '');

      setTrace((prev) => [
        ...prev,
        { title: '3. Plan Formulated', content: data.plan || 'Draft created. Awaiting your approval.' },
        {
          title: '4. Observation & Preview',
          content: data.to
            ? `Recipient extracted: ${data.to}. Preview ready for review.`
            : 'No recipient email detected. Please enter a valid recipient email below.'
        }
      ]);
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
      setTrace((prev) => [...prev, { title: 'Agent Error', content: err.message }]);
    } finally {
      setLoadingDraft(false);
    }
  };

  const handleApprove = async () => {
    const to = (recipientInput || draft?.to || '').trim();
    if (!to) {
      setAlert({ type: 'error', message: 'Please enter a valid recipient email address.' });
      return;
    }

    setSendingEmail(true);
    setAlert(null);
    setTrace((prev) => [
      ...prev,
      { title: '5. Action Approved', content: `User confirmed dispatch to ${to}. Calling send_email tool...` }
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
      if (!res.ok) throw new Error(data.error || 'Mailjet dispatch failed.');

      setAlert({ type: 'success', message: `Email successfully dispatched to ${to}!` });
      setTrace((prev) => [
        ...prev,
        { title: '6. Tool Observation', content: 'Mailjet returned HTTP 200. Email delivered & logged!' }
      ]);

      setDraft(null);
      setInstruction('');
      setRecipientInput('');
      fetchLogs();
    } catch (err) {
      setAlert({ type: 'error', message: `Sending failed: ${err.message}` });
      setTrace((prev) => [
        ...prev,
        { title: '6. Tool Error', content: `Failed to deliver email: ${err.message}` }
      ]);
      fetchLogs();
    } finally {
      setSendingEmail(false);
    }
  };

  const handleReject = () => {
    setDraft(null);
    setAlert({ type: 'error', message: 'Email draft rejected. No message was sent.' });
    setTrace((prev) => [
      ...prev,
      { title: 'User Action', content: 'Draft rejected by user. The send tool was not invoked.' }
    ]);
  };

  return (
    <div className="agrica-home">
      {/* SECTION 1: HERO SECTION */}
      <section id="home" className="agrica-hero-slider">
        <button className="slider-arrow slider-arrow-left" aria-label="Previous Slide">
          <ChevronLeft size={24} />
        </button>
        <button className="slider-arrow slider-arrow-right" aria-label="Next Slide">
          <ChevronRight size={24} />
        </button>

        <div className="hero-img-backdrop">
          <img 
            src="/email-hero.jpg" 
            alt="Sendora Intelligent Email Infrastructure" 
            className="hero-main-img" 
          />
          <div className="hero-cinematic-overlay"></div>
        </div>

        <div className="hero-center-content">
          <div className="glossy-pill-badge" style={{ marginBottom: 18 }}>
            <Sparkles size={15} />
            <span>Premium AI Mail Delivery Platform</span>
          </div>
          <h1 className="hero-title-main">Sendora Solution</h1>
          <p className="hero-subtitle-main">
            High-performing AI email agent that keeps your communication intelligent, polished and healthy—while saving you time, manual drafting and energy.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#sender-agent" className="agrica-explore-btn">
              <span>Try Live Sender Agent</span>
              <ArrowRight size={17} />
            </a>
            <a href="#history" className="agrica-explore-btn" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <span>View Sent History</span>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT SENDORA (20+ YEARS COOPERATIVE SPLIT) */}
      <section id="about" className="agrica-split-section">
        <div className="agrica-split-container">
          <div className="split-image-col">
            <div className="split-image-card">
              <img 
                src="/email-hero.jpg" 
                alt="AI Email Automation" 
                className="split-featured-img" 
              />
              <div className="split-badge-tag">
                <Sparkles size={16} />
                <span>Next-Gen Gemini 3.5 AI</span>
              </div>
            </div>
          </div>

          <div className="split-text-col">
            <div className="green-accent-border">
              <h2 className="split-main-headline">
                20+ years<br />
                autonomous email<br />
                cooperative
              </h2>

              <p className="split-paragraph">
                The automated process starts as soon as your prompt goes into the machine. The outcome is gleaming, high-converting correspondence!
              </p>

              <p className="split-paragraph" style={{ marginTop: 18 }}>
                Tell Sendora who to reach and what goal you want to achieve. Our Google ADK agent parses the intent, prepares the preview, and securely delivers your message via Mailjet HTTP API with an auditable Supabase ledger.
              </p>

              <div className="split-feature-pills">
                <div className="feature-pill">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Human-in-the-Loop Confirmation Gate</span>
                </div>
                <div className="feature-pill">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Verified Senders &amp; Anti-Spam Headers</span>
                </div>
                <div className="feature-pill">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Persistent Real-Time Email Activity Ledger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE MAIN EMAIL SENDER AGENT (EMBEDDED DIRECTLY ON HOMEPAGE) */}
      <section id="sender-agent" className="homepage-section" style={{ background: 'var(--card-bg)' }}>
        <div className="agrica-nav-container" style={{ display: 'block' }}>
          <div className="section-title-wrap">
            <span className="services-badge">AI AGENT SUITE</span>
            <h2 className="services-headline">Live Email Dispatcher Agent</h2>
            <p className="section-subtext">
              Type your command in natural language. Sendora will extract the recipient, draft an eloquent message, and wait for your approval before dispatching.
            </p>
          </div>

          {alert && (
            <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {alert.message}
            </div>
          )}

          <div className="agent-grid">
            {/* Input & Approval Panel */}
            <div className="panel glossy-panel">
              <h3 className="panel-title">
                <span>Enter Agent Command</span>
                <Sparkles size={18} color="var(--agrica-green)" />
              </h3>

              <form onSubmit={handleDraft}>
                <textarea
                  className="agent-textarea"
                  placeholder='Example: "send hi to someone@gmail.com and invite them to our product demo tomorrow at 4 PM"'
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
                    <span>{loadingDraft ? 'Drafting Message...' : 'Plan & Draft Email'}</span>
                  </button>
                </div>
              </form>

              {/* Approval Box */}
              {draft && (
                <div className="preview-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Eye size={18} color="var(--agrica-green)" />
                    <strong style={{ fontSize: 15 }}>Approval Required Before Sending</strong>
                  </div>

                  <div className="preview-field">
                    <div className="preview-label">Recipient Email</div>
                    <input
                      type="email"
                      className="preview-input"
                      value={recipientInput}
                      onChange={(e) => setRecipientInput(e.target.value)}
                      placeholder="recipient@example.com"
                    />
                    {!recipientInput && (
                      <small style={{ color: '#ef4444', fontSize: 11, marginTop: 4, display: 'block' }}>
                        * Recipient email was not identified in prompt. Please enter recipient email.
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
                      style={{ minHeight: 130, resize: 'vertical' }}
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
                      {sendingEmail ? 'Sending...' : 'Approve & Send Now'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Trace Panel */}
            <div className="panel glossy-panel">
              <h3 className="panel-title">
                <span>Agent Execution Trace</span>
                <Clock size={16} color="var(--agrica-green)" />
              </h3>

              {trace.length === 0 ? (
                <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.7, padding: '10px 0' }}>
                  <p>When you type an instruction and click <strong>Plan &amp; Draft</strong>, Sendora will display its real-time reasoning here:</p>
                  <ul style={{ paddingLeft: 20, marginTop: 10 }}>
                    <li>1. Instruction extraction</li>
                    <li>2. Target recipient matching</li>
                    <li>3. Natural language drafting</li>
                    <li>4. User confirmation &amp; tool dispatch</li>
                  </ul>
                </div>
              ) : (
                <div>
                  {trace.map((step, idx) => (
                    <div key={idx} className="trace-step">
                      <div className="trace-title">{step.title}</div>
                      <div className="trace-content">{step.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SEPARATE DEDICATED SENT EMAIL HISTORY SECTION */}
      <section id="history" className="homepage-section" style={{ background: 'var(--bg-page)' }}>
        <div className="agrica-nav-container" style={{ display: 'block' }}>
          <div className="section-title-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="services-badge">AUDIT &amp; RECORDS</span>
              <h2 className="services-headline">Sent Email Activity &amp; History</h2>
              <p className="section-subtext">
                Review all emails dispatched through Sendora. Click on any record to inspect the recipient, subject, and status.
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={fetchLogs}
              disabled={loadingLogs}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 13 }}
            >
              <RefreshCw size={14} className={loadingLogs ? 'animate-spin' : ''} />
              <span>Refresh History</span>
            </button>
          </div>

          <div className="history-table-card glossy-panel">
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Mail size={36} color="var(--agrica-green)" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                <p style={{ fontWeight: 600 }}>No sent emails recorded yet.</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Try sending an email using the agent above to see it appear in this history table.</p>
              </div>
            ) : (
              <div className="history-table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Recipient</th>
                      <th>Subject Line</th>
                      <th>Timestamp</th>
                      <th>Sender Identity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <span className={`status-badge ${log.status === 'sent' ? 'badge-sent' : 'badge-failed'}`}>
                            {log.status === 'sent' ? 'Sent' : 'Failed'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-main)' }}>{log.to_email || 'Unspecified'}</strong>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{log.subject || '(No subject)'}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: 'var(--agrica-green)', fontWeight: 600 }}>From Sendora</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 5: CONTACT & CUSTOMER SUPPORT */}
      <section id="contact" className="homepage-section" style={{ background: 'var(--card-bg)' }}>
        <div className="agrica-nav-container" style={{ display: 'block' }}>
          <div className="section-title-wrap">
            <span className="services-badge">DIRECT ASSISTANCE</span>
            <h2 className="services-headline">Contact &amp; Technical Support</h2>
            <p className="section-subtext">
              Have questions or need assistance regarding Sendora email agent operations? Reach out directly.
            </p>
          </div>

          <div className="contact-cards-grid">
            <div className="contact-info-card glossy-panel">
              <div className="contact-icon-circle">
                <Phone size={24} color="#16a34a" />
              </div>
              <h3 className="contact-card-title">Phone Support</h3>
              <p className="contact-card-desc">Call our official helpline directly for urgent issues:</p>
              <a href="tel:9063889100" className="contact-highlight-link">
                +91 9063889100
              </a>
            </div>

            <div className="contact-info-card glossy-panel">
              <div className="contact-icon-circle">
                <Mail size={24} color="#16a34a" />
              </div>
              <h3 className="contact-card-title">Email Inquiries</h3>
              <p className="contact-card-desc">Send us your feedback, bug reports or questions:</p>
              <a href="mailto:kambagirinandan@gmail.com" className="contact-highlight-link">
                kambagirinandan@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: COMPLIANCE, SPAM MITIGATION & LICENSE WARNING */}
      <section className="homepage-section" style={{ background: 'var(--bg-page)', paddingBottom: 60 }}>
        <div className="agrica-nav-container" style={{ display: 'block' }}>
          {/* Deliverability & Inbox Notice */}
          <div className="deliverability-banner glossy-panel">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div className="alert-icon-wrap" style={{ background: 'rgba(22, 163, 74, 0.15)' }}>
                <CheckCircle2 size={24} color="#16a34a" />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                  How to Ensure Emails Land in the Primary Inbox (Not Spam)
                </h4>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Sendora embeds standard compliance headers and authentic HTML formatting. If you or your recipient ever receive a test email in the Spam or Promotions folder on Gmail:
                </p>
                <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div className="inbox-tip-pill">
                    <Check size={14} color="#16a34a" />
                    <span>Click <strong>"Report not spam"</strong> once in Gmail so Google trains your filter</span>
                  </div>
                  <div className="inbox-tip-pill">
                    <Check size={14} color="#16a34a" />
                    <span>Add <code>nandanyadav10@gmail.com</code> to your Google Contacts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* License & Terms Warning */}
          <div className="license-warning-box glossy-panel" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div className="alert-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
                <AlertTriangle size={24} color="#ef4444" />
              </div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: '#dc2626' }}>
                  Legal &amp; Anti-Spam License Warning
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  This application is licensed for lawful correspondence, authenticated customer outreach, and automated transactional workflows under fair use. Bulk unsolicited mailing, phishing, spamming, harassment, and sending without recipient consent are strictly prohibited under CAN-SPAM, GDPR, and Mailjet Acceptable Use Policies. Automated abuse will trigger immediate API revocation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
