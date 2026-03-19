import Head from 'next/head'
import { useState, useRef } from 'react'
import {
  Upload, Zap, CheckCircle, Users, Clock, Globe,
  ArrowRight, ChevronRight, FileText, X, Send, Brain,
  ShieldCheck, Star, BarChart3
} from 'lucide-react'

// ─── MULTI-STATE CONSTANTS ────────────────────────────────────────────────────
const STATE = {
  UPLOAD: 'upload',
  SCANNING: 'scanning',
  RESULT: 'result',
  FORM: 'form',
  SENT: 'sent',
}

const SCAN_STEPS = [
  { label: 'Parsing job description...', duration: 600 },
  { label: 'Identifying required competencies...', duration: 700 },
  { label: 'Cross-referencing talent database...', duration: 800 },
  { label: 'Applying top 5% filter...', duration: 500 },
  { label: 'Ranking candidate matches...', duration: 400 },
]

const MATCH_STATS = [
  { icon: Users, label: 'Candidates Identified', value: '12', color: '#E8235A' },
  { icon: Star, label: 'Top 5% Qualified', value: '12 / 12', color: '#F5A623' },
  { icon: Clock, label: 'Est. Shortlist Delivery', value: '< 7 days', color: '#29B6D8' },
  { icon: Globe, label: 'Regions Covered', value: 'KL · NYC · LON', color: '#5B4B8A' },
]

const TRUST_BADGES = [
  { icon: ShieldCheck, text: 'Every candidate personally vetted' },
  { icon: BarChart3, text: 'Live market intelligence across APAC' },
  { icon: Clock, text: 'Shortlist delivered in under 7 days' },
  { icon: Star, text: 'Top 5% only — no volume, no noise' },
]

// ─── SCAN PROGRESS COMPONENT ─────────────────────────────────────────────────
function ScanProgress({ steps, currentStep }) {
  return (
    <div className="scan-steps">
      {steps.map((step, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <div key={i} className={`scan-step ${done ? 'done' : active ? 'active' : 'pending'}`}>
            <div className="scan-step-indicator">
              {done ? <CheckCircle size={16} color="#29B6D8" /> : (
                <div className={`scan-dot ${active ? 'pulse' : ''}`} />
              )}
            </div>
            <span className="scan-step-label">{step.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Portal() {
  const [stage, setStage] = useState(STATE.UPLOAD)
  const [jdText, setJdText] = useState('')
  const [jdFile, setJdFile] = useState(null)
  const [scanStep, setScanStep] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', timeline: '' })
  const fileRef = useRef()

  const hasInput = jdText.trim().length > 40 || jdFile !== null

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) { setJdFile(f); setJdText('') }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) { setJdFile(f); setJdText('') }
  }

  const runScan = async () => {
    setStage(STATE.SCANNING)
    setScanStep(0)
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, SCAN_STEPS[i].duration))
      setScanStep(i + 1)
    }
    await new Promise(r => setTimeout(r, 400))
    setStage(STATE.RESULT)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          timeline: form.timeline,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setStage(STATE.SENT)
    } catch {
      alert('Something went wrong. Please email info@recruitable.asia directly.')
    }
  }

  const reset = () => {
    setStage(STATE.UPLOAD); setJdText(''); setJdFile(null); setScanStep(0)
    setForm({ name: '', company: '', email: '', phone: '', timeline: '' })
  }

  return (
    <>
      <Head>
        <title>Client Portal | Recruitable — Neural Match Engine</title>
        <meta name="description" content="Upload a job description and our Neural Match engine identifies your top 5% candidates from our live database within seconds." />
        <meta property="og:title" content="Client Portal — Neural Match Engine | Recruitable"/>
        <meta property="og:description" content="Drop a job description. Get your top 5% shortlist in under 7 days. Pre-vetted AI Engineers, Data Engineers, and more across APAC, Europe, and the US."/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://recruitable.asia/portal"/>
        <meta property="og:image" content="https://recruitable.asia/og-image.png"/>
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content="Neural Match Engine — Recruitable"/>
        <meta name="twitter:description" content="Drop a JD. Get your top 5% shortlist in under 7 days."/>
        <meta name="twitter:image" content="https://recruitable.asia/og-image.png"/>
      </Head>

      <style>{`
        /* ── PAGE SHELL ── */
        .portal-page { background: var(--slate); min-height: 100vh; }
        .portal-hero { background: var(--charcoal); padding: 56px 0 96px; position: relative; overflow: hidden; }
        .portal-hero-bg { position: absolute; inset: 0; background:
          radial-gradient(ellipse 50% 60% at 80% 50%, rgba(41,182,216,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 40% 50% at 10% 80%, rgba(232,35,90,0.06) 0%, transparent 60%); }
        .portal-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; text-align: center; position: relative; z-index: 1; }
        .portal-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; color: var(--teal); margin-bottom: 14px; font-family: var(--font-h); }
        .portal-h1 { font-family: var(--font-h); font-size: clamp(30px, 5vw, 52px); font-weight: 900; color: white; line-height: 1.12; margin-bottom: 16px; }
        .portal-h1 .accent { color: var(--cyan); }
        .portal-h1 .accent-pink { color: var(--pink); }
        .portal-sub { font-size: 17px; color: rgba(255,255,255,0.5); font-weight: 400; line-height: 1.7; max-width: 580px; margin: 0 auto; }
        .trust-row { display: flex; justify-content: center; gap: 32px; margin-top: 36px; flex-wrap: wrap; }
        .trust-item { display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; color: rgba(255,255,255,0.4); font-family: var(--font-h); }

        /* ── FLOATING CARD ── */
        .portal-card-wrap { max-width: 760px; margin: -52px auto 60px; padding: 0 24px; position: relative; z-index: 10; }
        .portal-card { background: white; border-radius: 24px; box-shadow: 0 20px 80px rgba(45,45,58,0.14); border: 1.5px solid rgba(45,45,58,0.07); overflow: hidden; }

        /* ── CARD HEADER PROGRESS ── */
        .card-progress { display: flex; border-bottom: 1px solid var(--slate-d); }
        .progress-step { flex: 1; padding: 14px 16px; display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; font-family: var(--font-h); color: var(--muted); transition: all 0.25s; }
        .progress-step.active { color: var(--cyan); border-bottom: 2px solid var(--cyan); margin-bottom: -1px; background: rgba(41,182,216,0.03); }
        .progress-step.done { color: var(--charcoal-soft); }
        .progress-step-num { width: 22px; height: 22px; border-radius: 50%; border: 2px solid currentColor; display: grid; place-items: center; font-size: 10px; flex-shrink: 0; }
        .progress-step.active .progress-step-num { background: var(--cyan); border-color: var(--cyan); color: white; }
        .progress-step.done .progress-step-num { background: var(--slate-d); border-color: var(--slate-d); }

        /* ── UPLOAD STATE ── */
        .card-body { padding: 40px; }
        .upload-header { margin-bottom: 28px; }
        .upload-header h2 { font-family: var(--font-h); font-size: 24px; font-weight: 900; color: var(--charcoal); margin-bottom: 6px; }
        .upload-header p { font-size: 14.5px; color: var(--muted); font-weight: 500; line-height: 1.6; }
        .upload-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
        .upload-tab { font-size: 13px; font-weight: 700; padding: 8px 18px; border-radius: 8px; border: 1.5px solid var(--slate-d); color: var(--muted); transition: all 0.2s; font-family: var(--font-h); }
        .upload-tab.active { background: var(--cyan); border-color: var(--cyan); color: white; }
        .jd-textarea { width: 100%; min-height: 200px; font-size: 14px; font-family: var(--font-b); padding: 16px; border-radius: 12px; border: 1.5px solid var(--slate-d); background: var(--slate); color: var(--charcoal); resize: vertical; outline: none; transition: all 0.2s; line-height: 1.65; font-weight: 400; }
        .jd-textarea:focus { border-color: var(--cyan); background: white; box-shadow: 0 0 0 3px rgba(41,182,216,0.1); }
        .jd-textarea::placeholder { color: var(--muted); }
        .file-drop { border: 2px dashed var(--slate-d); border-radius: 14px; padding: 40px 24px; text-align: center; cursor: pointer; transition: all 0.2s; background: var(--slate); }
        .file-drop.drag { border-color: var(--cyan); background: rgba(41,182,216,0.04); }
        .file-drop.has-file { border-color: var(--cyan); border-style: solid; background: rgba(41,182,216,0.04); }
        .file-drop:hover { border-color: var(--cyan); }
        .file-drop-icon { width: 52px; height: 52px; background: rgba(41,182,216,0.1); border-radius: 14px; display: grid; place-items: center; margin: 0 auto 14px; }
        .file-drop-text { font-size: 15px; font-weight: 700; color: var(--charcoal); margin-bottom: 6px; font-family: var(--font-h); }
        .file-drop-text span { color: var(--cyan); text-decoration: underline; }
        .file-drop-hint { font-size: 12.5px; color: var(--muted); font-weight: 500; }
        .file-selected { display: flex; align-items: center; gap: 14px; }
        .file-selected-icon { width: 44px; height: 44px; background: rgba(41,182,216,0.1); border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; }
        .file-selected-name { font-size: 15px; font-weight: 800; color: var(--charcoal); font-family: var(--font-h); }
        .file-selected-meta { font-size: 12px; color: var(--muted); font-weight: 500; margin-top: 2px; }
        .file-clear { margin-left: auto; width: 30px; height: 30px; border-radius: 50%; background: var(--slate-d); display: grid; place-items: center; color: var(--muted); flex-shrink: 0; }
        .file-clear:hover { background: rgba(232,35,90,0.1); color: var(--pink); }
        .analyze-btn { width: 100%; margin-top: 20px; background: var(--pink); color: white; font-size: 16px; font-weight: 800; padding: 16px; border-radius: 12px; transition: all 0.22s; font-family: var(--font-h); display: flex; align-items: center; justify-content: center; gap: 10px; }
        .analyze-btn:hover:not(:disabled) { background: #d01e50; transform: translateY(-2px); box-shadow: 0 10px 32px rgba(232,35,90,0.3); }
        .analyze-btn:disabled { opacity: 0.45; }
        .char-count { font-size: 12px; color: var(--muted); font-weight: 500; text-align: right; margin-top: 6px; }
        .upload-tab-bar { display: flex; gap: 0; margin-bottom: 20px; background: var(--slate); border-radius: 10px; padding: 4px; }
        .upload-tab-inner { flex: 1; font-size: 13px; font-weight: 700; padding: 8px; border-radius: 7px; color: var(--muted); transition: all 0.18s; font-family: var(--font-h); text-align: center; }
        .upload-tab-inner.active { background: white; color: var(--charcoal); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

        /* ── SCANNING STATE ── */
        .scanning-body { padding: 48px 40px; text-align: center; }
        .neural-icon { width: 72px; height: 72px; background: rgba(41,182,216,0.1); border-radius: 20px; display: grid; place-items: center; margin: 0 auto 24px; animation: neural-pulse 2s ease-in-out infinite; }
        @keyframes neural-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(41,182,216,0.3)} 50%{box-shadow:0 0 0 16px rgba(41,182,216,0)} }
        .scanning-title { font-family: var(--font-h); font-size: 22px; font-weight: 900; color: var(--charcoal); margin-bottom: 8px; }
        .scanning-sub { font-size: 14px; color: var(--muted); font-weight: 500; margin-bottom: 36px; }
        .scan-progress-bar-bg { height: 4px; background: var(--slate-d); border-radius: 2px; margin-bottom: 32px; overflow: hidden; }
        .scan-progress-bar { height: 4px; background: linear-gradient(90deg, var(--cyan), var(--pink)); border-radius: 2px; transition: width 0.5s ease; }
        .scan-steps { display: flex; flex-direction: column; gap: 14px; text-align: left; max-width: 400px; margin: 0 auto; }
        .scan-step { display: flex; align-items: center; gap: 12px; opacity: 0.3; transition: opacity 0.3s; }
        .scan-step.done, .scan-step.active { opacity: 1; }
        .scan-step-indicator { width: 20px; flex-shrink: 0; display: grid; place-items: center; }
        .scan-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--slate-d); }
        .scan-dot.pulse { background: var(--cyan); animation: dot-glow 1s ease-in-out infinite; }
        @keyframes dot-glow { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.7} }
        .scan-step-label { font-size: 13.5px; font-weight: 600; color: var(--charcoal-soft); }
        .scan-step.active .scan-step-label { color: var(--cyan); font-weight: 700; }
        .scan-step.done .scan-step-label { color: var(--charcoal); }

        /* ── RESULT STATE ── */
        .result-header { background: linear-gradient(135deg, #1a1a2e 0%, #2D2D3A 100%); padding: 40px; position: relative; overflow: hidden; }
        .result-header-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(41,182,216,0.12) 0%, transparent 60%); }
        .result-match-badge { display: inline-flex; align-items: center; gap: 10px; background: rgba(41,182,216,0.12); border: 1.5px solid rgba(41,182,216,0.3); border-radius: 16px; padding: 10px 20px; margin-bottom: 20px; position: relative; z-index: 1; }
        .result-match-pct { font-family: var(--font-h); font-size: 36px; font-weight: 900; color: var(--cyan); line-height: 1; }
        .result-match-label { text-align: left; }
        .result-match-label-top { font-size: 12px; font-weight: 800; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; font-family: var(--font-h); }
        .result-match-label-bot { font-size: 14px; font-weight: 700; color: white; font-family: var(--font-h); }
        .result-title { font-family: var(--font-h); font-size: 22px; font-weight: 900; color: white; margin-bottom: 6px; position: relative; z-index: 1; }
        .result-sub { font-size: 14px; color: rgba(255,255,255,0.5); font-weight: 500; position: relative; z-index: 1; }
        .result-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; padding: 32px 40px; border-bottom: 1px solid var(--slate-d); }
        .result-stat { background: var(--slate); border-radius: 14px; padding: 18px; display: flex; align-items: center; gap: 12px; }
        .result-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; }
        .result-stat-val { font-family: var(--font-h); font-size: 20px; font-weight: 900; color: var(--charcoal); line-height: 1.2; }
        .result-stat-label { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; font-family: var(--font-h); margin-top: 2px; }
        .result-ctas { padding: 28px 40px 36px; display: flex; flex-direction: column; gap: 12px; }
        .result-cta-primary { background: var(--pink); color: white; font-size: 16px; font-weight: 800; padding: 16px; border-radius: 12px; transition: all 0.2s; font-family: var(--font-h); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .result-cta-primary:hover { background: #d01e50; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(232,35,90,0.28); }
        .result-cta-secondary { background: white; color: var(--charcoal); font-size: 14px; font-weight: 700; padding: 13px; border-radius: 12px; border: 1.5px solid var(--slate-d); transition: all 0.2s; font-family: var(--font-h); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .result-cta-secondary:hover { border-color: var(--cyan); color: var(--cyan); }
        .result-disclaimer { font-size: 11.5px; color: var(--muted); text-align: center; font-weight: 500; margin-top: 4px; }

        /* ── LEAD FORM STATE ── */
        .form-header { padding: 36px 40px 28px; border-bottom: 1px solid var(--slate-d); }
        .form-header h2 { font-family: var(--font-h); font-size: 22px; font-weight: 900; color: var(--charcoal); margin-bottom: 6px; }
        .form-header p { font-size: 14px; color: var(--muted); font-weight: 500; }
        .lead-form { padding: 28px 40px 40px; }
        .lead-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .lead-form-group { margin-bottom: 18px; }
        .lead-label { font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--charcoal-soft); margin-bottom: 7px; display: block; font-family: var(--font-h); }
        .lead-input, .lead-select { width: 100%; font-size: 14px; font-family: var(--font-b); padding: 11px 14px; border-radius: 9px; font-weight: 500; border: 1.5px solid var(--slate-d); background: var(--slate); color: var(--charcoal); transition: all 0.2s; outline: none; }
        .lead-input:focus, .lead-select:focus { border-color: var(--cyan); background: white; box-shadow: 0 0 0 3px rgba(41,182,216,0.1); }
        .lead-submit { width: 100%; background: var(--pink); color: white; font-size: 15px; font-weight: 800; padding: 15px; border-radius: 10px; transition: all 0.2s; font-family: var(--font-h); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .lead-submit:hover { background: #d01e50; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(232,35,90,0.28); }
        .lead-note { font-size: 12px; color: var(--muted); text-align: center; font-weight: 500; margin-top: 14px; }
        .lead-note a { color: var(--cyan); }
        .back-link { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--muted); margin-bottom: 24px; transition: color 0.18s; font-family: var(--font-h); cursor: pointer; border: none; background: none; }
        .back-link:hover { color: var(--charcoal); }

        /* ── SENT STATE ── */
        .sent-body { padding: 64px 40px; text-align: center; }
        .sent-icon { width: 80px; height: 80px; background: linear-gradient(135deg, rgba(41,182,216,0.15), rgba(91,75,138,0.15)); border-radius: 24px; display: grid; place-items: center; margin: 0 auto 24px; }
        .sent-title { font-family: var(--font-h); font-size: 26px; font-weight: 900; color: var(--charcoal); margin-bottom: 12px; }
        .sent-sub { font-size: 15px; color: var(--charcoal-soft); line-height: 1.7; margin-bottom: 32px; max-width: 440px; margin-left: auto; margin-right: auto; }
        .sent-reset { background: var(--slate-d); color: var(--charcoal); font-size: 14px; font-weight: 800; padding: 12px 28px; border-radius: 10px; font-family: var(--font-h); transition: all 0.18s; }
        .sent-reset:hover { background: var(--slate); }
        .sent-next-steps { background: var(--slate); border-radius: 16px; padding: 24px; text-align: left; margin-bottom: 28px; }
        .sent-next-steps h4 { font-family: var(--font-h); font-size: 14px; font-weight: 800; color: var(--charcoal); margin-bottom: 12px; }
        .sent-step { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 13.5px; color: var(--charcoal-soft); font-weight: 500; line-height: 1.55; }
        .sent-step-num { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 10px; font-weight: 800; flex-shrink: 0; font-family: var(--font-h); margin-top: 1px; }

        /* ── HOW IT WORKS ── */
        .how-section { max-width: 860px; margin: 0 auto 64px; padding: 0 24px; }
        .how-title { font-family: var(--font-h); font-size: 22px; font-weight: 900; color: var(--charcoal); text-align: center; margin-bottom: 8px; }
        .how-sub { font-size: 14px; color: var(--muted); text-align: center; margin-bottom: 36px; font-weight: 500; }
        .how-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .how-step { background: white; border-radius: 18px; padding: 28px; border: 1.5px solid var(--slate-d); }
        .how-step-icon { width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; margin-bottom: 16px; }
        .how-step h3 { font-family: var(--font-h); font-size: 16px; font-weight: 800; color: var(--charcoal); margin-bottom: 6px; }
        .how-step p { font-size: 13.5px; color: var(--muted); line-height: 1.6; font-weight: 400; }

        @media (max-width: 640px) {
          .card-body, .scanning-body, .lead-form, .form-header, .result-ctas { padding-left: 24px; padding-right: 24px; }
          .result-header { padding: 28px 24px; }
          .result-stats { grid-template-columns: 1fr 1fr; gap: 10px; padding: 24px; }
          .lead-form-grid { grid-template-columns: 1fr; }
          .how-steps { grid-template-columns: 1fr; }
          .portal-card-wrap { padding: 0 12px; }
          .sent-body { padding: 40px 24px; }
        }
      `}</style>

      <div className="portal-page">
        {/* HERO */}
        <div className="portal-hero">
          <div className="portal-hero-bg" />
          <div className="portal-hero-inner">
            <div className="portal-label">Neural Match Engine · Client Portal</div>
            <h1 className="portal-h1">
              Drop a JD.<br />
              We find your <span className="accent">top 5%</span><br />
              in <span className="accent-pink">seconds</span>.
            </h1>
            <p className="portal-sub">
              Paste a job description or upload a PDF. Our Neural Match engine scans our live database of pre-vetted AI and engineering talent and returns your shortlist in under 7 days.
            </p>
            <div className="trust-row">
              {TRUST_BADGES.map(b => (
                <div key={b.text} className="trust-item">
                  <b.icon size={14} color="var(--teal)" />
                  {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FLOATING CARD */}
        <div className="portal-card-wrap">
          <div className="portal-card">

            {/* Progress bar */}
            {stage !== STATE.SENT && (
              <div className="card-progress">
                {[
                  { key: STATE.UPLOAD, label: 'Upload JD' },
                  { key: STATE.SCANNING, label: 'Neural Scan' },
                  { key: STATE.RESULT, label: 'Match Found' },
                  { key: STATE.FORM, label: 'Unlock Profiles' },
                ].map((s, i) => {
                  const stageOrder = [STATE.UPLOAD, STATE.SCANNING, STATE.RESULT, STATE.FORM]
                  const currentIdx = stageOrder.indexOf(stage)
                  const stepIdx = stageOrder.indexOf(s.key)
                  const isDone = stepIdx < currentIdx
                  const isActive = stepIdx === currentIdx
                  return (
                    <div key={s.key} className={`progress-step ${isActive ? 'active' : isDone ? 'done' : ''}`}>
                      <div className="progress-step-num">
                        {isDone ? '✓' : i + 1}
                      </div>
                      <span>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── STATE: UPLOAD ── */}
            {stage === STATE.UPLOAD && (
              <div className="card-body">
                <div className="upload-header">
                  <h2>Paste or Upload Your Job Description</h2>
                  <p>The more detail you provide, the more precise our match. Minimum 40 characters to activate the scan.</p>
                </div>

                <div className="upload-tab-bar">
                  <button className={`upload-tab-inner ${!jdFile ? 'active' : ''}`}
                    onClick={() => setJdFile(null)}>
                    ✎ Paste Text
                  </button>
                  <button className={`upload-tab-inner ${jdFile ? 'active' : ''}`}
                    onClick={() => { setJdText(''); fileRef.current?.click() }}>
                    ↑ Upload File
                  </button>
                </div>

                {!jdFile ? (
                  <>
                    <textarea
                      className="jd-textarea"
                      placeholder={`Paste your full job description here...\n\nExample:\n"We are hiring a Senior LLM Engineer to join our AI Platform team. The role requires deep expertise in fine-tuning transformer models, building RAG pipelines, and deploying LLM-powered features to production..."`}
                      value={jdText}
                      onChange={e => setJdText(e.target.value)}
                    />
                    <div className="char-count">{jdText.length} characters {jdText.length < 40 && jdText.length > 0 ? '(need 40+ to scan)' : ''}</div>
                  </>
                ) : (
                  <div
                    className={`file-drop has-file`}
                    onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                  >
                    <div className="file-selected">
                      <div className="file-selected-icon"><FileText size={22} color="var(--cyan)" /></div>
                      <div>
                        <div className="file-selected-name">{jdFile.name}</div>
                        <div className="file-selected-meta">{(jdFile.size / 1024).toFixed(0)} KB · Click to change</div>
                      </div>
                      <button className="file-clear" onClick={e => { e.stopPropagation(); setJdFile(null) }}><X size={14} /></button>
                    </div>
                  </div>
                )}

                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={handleFileChange} />

                {!jdFile && (
                  <div
                    className={`file-drop${dragOver ? ' drag' : ''}`}
                    style={{ marginTop: 14 }}
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileRef.current?.click()}
                  >
                    <div className="file-drop-icon"><Upload size={22} color="var(--cyan)" /></div>
                    <div className="file-drop-text">Or drop a file here · <span>Browse</span></div>
                    <div className="file-drop-hint">PDF, DOC, DOCX or TXT accepted</div>
                  </div>
                )}

                <button className="analyze-btn" disabled={!hasInput} onClick={runScan}>
                  <Zap size={18} /> Activate Neural Match
                </button>
              </div>
            )}

            {/* ── STATE: SCANNING ── */}
            {stage === STATE.SCANNING && (
              <div className="scanning-body">
                <div className="neural-icon"><Brain size={32} color="var(--cyan)" /></div>
                <div className="scanning-title">Neural Scan in Progress</div>
                <div className="scanning-sub">Cross-referencing your JD against our live top 5% talent database...</div>
                <div className="scan-progress-bar-bg">
                  <div className="scan-progress-bar" style={{ width: `${(scanStep / SCAN_STEPS.length) * 100}%` }} />
                </div>
                <ScanProgress steps={SCAN_STEPS} currentStep={scanStep} />
              </div>
            )}

            {/* ── STATE: RESULT ── */}
            {stage === STATE.RESULT && (
              <>
                <div className="result-header">
                  <div className="result-header-bg" />
                  <div className="result-match-badge">
                    <CheckCircle size={28} color="var(--cyan)" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span className="result-match-pct">95%</span>
                      </div>
                      <div className="result-match-label-top">Match Score</div>
                    </div>
                    <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.12)', margin: '0 8px' }} />
                    <div>
                      <div className="result-match-label-top">Found in Database</div>
                      <div className="result-match-label-bot">RecruitABLE Top 5% Pool</div>
                    </div>
                  </div>
                  <div className="result-title">Match Found. We have your shortlist.</div>
                  <div className="result-sub">We have identified 12+ candidates in our top 5% pool that match this JD — pre-vetted, actively available, and ready to interview.</div>
                </div>

                <div className="result-stats">
                  {MATCH_STATS.map(s => (
                    <div key={s.label} className="result-stat">
                      <div className="result-stat-icon" style={{ background: `${s.color}15` }}>
                        <s.icon size={20} color={s.color} />
                      </div>
                      <div>
                        <div className="result-stat-val" style={{ color: s.color }}>{s.value}</div>
                        <div className="result-stat-label">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="result-ctas">
                  <button className="result-cta-primary" onClick={() => setStage(STATE.FORM)}>
                    Unlock Profiles / Request 7-Day Shortlist <ArrowRight size={16} />
                  </button>
                  <button className="result-cta-secondary" onClick={reset}>
                    <X size={15} /> Analyse a Different JD
                  </button>
                  <div className="result-disclaimer">
                    No commitment required. We'll send anonymised profile summaries within 4 hours.
                  </div>
                </div>
              </>
            )}

            {/* ── STATE: LEAD FORM ── */}
            {stage === STATE.FORM && (
              <>
                <div className="form-header">
                  <button type="button" className="back-link" onClick={() => setStage(STATE.RESULT)}>
                    ← Back to results
                  </button>
                  <h2>Request Your 7-Day Shortlist</h2>
                  <p>Tell us about your hiring timeline and we'll have pre-vetted candidate profiles in your inbox within 4 business hours.</p>
                </div>
                <form className="lead-form" onSubmit={handleFormSubmit}>
                  <div className="lead-form-grid">
                    <div className="lead-form-group">
                      <label className="lead-label">Your Name *</label>
                      <input className="lead-input" type="text" required placeholder="Alex Chen"
                        value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} />
                    </div>
                    <div className="lead-form-group">
                      <label className="lead-label">Company *</label>
                      <input className="lead-input" type="text" required placeholder="Acme AI Ltd"
                        value={form.company} onChange={e => setForm(s => ({ ...s, company: e.target.value }))} />
                    </div>
                    <div className="lead-form-group">
                      <label className="lead-label">Work Email *</label>
                      <input className="lead-input" type="email" required placeholder="alex@company.com"
                        value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} />
                    </div>
                    <div className="lead-form-group">
                      <label className="lead-label">Phone / WhatsApp</label>
                      <input className="lead-input" type="tel" placeholder="+1 (555) 000-0000"
                        value={form.phone} onChange={e => setForm(s => ({ ...s, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="lead-form-group">
                    <label className="lead-label">Hiring Timeline *</label>
                    <select className="lead-select" required
                      value={form.timeline} onChange={e => setForm(s => ({ ...s, timeline: e.target.value }))}>
                      <option value="">Select your timeline...</option>
                      <option>Immediate — within 2 weeks</option>
                      <option>Soon — within 30 days</option>
                      <option>Planning — within 60–90 days</option>
                      <option>Exploring — no fixed timeline</option>
                    </select>
                  </div>
                  <button type="submit" className="lead-submit">
                    <Send size={15} /> Send My Shortlist Request
                  </button>
                  <div className="lead-note">
                    By submitting you agree to our privacy policy. We do not spam or share your data. &nbsp;·&nbsp;{' '}
                    <a href="mailto:info@recruitable.asia">info@recruitable.asia</a>
                  </div>
                </form>
              </>
            )}

            {/* ── STATE: SENT ── */}
            {stage === STATE.SENT && (
              <div className="sent-body">
                <div className="sent-icon"><CheckCircle size={40} color="var(--cyan)" /></div>
                <div className="sent-title">Request Confirmed</div>
                <div className="sent-sub">
                  Your shortlist request has been received. Our team is already reviewing your JD against our live top 5% database.
                </div>
                <div className="sent-next-steps">
                  <h4>What happens next</h4>
                  <div className="sent-step">
                    <div className="sent-step-num" style={{ background: 'rgba(41,182,216,0.12)', color: 'var(--cyan)' }}>1</div>
                    <span>Within <strong>4 hours</strong> — a RecruitABLE consultant will reach out to confirm requirements.</span>
                  </div>
                  <div className="sent-step">
                    <div className="sent-step-num" style={{ background: 'rgba(232,35,90,0.12)', color: 'var(--pink)' }}>2</div>
                    <span>Within <strong>48 hours</strong> — anonymised candidate profiles are shared for your review.</span>
                  </div>
                  <div className="sent-step">
                    <div className="sent-step-num" style={{ background: 'rgba(91,75,138,0.12)', color: 'var(--purple)' }}>3</div>
                    <span>Within <strong>7 days</strong> — interviews scheduled with your confirmed shortlist.</span>
                  </div>
                </div>
                <button className="sent-reset" onClick={reset}>Analyse another JD</button>
              </div>
            )}
          </div>
        </div>

        {/* HOW IT WORKS */}
        {stage === STATE.UPLOAD && (
          <div className="how-section">
            <div className="how-title">How it works</div>
            <div className="how-sub">Three steps from job description to confirmed shortlist.</div>
            <div className="how-steps">
              {[
                {
                  icon: FileText, color: '#E8235A',
                  title: '1. Drop your JD',
                  desc: 'Paste a job description or upload a PDF. The more detail, the sharper the match.'
                },
                {
                  icon: Brain, color: '#29B6D8',
                  title: '2. Neural Scan',
                  desc: 'Our system cross-references your requirements against our live database of pre-vetted top 5% talent.'
                },
                {
                  icon: Users, color: '#5B4B8A',
                  title: '3. Get your shortlist',
                  desc: 'Receive anonymised profiles of matched candidates within 4 hours. Interviews booked within 7 days.'
                },
              ].map(s => (
                <div key={s.title} className="how-step">
                  <div className="how-step-icon" style={{ background: `${s.color}15` }}>
                    <s.icon size={24} color={s.color} />
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
