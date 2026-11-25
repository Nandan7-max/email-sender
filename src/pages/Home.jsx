import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Shield, Mail, Zap, Database } from 'lucide-react';

export default function Home() {
  return (
    <div className="agrica-home">
      {/* 1. Full-Width Hero Section with Email 3D Symbol Background matching Agrica Layout */}
      <section className="agrica-hero-slider">
        {/* Left / Right Carousel arrows matching the reference template */}
        <button className="slider-arrow slider-arrow-left" aria-label="Previous Slide">
          <ChevronLeft size={24} />
        </button>
        <button className="slider-arrow slider-arrow-right" aria-label="Next Slide">
          <ChevronRight size={24} />
        </button>

        {/* Hero Background using User's 3D Email Icon with cinematic lighting overlay */}
        <div className="hero-img-backdrop">
          <img 
            src="/email-hero.jpg" 
            alt="Sendora Intelligent Email Infrastructure" 
            className="hero-main-img" 
          />
          <div className="hero-cinematic-overlay"></div>
        </div>

        {/* Centered Hero Content matching the template typography & button */}
        <div className="hero-center-content">
          <h1 className="hero-title-main">Sendora Solution</h1>
          <p className="hero-subtitle-main">
            High-performing AI email agent that keeps your communication intelligent, polished and healthy—while saving you time, manual drafting and energy.
          </p>
          <Link to="/agent" className="agrica-explore-btn">
            <span>Explore Our Services</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* 2. Split Feature Section: "20+ Years / Next-Gen AI" matching the bottom half of the Agrica picture */}
      <section className="agrica-split-section">
        <div className="agrica-split-container">
          {/* Left Column Image with Gold Glow / 3D Icon Accent */}
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

          {/* Right Column Typography matching the template with green vertical bar */}
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
                  <span>Human-in-the-Loop Confirmation</span>
                </div>
                <div className="feature-pill">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Encrypted Mailjet HTTP Transmission</span>
                </div>
                <div className="feature-pill">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Persistent Supabase PostgreSQL Logs</span>
                </div>
              </div>

              <div style={{ marginTop: 28 }}>
                <Link to="/agent" className="agrica-cta-btn" style={{ display: 'inline-flex', padding: '12px 28px', fontSize: 14 }}>
                  <span>Launch Email Agent</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Premium Service Cards */}
      <section className="agrica-services-section">
        <div className="agrica-nav-container">
          <div className="services-header-row">
            <div>
              <span className="services-badge">OUR CAPABILITIES</span>
              <h2 className="services-headline">Intelligent Email Operations</h2>
            </div>
            <Link to="/agent" className="explore-link">
              View Agent Dashboard <ArrowRight size={16} />
            </Link>
          </div>

          <div className="services-grid">
            <div className="service-box">
              <div className="service-icon-wrap">
                <Zap size={24} color="#16a34a" />
              </div>
              <h3 className="service-title">Contextual Prompt Drafting</h3>
              <p className="service-text">
                Give natural instructions like &ldquo;send warm welcome to client@example.com&rdquo;. Sendora formulates a respectful, high-converting letter in seconds.
              </p>
            </div>

            <div className="service-box">
              <div className="service-icon-wrap">
                <Shield size={24} color="#16a34a" />
              </div>
              <h3 className="service-title">Safe Approval Gate</h3>
              <p className="service-text">
                Autonomous doesn't mean uncontrolled. Inspect the agent's step-by-step reasoning and approve or edit before a single byte leaves the server.
              </p>
            </div>

            <div className="service-box">
              <div className="service-icon-wrap">
                <Database size={24} color="#16a34a" />
              </div>
              <h3 className="service-title">Enterprise Audit Records</h3>
              <p className="service-text">
                Every dispatched email, delivery timestamp, recipient metadata and status code is preserved in your secure database.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
