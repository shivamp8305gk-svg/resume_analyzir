'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiUpload, FiFile, FiX, FiSearch, FiBriefcase } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AnalyzerPage() {
  const router = useRouter();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (f) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      toast.error('Only PDF, DOCX, or TXT files allowed'); return;
    }
    if (f.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const analyze = async () => {
    if (!file) { toast.error('Please upload a resume file'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      fd.append('jobDescription', jobDescription);
      fd.append('jobTitle', jobTitle);

      const res = await fetch(`${API}/api/analyze`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      localStorage.setItem('analysisResult', JSON.stringify(data));
      toast.success('Analysis complete!');
      router.push('/results');
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-wrapper">
      <div className="container" style={{ maxWidth: 860 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="section-title" style={{ fontSize: 32 }}>Resume <span className="gradient-text">Analyzer</span></h1>
          <p className="section-subtitle">Upload your resume and optionally paste a job description for targeted analysis.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* File Upload */}
          <div className="card">
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiUpload size={18} style={{ color: 'var(--accent-blue)' }} /> Upload Resume
            </h2>
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              style={{
                border: `2px dashed ${dragging ? 'var(--accent-blue)' : file ? 'var(--accent-green)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: dragging ? 'rgba(79,142,247,0.04)' : file ? 'rgba(16,185,129,0.04)' : 'transparent',
              }}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
              {file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <FiFile size={40} style={{ color: 'var(--accent-green)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{file.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{(file.size / 1024).toFixed(1)} KB</span>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="btn btn-outline btn-sm">
                    <FiX size={14} /> Remove
                  </button>
                </div>
              ) : (
                <div>
                  <FiUpload size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>Drag & drop your resume here</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>or click to browse · PDF, DOCX, TXT · Max 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="card">
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiBriefcase size={18} style={{ color: 'var(--accent-purple)' }} /> Job Description <span className="badge badge-blue" style={{ fontSize: 11 }}>Optional</span>
            </h2>
            <div className="form-group">
              <label>Job Title</label>
              <input className="input" placeholder="e.g. Full Stack Developer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Job Description</label>
              <textarea className="input" style={{ minHeight: 180 }} placeholder="Paste the full job description here for keyword matching and skill gap analysis..." value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
            </div>
          </div>

          {/* Analyze Button */}
          <button onClick={analyze} disabled={loading || !file} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? (
              <><div className="spinner" /> Analyzing Resume...</>
            ) : (
              <><FiSearch size={20} /> Analyze Resume</>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
