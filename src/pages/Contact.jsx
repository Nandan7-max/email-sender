import React, { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <h1 className="page-title">Contact Us</h1>
        <p className="page-lead">
          Have questions or feedback about the MailPilot agent? Drop us a note below.
        </p>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        {submitted ? (
          <div className="alert alert-success">
            Thank you! Your message has been received. Our team will get back to you shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Your Name
              </label>
              <input
                type="text"
                required
                className="preview-input"
                placeholder="Jane Doe"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                required
                className="preview-input"
                placeholder="jane@example.com"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Message
              </label>
              <textarea
                required
                className="preview-input"
                style={{ minHeight: 120 }}
                placeholder="How can we help?"
              />
            </div>

            <button type="submit" className="btn-primary">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
