import React from 'react';

const POSTS = [
  {
    id: 1,
    tag: 'TIPS & STRATEGY',
    title: 'How to Write Email Prompts that AI Executes Perfectly',
    snippet: 'Learn how to structure your plain-English instructions with clear context, recipient naming, and intended outcomes to make the most of MailPilot.',
    date: 'Nov 2026'
  },
  {
    id: 2,
    tag: 'SECURITY',
    title: 'Why Human-in-the-Loop is Critical for Autonomous AI Agents',
    snippet: 'Autonomous agents are powerful, but when communicating on your behalf, a transparent preview and confirmation gate eliminates embarrassing hallucinations.',
    date: 'Nov 2026'
  },
  {
    id: 3,
    tag: 'DEVELOPMENT',
    title: 'Building Reliable Email Microservices with Mailjet and Supabase',
    snippet: 'A deep dive into why HTTP REST APIs outshine traditional SMTP ports when deploying cloud serverless backends on modern hosting like Render.',
    date: 'Nov 2026'
  }
];

export default function Blog() {
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">MailPilot Journal</h1>
        <p className="page-lead">
          Insights on artificial intelligence, modern email workflows, and human-agent collaboration.
        </p>
      </div>

      <div className="blog-grid">
        {POSTS.map((post) => (
          <article key={post.id} className="blog-card">
            <span className="blog-tag">{post.tag}</span>
            <h2 className="blog-headline">{post.title}</h2>
            <p className="blog-snippet">{post.snippet}</p>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              Published {post.date} · 4 min read
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
