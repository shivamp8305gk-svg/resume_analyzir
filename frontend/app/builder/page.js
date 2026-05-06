'use client';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { FiUser, FiBriefcase, FiBook, FiCode, FiAward, FiPlus, FiTrash2, FiDownload, FiEye } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const emptyExp = () => ({ company: '', position: '', startDate: '', endDate: '', current: false, location: '', description: [''] });
const emptyEdu = () => ({ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', achievements: [] });
const emptyProj = () => ({ name: '', description: '', techStack: [], link: '', github: '' });
const emptyCert = () => ({ name: '', issuer: '', date: '', link: '' });

const initialData = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '', jobTitle: '' },
  summary: '',
  experience: [emptyExp()],
  education: [emptyEdu()],
  skills: { technical: [], soft: [], languages: [], tools: [] },
  projects: [],
  certifications: [],
};

function InputField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input className="input" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || label} />
    </div>
  );
}

function TagInput({ label, values, onChange }) {
  const [inp, setInp] = useState('');
  const add = () => {
    const v = inp.trim();
    if (v && !values.includes(v)) { onChange([...values, v]); setInp(''); }
  };
  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input className="input" value={inp} onChange={e => setInp(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={`Add ${label.toLowerCase()} and press Enter`} style={{ flex: 1 }} />
        <button type="button" className="btn btn-primary btn-sm" onClick={add}>Add</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {values.map((v, i) => (
          <span key={i} className="chip chip-found" style={{ cursor: 'pointer' }}
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}>
            {v} ✕
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Resume Preview (ATS-friendly, single-column) ────────────────────────────
function ResumePreview({ data }) {
  const { personalInfo: p, summary, experience, education, skills, projects, certifications } = data;
  const s = {
    page: { background: '#fff', color: '#1a1a1a', fontFamily: 'Arial, sans-serif', fontSize: 11, lineHeight: 1.4, padding: '32px 36px', maxWidth: 740, margin: '0 auto', minHeight: 980 },
    name: { fontSize: 22, fontWeight: 700, marginBottom: 2, color: '#1a1a1a' },
    title: { fontSize: 13, color: '#4f8ef7', marginBottom: 8, fontWeight: 600 },
    contact: { fontSize: 10, color: '#555', display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginBottom: 16, borderBottom: '2px solid #4f8ef7', paddingBottom: 10 },
    sectionHead: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4f8ef7', borderBottom: '1px solid #e0e0e0', paddingBottom: 4, marginTop: 16, marginBottom: 8 },
    item: { marginBottom: 10 },
    itemHead: { display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 11 },
    itemSub: { color: '#555', fontSize: 10, marginBottom: 4 },
    bullet: { margin: '2px 0', paddingLeft: 16, position: 'relative', fontSize: 10, color: '#333' },
    skillGroup: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 },
    skillChip: { background: '#f0f4ff', color: '#2d5be3', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 },
  };

  return (
    <div style={s.page} id="resume-preview">
      <div style={s.name}>{p.fullName || 'Your Name'}</div>
      {p.jobTitle && <div style={s.title}>{p.jobTitle}</div>}
      <div style={s.contact}>
        {p.email && <span>✉ {p.email}</span>}
        {p.phone && <span>📞 {p.phone}</span>}
        {p.location && <span>📍 {p.location}</span>}
        {p.linkedin && <span>LinkedIn: {p.linkedin}</span>}
        {p.github && <span>GitHub: {p.github}</span>}
        {p.website && <span>🌐 {p.website}</span>}
      </div>
      {summary && (<><div style={s.sectionHead}>Professional Summary</div><p style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 0 }}>{summary}</p></>)}
      {experience.some(e => e.company) && (
        <><div style={s.sectionHead}>Work Experience</div>
          {experience.filter(e => e.company).map((e, i) => (
            <div key={i} style={s.item}>
              <div style={s.itemHead}><span>{e.position}</span><span style={{ fontSize: 10, fontWeight: 400 }}>{e.startDate}{e.startDate && ' – '}{e.current ? 'Present' : e.endDate}</span></div>
              <div style={s.itemSub}>{e.company}{e.location && ` · ${e.location}`}</div>
              {e.description.filter(Boolean).map((d, di) => <div key={di} style={s.bullet}>• {d}</div>)}
            </div>
          ))}
        </>
      )}
      {education.some(e => e.institution) && (
        <><div style={s.sectionHead}>Education</div>
          {education.filter(e => e.institution).map((e, i) => (
            <div key={i} style={s.item}>
              <div style={s.itemHead}><span>{e.degree}{e.field && ` in ${e.field}`}</span><span style={{ fontSize: 10, fontWeight: 400 }}>{e.startDate}{e.startDate && ' – '}{e.endDate}</span></div>
              <div style={s.itemSub}>{e.institution}{e.gpa && ` · GPA: ${e.gpa}`}</div>
            </div>
          ))}
        </>
      )}
      {(skills.technical.length > 0 || skills.soft.length > 0 || skills.tools.length > 0) && (
        <><div style={s.sectionHead}>Skills</div>
          {skills.technical.length > 0 && <div style={{ marginBottom: 4 }}><b style={{ fontSize: 10 }}>Technical: </b><div style={s.skillGroup}>{skills.technical.map((sk, i) => <span key={i} style={s.skillChip}>{sk}</span>)}</div></div>}
          {skills.tools.length > 0 && <div style={{ marginBottom: 4 }}><b style={{ fontSize: 10 }}>Tools: </b><div style={s.skillGroup}>{skills.tools.map((sk, i) => <span key={i} style={s.skillChip}>{sk}</span>)}</div></div>}
          {skills.soft.length > 0 && <div><b style={{ fontSize: 10 }}>Soft Skills: </b><div style={s.skillGroup}>{skills.soft.map((sk, i) => <span key={i} style={s.skillChip}>{sk}</span>)}</div></div>}
        </>
      )}
      {projects.some(pr => pr.name) && (
        <><div style={s.sectionHead}>Projects</div>
          {projects.filter(pr => pr.name).map((pr, i) => (
            <div key={i} style={s.item}>
              <div style={s.itemHead}><span>{pr.name}</span>{pr.link && <span style={{ fontSize: 10, fontWeight: 400 }}>{pr.link}</span>}</div>
              {pr.description && <div style={{ ...s.bullet, paddingLeft: 0 }}>{pr.description}</div>}
              {pr.techStack.length > 0 && <div style={{ fontSize: 10, color: '#4f8ef7', marginTop: 2 }}>Stack: {pr.techStack.join(', ')}</div>}
            </div>
          ))}
        </>
      )}
      {certifications.some(c => c.name) && (
        <><div style={s.sectionHead}>Certifications</div>
          {certifications.filter(c => c.name).map((c, i) => (
            <div key={i} style={{ ...s.item, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 10 }}>{c.name}{c.issuer && ` — ${c.issuer}`}</span>
              <span style={{ fontSize: 10, color: '#555' }}>{c.date}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default function BuilderPage() {
  const [formData, setFormData] = useState(initialData);
  const [activeTab, setActiveTab] = useState('personal');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const updatePersonal = (field, val) => setFormData(d => ({ ...d, personalInfo: { ...d.personalInfo, [field]: val } }));
  const updateSkills = (cat, val) => setFormData(d => ({ ...d, skills: { ...d.skills, [cat]: val } }));

  const updateExp = (i, field, val) => setFormData(d => {
    const exp = [...d.experience];
    exp[i] = { ...exp[i], [field]: val };
    return { ...d, experience: exp };
  });
  const addExp = () => setFormData(d => ({ ...d, experience: [...d.experience, emptyExp()] }));
  const removeExp = (i) => setFormData(d => ({ ...d, experience: d.experience.filter((_, idx) => idx !== i) }));

  const updateEdu = (i, field, val) => setFormData(d => {
    const edu = [...d.education];
    edu[i] = { ...edu[i], [field]: val };
    return { ...d, education: edu };
  });
  const addEdu = () => setFormData(d => ({ ...d, education: [...d.education, emptyEdu()] }));
  const removeEdu = (i) => setFormData(d => ({ ...d, education: d.education.filter((_, idx) => idx !== i) }));

  const updateProj = (i, field, val) => setFormData(d => {
    const projs = [...d.projects];
    projs[i] = { ...projs[i], [field]: val };
    return { ...d, projects: projs };
  });
  const addProj = () => setFormData(d => ({ ...d, projects: [...d.projects, emptyProj()] }));
  const removeProj = (i) => setFormData(d => ({ ...d, projects: d.projects.filter((_, idx) => idx !== i) }));

  const updateCert = (i, field, val) => setFormData(d => {
    const certs = [...d.certifications];
    certs[i] = { ...certs[i], [field]: val };
    return { ...d, certifications: certs };
  });
  const addCert = () => setFormData(d => ({ ...d, certifications: [...d.certifications, emptyCert()] }));
  const removeCert = (i) => setFormData(d => ({ ...d, certifications: d.certifications.filter((_, idx) => idx !== i) }));

  const downloadPDF = () => {
    const el = document.getElementById('resume-preview');
    if (!el) return;
    const clone = el.cloneNode(true);
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Resume</title><style>body{margin:0;padding:0;}</style></head><body>${clone.outerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  const saveResume = async () => {
    if (!formData.personalInfo.fullName) { toast.error('Full name is required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/builder/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Resume saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <FiUser size={14} /> },
    { id: 'experience', label: 'Experience', icon: <FiBriefcase size={14} /> },
    { id: 'education', label: 'Education', icon: <FiBook size={14} /> },
    { id: 'skills', label: 'Skills', icon: <FiCode size={14} /> },
    { id: 'projects', label: 'Projects', icon: <FiCode size={14} /> },
    { id: 'certifications', label: 'Certs', icon: <FiAward size={14} /> },
  ];

  return (
    <main className="page-wrapper">
      <div className="container" style={{ maxWidth: 1100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="section-title" style={{ fontSize: 30 }}>Resume <span className="gradient-text">Builder</span></h1>
            <p className="section-subtitle">Fill in the form to generate an ATS-optimized resume</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setPreview(!preview)} className="btn btn-outline">
              <FiEye size={15} /> {preview ? 'Hide' : 'Preview'}
            </button>
            <button onClick={saveResume} disabled={saving} className="btn btn-outline">
              {saving ? <div className="spinner" /> : null} Save
            </button>
            <button onClick={downloadPDF} className="btn btn-primary">
              <FiDownload size={15} /> Download PDF
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: preview ? '1fr 1fr' : '1fr', gap: 24 }}>
          {/* Form */}
          <div>
            <div className="tab-nav" style={{ overflowX: 'auto' }}>
              {tabs.map(t => (
                <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div className="card">
              {/* Personal Info */}
              {activeTab === 'personal' && (
                <div>
                  <h3 className="section-title" style={{ fontSize: 18, marginBottom: 20 }}>Personal Information</h3>
                  <div className="form-row">
                    <InputField label="Full Name *" value={formData.personalInfo.fullName} onChange={v => updatePersonal('fullName', v)} />
                    <InputField label="Job Title" value={formData.personalInfo.jobTitle} onChange={v => updatePersonal('jobTitle', v)} placeholder="e.g. Full Stack Developer" />
                  </div>
                  <div className="form-row">
                    <InputField label="Email *" type="email" value={formData.personalInfo.email} onChange={v => updatePersonal('email', v)} />
                    <InputField label="Phone" value={formData.personalInfo.phone} onChange={v => updatePersonal('phone', v)} />
                  </div>
                  <div className="form-row">
                    <InputField label="Location" value={formData.personalInfo.location} onChange={v => updatePersonal('location', v)} placeholder="City, Country" />
                    <InputField label="Website" value={formData.personalInfo.website} onChange={v => updatePersonal('website', v)} placeholder="https://" />
                  </div>
                  <div className="form-row">
                    <InputField label="LinkedIn" value={formData.personalInfo.linkedin} onChange={v => updatePersonal('linkedin', v)} placeholder="linkedin.com/in/username" />
                    <InputField label="GitHub" value={formData.personalInfo.github} onChange={v => updatePersonal('github', v)} placeholder="github.com/username" />
                  </div>
                  <div className="form-group">
                    <label>Professional Summary</label>
                    <textarea className="input" rows={4} value={formData.summary} onChange={e => setFormData(d => ({ ...d, summary: e.target.value }))} placeholder="Write 2-3 sentences about your background, skills, and career goals..." />
                  </div>
                </div>
              )}

              {/* Experience */}
              {activeTab === 'experience' && (
                <div>
                  <h3 className="section-title" style={{ fontSize: 18, marginBottom: 20 }}>Work Experience</h3>
                  {formData.experience.map((exp, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20, position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>Experience {i + 1}</span>
                        {formData.experience.length > 1 && <button onClick={() => removeExp(i)} className="btn btn-sm" style={{ color: 'var(--accent-red)', background: 'rgba(239,68,68,0.08)', border: 'none' }}><FiTrash2 size={14} /></button>}
                      </div>
                      <div className="form-row">
                        <InputField label="Job Title" value={exp.position} onChange={v => updateExp(i, 'position', v)} />
                        <InputField label="Company" value={exp.company} onChange={v => updateExp(i, 'company', v)} />
                      </div>
                      <div className="form-row">
                        <InputField label="Start Date" value={exp.startDate} onChange={v => updateExp(i, 'startDate', v)} placeholder="Jan 2022" />
                        <InputField label="End Date" value={exp.endDate} onChange={v => updateExp(i, 'endDate', v)} placeholder="Dec 2023 or Present" />
                      </div>
                      <InputField label="Location" value={exp.location} onChange={v => updateExp(i, 'location', v)} placeholder="City, Country" />
                      <div className="form-group">
                        <label>Responsibilities / Achievements</label>
                        {exp.description.map((d, di) => (
                          <div key={di} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <input className="input" value={d} onChange={e => { const desc = [...exp.description]; desc[di] = e.target.value; updateExp(i, 'description', desc); }} placeholder={`• Bullet point ${di + 1} (start with action verb)`} />
                            {exp.description.length > 1 && <button onClick={() => { const desc = exp.description.filter((_, idx) => idx !== di); updateExp(i, 'description', desc); }} style={{ color: 'var(--accent-red)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>}
                          </div>
                        ))}
                        <button className="btn btn-outline btn-sm" onClick={() => updateExp(i, 'description', [...exp.description, ''])}><FiPlus size={12} /> Add Bullet</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={addExp} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}><FiPlus size={15} /> Add Experience</button>
                </div>
              )}

              {/* Education */}
              {activeTab === 'education' && (
                <div>
                  <h3 className="section-title" style={{ fontSize: 18, marginBottom: 20 }}>Education</h3>
                  {formData.education.map((edu, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>Education {i + 1}</span>
                        {formData.education.length > 1 && <button onClick={() => removeEdu(i)} className="btn btn-sm" style={{ color: 'var(--accent-red)', background: 'rgba(239,68,68,0.08)', border: 'none' }}><FiTrash2 size={14} /></button>}
                      </div>
                      <InputField label="Institution" value={edu.institution} onChange={v => updateEdu(i, 'institution', v)} placeholder="University / College name" />
                      <div className="form-row">
                        <InputField label="Degree" value={edu.degree} onChange={v => updateEdu(i, 'degree', v)} placeholder="B.Tech / B.Sc / MBA" />
                        <InputField label="Field of Study" value={edu.field} onChange={v => updateEdu(i, 'field', v)} placeholder="Computer Science" />
                      </div>
                      <div className="form-row">
                        <InputField label="Start Year" value={edu.startDate} onChange={v => updateEdu(i, 'startDate', v)} placeholder="2019" />
                        <InputField label="End Year" value={edu.endDate} onChange={v => updateEdu(i, 'endDate', v)} placeholder="2023" />
                      </div>
                      <InputField label="GPA / Percentage" value={edu.gpa} onChange={v => updateEdu(i, 'gpa', v)} placeholder="8.5 / 10 or 85%" />
                    </div>
                  ))}
                  <button onClick={addEdu} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}><FiPlus size={15} /> Add Education</button>
                </div>
              )}

              {/* Skills */}
              {activeTab === 'skills' && (
                <div>
                  <h3 className="section-title" style={{ fontSize: 18, marginBottom: 20 }}>Skills</h3>
                  <TagInput label="Technical Skills" values={formData.skills.technical} onChange={v => updateSkills('technical', v)} />
                  <TagInput label="Tools & Platforms" values={formData.skills.tools} onChange={v => updateSkills('tools', v)} />
                  <TagInput label="Soft Skills" values={formData.skills.soft} onChange={v => updateSkills('soft', v)} />
                  <TagInput label="Languages (Programming)" values={formData.skills.languages} onChange={v => updateSkills('languages', v)} />
                </div>
              )}

              {/* Projects */}
              {activeTab === 'projects' && (
                <div>
                  <h3 className="section-title" style={{ fontSize: 18, marginBottom: 20 }}>Projects</h3>
                  {formData.projects.map((proj, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>Project {i + 1}</span>
                        <button onClick={() => removeProj(i)} className="btn btn-sm" style={{ color: 'var(--accent-red)', background: 'rgba(239,68,68,0.08)', border: 'none' }}><FiTrash2 size={14} /></button>
                      </div>
                      <InputField label="Project Name" value={proj.name} onChange={v => updateProj(i, 'name', v)} />
                      <div className="form-group">
                        <label>Description</label>
                        <textarea className="input" rows={3} value={proj.description} onChange={e => updateProj(i, 'description', e.target.value)} placeholder="What did you build? What problem did it solve?" />
                      </div>
                      <TagInput label="Tech Stack" values={proj.techStack} onChange={v => updateProj(i, 'techStack', v)} />
                      <div className="form-row">
                        <InputField label="Live URL" value={proj.link} onChange={v => updateProj(i, 'link', v)} placeholder="https://" />
                        <InputField label="GitHub URL" value={proj.github} onChange={v => updateProj(i, 'github', v)} placeholder="github.com/..." />
                      </div>
                    </div>
                  ))}
                  <button onClick={addProj} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}><FiPlus size={15} /> Add Project</button>
                </div>
              )}

              {/* Certifications */}
              {activeTab === 'certifications' && (
                <div>
                  <h3 className="section-title" style={{ fontSize: 18, marginBottom: 20 }}>Certifications</h3>
                  {formData.certifications.map((cert, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>Certification {i + 1}</span>
                        <button onClick={() => removeCert(i)} className="btn btn-sm" style={{ color: 'var(--accent-red)', background: 'rgba(239,68,68,0.08)', border: 'none' }}><FiTrash2 size={14} /></button>
                      </div>
                      <InputField label="Certification Name" value={cert.name} onChange={v => updateCert(i, 'name', v)} placeholder="AWS Certified Developer" />
                      <div className="form-row">
                        <InputField label="Issuing Organization" value={cert.issuer} onChange={v => updateCert(i, 'issuer', v)} placeholder="Amazon Web Services" />
                        <InputField label="Issue Date" value={cert.date} onChange={v => updateCert(i, 'date', v)} placeholder="Jan 2024" />
                      </div>
                      <InputField label="Credential URL" value={cert.link} onChange={v => updateCert(i, 'link', v)} placeholder="https://..." />
                    </div>
                  ))}
                  <button onClick={addCert} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}><FiPlus size={15} /> Add Certification</button>
                </div>
              )}
            </div>
          </div>

          {/* Preview panel */}
          {preview && (
            <div>
              <div style={{ position: 'sticky', top: 80 }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 600 }}>LIVE PREVIEW</p>
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', maxHeight: '80vh', overflowY: 'auto' }}>
                  <ResumePreview data={formData} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
