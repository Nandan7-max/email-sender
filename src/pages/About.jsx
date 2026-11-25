import React from 'react';

export default function About() {
  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div className="page-header">
        <h1 className="page-title">About Sendora</h1>
        <p className="page-lead">
          An autonomous yet controllable email assistant designed to automate communication without compromising accuracy.
        </p>
      </div>

      <div className="panel" style={{ marginTop: 24, lineHeight: 1.7, fontSize: 14 }}>
        <p style={{ marginBottom: 16 }}>
          Sendora was built to bridge natural language understanding with strict real-world reliability. By pairing Google&rsquo;s Agent Development Kit (ADK) and Gemini models with Mailjet&rsquo;s battle-tested HTTP delivery infrastructure, Sendora guarantees that your correspondence is both eloquently drafted and safely dispatched.
        </p>

        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px 0' }}>Core Architectural Pillars</h3>
        <ul style={{ paddingLeft: 20, marginBottom: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Human-in-the-Loop Safeguard:</strong> The agent acts as your planner and copywriter, while you retain final dispatch approval.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Modern HTTP Delivery:</strong> Avoids fragile SMTP ports that are frequently blocked on cloud platforms like Render.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Zero Secrets in the Client:</strong> All API keys, database credentials, and service tokens stay isolated in the Node.js backend.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Persistent Supabase Audit Trail:</strong> Every drafted prompt and status outcome is stored in PostgreSQL for accountability.
          </li>
        </ul>
      </div>
    </div>
  );
}
