import React from 'react';
import { Link } from 'react-router-dom';
import { Send, ShieldCheck, Database, Zap, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="container">
      {/* Hero Section Matching Leo & Lens layout and styling */}
      <section className="hero-wrapper">
        <div className="hero-card">
          <div className="hero-bg"></div>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-headline">Send Smarter Emails with MailPilot</h1>
            <p className="hero-paragraph">
              Tell our AI agent who to email and what to say. It writes the message, shows you a preview, and sends it for you.
            </p>
            <Link to="/agent" className="hero-btn">
              Try it now
            </Link>
          </div>
          <div className="hero-tagline">
            Join our community of productive senders today
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">1</span>
            <h3 className="step-heading">Provide Simple Context</h3>
            <p className="step-desc">
              Write a simple prompt like &ldquo;send hi to Alex at alex@example.com&rdquo;. No manual drafting required.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">2</span>
            <h3 className="step-heading">Review &amp; Approve</h3>
            <p className="step-desc">
              The AI agent crafts a polished subject and body. You review the preview and approve it before sending.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">3</span>
            <h3 className="step-heading">Dispatched &amp; Logged</h3>
            <p className="step-desc">
              Sent safely via Mailjet HTTP API and automatically preserved in your Supabase database with audit logs.
            </p>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">Why MailPilot?</h2>
        <div className="steps-grid">
          <div className="step-card">
            <Sparkles size={24} color="var(--purple-accent)" style={{ marginBottom: 12 }} />
            <h3 className="step-heading">Google ADK &amp; Gemini</h3>
            <p className="step-desc">
              Leverages advanced reasoning to extract recipients, determine intent, and produce polite prose.
            </p>
          </div>

          <div className="step-card">
            <ShieldCheck size={24} color="var(--purple-accent)" style={{ marginBottom: 12 }} />
            <h3 className="step-heading">Human-In-The-Loop</h3>
            <p className="step-desc">
              Never worry about rogue emails. The agent requests explicit approval before triggering the send tool.
            </p>
          </div>

          <div className="step-card">
            <Database size={24} color="var(--purple-accent)" style={{ marginBottom: 12 }} />
            <h3 className="step-heading">Cloud Database Logging</h3>
            <p className="step-desc">
              Every dispatched message, status response, and timestamp is stored persistently in PostgreSQL via Supabase.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
