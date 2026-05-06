'use client';
import Link from 'next/link';
import { FiUpload, FiFileText, FiTrendingUp, FiCheckCircle, FiArrowRight, FiStar } from 'react-icons/fi';

const features = [
  { icon: <FiUpload size={24} />, title: 'Upload Resume', desc: 'Upload PDF or DOCX. We extract and analyze text instantly.' },
  { icon: <FiFileText size={24} />, title: 'JD Matching', desc: 'Paste any job description and see how well your resume matches.' },
  { icon: <FiTrendingUp size={24} />, title: 'Smart Scoring', desc: 'Get a detailed 0–100 ATS score with keyword, skills, and structure breakdown.' },
  { icon: <FiCheckCircle size={24} />, title: 'Resume Builder', desc: 'Build an ATS-optimized resume from scratch with guided forms.' },
];

const stats = [
  { value: '10K+', label: 'Resumes Analyzed' },
  { value: '85%', label: 'Interview Rate Boost' },
  { value: '200+', label: 'Skills Detected' },
  { value: '100%', label: 'Free to Use' },
];

export default function HomePage() {
  return (
    <main className="page-wrapper">
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(79,142,247,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }} className="animate-fade-up">
          <span className="badge badge-blue" style={{ marginBottom: 20 }}>
            <FiStar size={12} /> AI-Powered Resume Analysis
          </span>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}>
            Land Your Dream Job<br />
            <span className="gradient-text">With a Perfect Resume</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Upload your resume, paste the job description, and get instant AI analysis with ATS score, skill gaps, keyword matching, and improvement tips.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/analyzer" className="btn btn-primary btn-lg">
              <FiUpload size={18} /> Analyze My Resume
            </Link>
            <Link href="/builder" className="btn btn-outline btn-lg">
              <FiFileText size={18} /> Build a Resume
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container" style={{ marginBottom: 60 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {stats.map((s, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800 }} className="gradient-text">{s.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container" style={{ marginBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="section-title" style={{ fontSize: 36 }}>Everything You Need</h2>
          <p className="section-subtitle" style={{ fontSize: 16 }}>Powerful tools to build, analyze, and optimize your resume</p>
        </div>
        <div className="grid-2">
          {features.map((f, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container" style={{ marginBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="section-title" style={{ fontSize: 36 }}>How It Works</h2>
        </div>
        <div className="grid-3">
          {[
            { step: '01', title: 'Upload Resume', desc: 'Upload your PDF or DOCX resume file.' },
            { step: '02', title: 'Add Job Description', desc: 'Paste the job description you\'re targeting.' },
            { step: '03', title: 'Get Results', desc: 'Receive your ATS score, skill gaps, and tips.' },
          ].map((step, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '36px 24px' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 48, fontWeight: 900, marginBottom: 16 }} className="gradient-text">{step.step}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ marginBottom: 40 }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(79,142,247,0.2)', textAlign: 'center', padding: '60px 40px' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Ready to Get Hired?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>Start analyzing your resume for free — no account required.</p>
          <Link href="/analyzer" className="btn btn-primary btn-lg">
            Get Started Free <FiArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
}
