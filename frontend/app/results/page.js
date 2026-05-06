'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiDownload, FiArrowLeft, FiTarget } from 'react-icons/fi';

function ScoreRing({ score }) {
  const r = 70, circ = 2 * Math.PI * r;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#4f8ef7' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Poor';
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / 1200, 1);
      setAnimated(Math.round(prog * score));
      if (prog < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  const offset = circ - (animated / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width={180} height={180} viewBox="0 0 180 180">
        <circle cx={90} cy={90} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
        <circle cx={90} cy={90} r={r} fill="none" stroke={color} strokeWidth={12}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 0.1s' }}
        />
        <text x={90} y={84} textAnchor="middle" fill={color} fontSize={36} fontWeight={800} fontFamily="Outfit, sans-serif">{animated}</text>
        <text x={90} y={106} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={13}>/100</text>
      </svg>
      <span style={{ fontSize: 15, fontWeight: 700, color }}>{label}</span>
    </div>
  );
}

function ProgressBar({ label, value, max, color = 'var(--accent-blue)' }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 700 }}>{value}<span style={{ color: 'var(--text-muted)' }}>/{max}</span></span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

const alertIcons = { error: <FiXCircle size={16} />, warning: <FiAlertTriangle size={16} />, success: <FiCheckCircle size={16} />, tip: <FiInfo size={16} /> };
const alertClasses = { error: 'alert-error', warning: 'alert-warning', success: 'alert-success', tip: 'alert-tip' };

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const stored = localStorage.getItem('analysisResult');
    if (!stored) { router.push('/analyzer'); return; }
    setData(JSON.parse(stored));
  }, []);

  const downloadReport = () => {
    window.print();
  };

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 16, flexDirection: 'column' }}>
      <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
      <p style={{ color: 'var(--text-secondary)' }}>Loading results...</p>
    </div>
  );

  const { score, scoreBreakdown: sb, keywordMatchPercent, detectedSkills, missingSkills, suggestions, sections, fileName, wordCount } = data;

  return (
    <main className="page-wrapper">
      <div className="container" ref={printRef}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Link href="/analyzer" className="btn btn-outline btn-sm" style={{ marginBottom: 12 }}>
              <FiArrowLeft size={14} /> Back
            </Link>
            <h1 className="section-title" style={{ fontSize: 28 }}>Analysis <span className="gradient-text">Results</span></h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{fileName} · {wordCount} words</p>
          </div>
          <button onClick={downloadReport} className="btn btn-outline">
            <FiDownload size={16} /> Download Report
          </button>
        </div>

        {/* Score + Breakdown */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h2 className="section-title" style={{ marginBottom: 20, fontSize: 18 }}>ATS Score</h2>
            <ScoreRing score={score} />
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 12 }}>Based on keywords, skills, structure & length</p>
          </div>
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: 20, fontSize: 18 }}>Score Breakdown</h2>
            <ProgressBar label="Keyword Match" value={sb.keywordMatch} max={40} />
            <ProgressBar label="Skills Detected" value={sb.skillsScore} max={30} color="var(--accent-purple)" />
            <ProgressBar label="Resume Structure" value={sb.structureScore} max={20} color="var(--accent-green)" />
            <ProgressBar label="Content Length" value={sb.lengthScore} max={10} color="var(--accent-orange)" />
          </div>
        </div>

        {/* Keyword Match */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiTarget style={{ color: 'var(--accent-blue)' }} /> Keyword Match
            </h2>
            <span className={`badge ${keywordMatchPercent >= 60 ? 'badge-green' : keywordMatchPercent >= 30 ? 'badge-orange' : 'badge-red'}`} style={{ fontSize: 15, padding: '6px 16px' }}>
              {keywordMatchPercent}%
            </span>
          </div>
          <div className="progress-bar" style={{ height: 14, marginBottom: 8 }}>
            <div className="progress-fill" style={{ width: `${keywordMatchPercent}%` }} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {keywordMatchPercent >= 60 ? '✅ Strong keyword alignment with the job description.' : keywordMatchPercent >= 30 ? '⚠️ Moderate match. Add more relevant keywords from the JD.' : '❌ Low match. Tailor your resume closely to the job description.'}
          </p>
        </div>

        {/* Sections Checklist */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Resume Sections</h2>
          <div className="grid-2">
            {Object.entries(sections).map(([key, val]) => {
              const labels = { hasContact: 'Contact Info', hasEducation: 'Education', hasExperience: 'Work Experience', hasSkills: 'Skills Section', hasSummary: 'Professional Summary', hasProjects: 'Projects', hasCertifications: 'Certifications' };
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  {val ? <FiCheckCircle size={16} style={{ color: 'var(--accent-green)' }} /> : <FiXCircle size={16} style={{ color: 'var(--accent-red)' }} />}
                  <span style={{ fontSize: 14, color: val ? 'var(--text-primary)' : 'var(--text-muted)' }}>{labels[key]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>✅ Detected Skills</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>{detectedSkills.length} skills found</p>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {detectedSkills.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No skills detected</p> :
                detectedSkills.slice(0, 30).map((s, i) => <span key={i} className="chip chip-found">{s.name}</span>)}
            </div>
          </div>
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>❌ Missing Skills</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>{missingSkills.length} skills from JD not found</p>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {missingSkills.length === 0 ? <p style={{ color: 'var(--accent-green)', fontSize: 14 }}>No missing skills — great match!</p> :
                missingSkills.slice(0, 20).map((s, i) => (
                  <span key={i} className="chip chip-missing">
                    {s.priority === 'high' && '🔴 '}{s.priority === 'medium' && '🟡 '}{s.name}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>💡 Improvement Suggestions</h2>
          {suggestions.map((s, i) => (
            <div key={i} className={`alert alert-${s.type}`}>
              <span style={{ flexShrink: 0, marginTop: 2 }}>{alertIcons[s.type] || <FiInfo size={16} />}</span>
              <div>
                <span className={`badge badge-${s.type === 'error' ? 'red' : s.type === 'warning' ? 'orange' : s.type === 'success' ? 'green' : 'blue'}`} style={{ fontSize: 11, marginBottom: 4, display: 'inline-block' }}>
                  {s.category}
                </span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{s.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@media print { .btn { display: none !important; } }`}</style>
    </main>
  );
}
