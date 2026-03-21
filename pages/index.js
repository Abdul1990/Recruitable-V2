import Head from 'next/head'
import { useState } from 'react'

// Brand colors from logo: Pink #E91E8C | Orange #F7941D | Cyan #29ABE2 | Purple #6B4C9A | Yellow #FFC107 | Dark #2D2D44
// Background: White | Tagline: "Explore, connect and get hired"

const DOMAINS = [
  { id:'forward', tag:'Bridge Role', title:'Forward Deployment Engineering', desc:'The rarest hybrid in AI: engineers who implement complex AI products directly into client infrastructure. Equal parts field engineer, solutions architect, and AI practitioner — the critical gap between selling AI and deploying it.', skills:['Full-Stack Dev','Cloud Infra','Field DevOps','LLM Integration','Customer Success','Enterprise SaaS'], color:'#E91E8C', accent:'#F7941D', highlight:true },
  { id:'llm', tag:'AI/ML', title:'LLM Engineering', desc:'Fine-tuning foundational models and architecting RAG-based enterprise agents that move beyond demo into production.', skills:['LangChain','PyTorch','RAG','Prompt Eng.','RLHF'], color:'#29ABE2', accent:'#6B4C9A' },
  { id:'datascience', tag:'AI/ML', title:'Data Science & AI', desc:'Building predictive models that transform complex raw data into reliable business intelligence at scale.', skills:['Python','Scikit-Learn','SQL','Spark','Statistical Modelling'], color:'#6B4C9A', accent:'#E91E8C' },
  { id:'mlops', tag:'AI/ML', title:'MLOps', desc:'Automating the full lifecycle of high-concurrency model deployment — from experiment to production SLA.', skills:['Kubeflow','SageMaker','Docker','CI/CD','Monitoring'], color:'#F7941D', accent:'#FFC107' },
  { id:'software', tag:'Engineering', title:'Software Engineering', desc:'Scaling high-availability backend and frontend systems for global fintechs, SaaS platforms, and AI-native companies.', skills:['NodeJS','React','Go','Rust','Postgres'], color:'#29ABE2', accent:'#6B4C9A' },
  { id:'cloud', tag:'Engineering', title:'Cloud Architecture', desc:'Architecting the infrastructure backbone for APAC and US data centres — resilient, scalable, cost-optimised.', skills:['AWS','Azure','GCP','Kubernetes','Terraform'], color:'#6B4C9A', accent:'#29ABE2' },
]

const HUBS = [
  { city:'Kuala Lumpur', code:'KL', role:'Engine Room', desc:'Our operational headquarters and primary talent pipeline. Home to the largest concentration of vetted AI and engineering talent in Southeast Asia.', stats:[{label:'Talent Pool',val:'8,400+'},{label:'Avg. Fill Time',val:'< 7 days'}], primary:true, color:'#E91E8C' },
  { city:'New York City', code:'NYC', role:'Strategic Frontier', desc:"Bridging top-tier APAC talent to the world's most competitive AI and fintech companies on the US East Coast.", stats:[{label:'US Clients',val:'35+'},{label:'Time Zone',val:'ET'}], primary:false, color:'#29ABE2' },
  { city:'London', code:'LON', role:'Strategic Frontier', desc:'Connecting European scale-ups and global enterprises with pre-vetted specialists across the APAC region.', stats:[{label:'EU Clients',val:'20+'},{label:'Time Zone',val:'GMT'}], primary:false, color:'#6B4C9A' },
]

const INSIGHTS = [
  { label:'Market Shift', tag:'AI Roles', color:'#E91E8C', title:'Forward Deployment Engineers: The $400K hire nobody trained for', desc:'AI companies are discovering that selling a product is easy — deploying it inside a Fortune 500 is not. We break down the anatomy of this emerging role.' },
  { label:'APAC Report', tag:'Talent Market', color:'#29ABE2', title:'Why Malaysia is winning the APAC AI talent war', desc:'English fluency, world-class STEM output, and cost arbitrage is making KL the preferred hiring hub for global AI companies.' },
  { label:'Hiring Guide', tag:'Process', color:'#6B4C9A', title:'The top 5% filter: How we screen LLM engineers differently', desc:'Our vetting protocol is built around live system design, production artefact review, and domain depth interviews — not keyword matching.' },
]

const RADAR_DATA = [
  { label:'Data Science', val:95, angle:-90, color:'#E91E8C' },
  { label:'AI / ML', val:100, angle:-18, color:'#F7941D' },
  { label:'LLM Ops', val:90, angle:54, color:'#29ABE2' },
  { label:'Fwd. Deploy', val:95, angle:126, color:'#6B4C9A' },
  { label:'Software Eng.', val:85, angle:198, color:'#FFC107' },
]

function RadarChart() {
  const cx = 130, cy = 130, r = 90
  const toXY = (angle, pct) => {
    const rad = (angle * Math.PI) / 180
    return { x: cx + (pct/100)*r*Math.cos(rad), y: cy + (pct/100)*r*Math.sin(rad) }
  }
  const polygon = RADAR_DATA.map(d => { const p = toXY(d.angle, d.val); return `${p.x},${p.y}` }).join(' ')
  return (
    <svg viewBox="0 0 260 260" style={{ width:'100%', maxWidth:260 }}>
      <defs>
        <linearGradient id="rf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E91E8C" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#29ABE2" stopOpacity="0.18"/>
        </linearGradient>
      </defs>
      {[25,50,75,100].map(ring => {
        const pts = RADAR_DATA.map(d => { const p = toXY(d.angle, ring); return `${p.x},${p.y}` }).join(' ')
        return <polygon key={ring} points={pts} fill="none" stroke="rgba(45,45,68,0.1)" strokeWidth="1"/>
      })}
      {RADAR_DATA.map(d => {
        const o = toXY(d.angle, 100)
        return <line key={d.label} x1={cx} y1={cy} x2={o.x} y2={o.y} stroke="rgba(45,45,68,0.08)" strokeWidth="1"/>
      })}
      <polygon points={polygon} fill="url(#rf)" stroke="#E91E8C" strokeWidth="2" strokeLinejoin="round"/>
      {RADAR_DATA.map(d => {
        const p = toXY(d.angle, d.val)
        return <circle key={d.label} cx={p.x} cy={p.y} r={5} fill={d.color} stroke="white" strokeWidth="2"/>
      })}
      {RADAR_DATA.map(d => {
        const p = toXY(d.angle, 118)
        const anchor = p.x < cx-10 ? 'end' : p.x > cx+10 ? 'start' : 'middle'
        return <text key={d.label} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="central" fontSize="9" fontFamily="Nunito, sans-serif" fill="#2D2D44" fontWeight="600" opacity="0.65">{d.label}</text>
      })}
      <text x={cx} y={cy-7} textAnchor="middle" fontSize="15" fontFamily="Nunito, sans-serif" fill="#E91E8C" fontWeight="700">Top</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize="10" fontFamily="Nunito, sans-serif" fill="#2D2D44" fontWeight="600" opacity="0.45">5% only</text>
    </svg>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('AI')
  const [form, setForm] = useState({ name:'', company:'', domain:'', message:'', status:'idle' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setForm(s => ({ ...s, status:'sending' }))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, company: form.company, domain: form.domain, message: form.message }),
      })
      if (!res.ok) throw new Error('Failed')
      setForm(s => ({ ...s, status:'sent' }))
    } catch {
      setForm(s => ({ ...s, status:'idle' }))
      alert('Something went wrong. Please email info@recruitable.asia directly.')
    }
  }

  const CSS = `
    /* Page-specific styles only — global styles are in Layout.js */
    :root {
      --pink:#E8235A; --pink-l:#ff3d6b;
      --orange:#F5A623; --cyan:#29B6D8; --cyan-d:#1a9ab8;
      --purple:#5B4B8A; --yellow:#FFC107;
      --dark:#2D2D3A; --dark-l:#5a5a7a;
      --off:#F4F6FB; --off2:#E8ECF4;
      --muted:#8A8A9E; --border:rgba(45,45,58,0.11);
      --ease:cubic-bezier(0.4,0,0.2,1);
    }
    .hero{min-height:calc(100vh - 84px);display:flex;align-items:center;padding:72px 0 80px;position:relative;overflow:hidden;background:var(--off)}
    .hero-blobs{position:absolute;inset:0;overflow:hidden;pointer-events:none}
    .blob{position:absolute;border-radius:50%;filter:blur(90px);opacity:0.1}
    .hero-inner{max-width:1200px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 400px;gap:72px;align-items:center;position:relative;z-index:1}
    .hero-badge{display:inline-flex;align-items:center;gap:8px;background:white;border:1.5px solid rgba(232,35,90,0.22);color:var(--pink);font-size:11.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:7px 16px;border-radius:24px;margin-bottom:24px;box-shadow:0 2px 12px rgba(232,35,90,0.1)}
    .badge-dot{width:7px;height:7px;border-radius:50%;background:var(--pink);animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
    .hero-tagline{font-size:18px;color:var(--cyan);font-style:italic;margin-bottom:14px;font-family:'Nunito',sans-serif;font-weight:600}
    .hero-h1{font-size:clamp(34px,5vw,60px);font-weight:900;line-height:1.1;letter-spacing:-.02em;margin-bottom:22px;color:var(--dark);font-family:'Nunito',sans-serif}
    .c-pink{color:var(--pink)}.c-cyan{color:var(--cyan)}.c-orange{color:var(--orange)}.c-purple{color:var(--purple)}
    .hero-desc{font-size:17px;color:var(--muted);max-width:520px;line-height:1.7;margin-bottom:36px}
    .hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:52px}
    .btn-pink{background:var(--pink);color:white;font-size:15px;font-weight:700;padding:13px 28px;border-radius:8px;transition:all .2s;box-shadow:0 4px 16px rgba(232,35,90,0.22);font-family:'Nunito',sans-serif}
    .btn-pink:hover{background:var(--pink-l);transform:translateY(-2px);box-shadow:0 8px 24px rgba(232,35,90,0.35)}
    .btn-outline{background:white;color:var(--dark);font-size:15px;font-weight:600;padding:13px 28px;border-radius:8px;border:1.5px solid var(--border);transition:all .2s;font-family:'Nunito',sans-serif}
    .btn-outline:hover{border-color:var(--cyan);color:var(--cyan)}
    .hero-stats{display:flex;flex-wrap:wrap;gap:0}
    .hero-stat{padding:0 28px 0 0}
    .hero-stat+.hero-stat{border-left:1px solid var(--border);padding-left:28px}
    .stat-val{font-size:28px;font-weight:900;line-height:1;font-family:'Nunito',sans-serif}
    .stat-lbl{font-size:11.5px;color:var(--muted);margin-top:5px;font-weight:500}
    .radar-card{background:white;border:1.5px solid var(--border);border-radius:24px;padding:28px 24px;box-shadow:0 8px 40px rgba(45,45,58,0.07)}
    .radar-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:16px;text-align:center;font-family:'Nunito',sans-serif}
    .radar-legend{margin-top:18px;display:flex;flex-direction:column;gap:9px}
    .rl-item{display:flex;align-items:center;justify-content:space-between;font-size:12px}
    .rl-label{color:var(--dark);display:flex;align-items:center;gap:8px;font-weight:500}
    .rl-bar-bg{width:70px;height:4px;background:var(--off2);border-radius:2px;overflow:hidden}
    .rl-bar{height:4px;border-radius:2px}
    .rl-pct{font-weight:700;font-size:11px;min-width:32px;text-align:right;font-family:'Nunito',sans-serif}
    .section{padding:100px 0}
    .si{max-width:1200px;margin:0 auto;padding:0 24px}
    .eyebrow{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.16em;margin-bottom:14px;display:inline-flex;align-items:center;gap:8px;font-family:'Nunito',sans-serif}
    .eyebrow-bar{width:24px;height:2.5px;border-radius:1px}
    .section-h2{font-size:clamp(28px,4vw,44px);font-weight:900;line-height:1.15;margin-bottom:16px;letter-spacing:-.01em;color:var(--dark);font-family:'Nunito',sans-serif}
    .section-desc{font-size:16.5px;color:var(--muted);max-width:580px;line-height:1.7;margin-bottom:48px}
    .stripe{height:5px;background:linear-gradient(90deg,#E8235A 0%,#F5A623 25%,#FFC107 50%,#29B6D8 75%,#5B4B8A 100%)}
    .domains-bg{background:var(--off);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
    .domain-tabs{display:flex;gap:8px;margin-bottom:40px}
    .dtab{padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;border:1.5px solid var(--border);color:var(--muted);transition:all .2s;font-family:'Nunito',sans-serif}
    .dtab:hover:not(.ap):not(.ac){border-color:var(--dark);color:var(--dark)}
    .ap{background:var(--pink);border-color:var(--pink);color:white}
    .ac{background:var(--cyan);border-color:var(--cyan);color:white}
    .domains-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px}
    .dcard{background:white;border:1.5px solid var(--border);border-radius:18px;padding:28px;position:relative;overflow:hidden;transition:all .25s var(--ease)}
    .dcard:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(45,45,58,0.11)}
    .dcard.feat{border-color:rgba(232,35,90,0.22);background:linear-gradient(135deg,#fff5f8 0%,white 60%);grid-column:1/-1}
    .dcard.feat:hover{box-shadow:0 16px 48px rgba(232,35,90,0.13)}
    .dcard-stripe{position:absolute;top:0;left:0;right:0;height:3px;border-radius:18px 18px 0 0}
    .dcard-inner{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
    .dtag{display:inline-flex;align-items:center;font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:14px;margin-bottom:16px;font-family:'Nunito',sans-serif}
    .tb{background:rgba(232,35,90,0.08);color:var(--pink);border:1px solid rgba(232,35,90,0.2)}
    .ta{background:rgba(41,182,216,0.08);color:var(--cyan-d);border:1px solid rgba(41,182,216,0.2)}
    .te{background:rgba(91,75,138,0.08);color:var(--purple);border:1px solid rgba(91,75,138,0.2)}
    .dcard h3{font-size:21px;font-weight:800;margin-bottom:12px;line-height:1.25;color:var(--dark);font-family:'Nunito',sans-serif}
    .dcard p{font-size:14.5px;color:var(--muted);line-height:1.65;margin-bottom:20px}
    .skills{display:flex;flex-wrap:wrap;gap:7px}
    .sp{font-size:11.5px;font-weight:600;padding:5px 12px;border-radius:12px;background:var(--off2);color:var(--dark-l);border:1px solid rgba(45,45,58,0.08);font-family:'Nunito',sans-serif}
    .sp-pk{background:rgba(232,35,90,0.08);color:var(--pink);border-color:rgba(232,35,90,0.15)}
    .feat-flag{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--pink);font-weight:700;background:rgba(232,35,90,0.08);border:1px solid rgba(232,35,90,0.18);padding:5px 12px;border-radius:12px;margin-bottom:14px;font-family:'Nunito',sans-serif}
    .hubs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:28px}
    .hub-card{background:white;border:1.5px solid var(--border);border-radius:20px;padding:32px;transition:all .25s;position:relative;overflow:hidden}
    .hub-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(45,45,58,0.1)}
    .hub-stripe{position:absolute;top:0;left:0;right:0;height:4px;border-radius:20px 20px 0 0}
    .hub-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
    .hub-code{font-size:46px;font-weight:900;line-height:1;letter-spacing:-.02em;opacity:.15;font-family:'Nunito',sans-serif}
    .hub-pill{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:14px;font-family:'Nunito',sans-serif}
    .pe{background:rgba(232,35,90,0.08);color:var(--pink);border:1px solid rgba(232,35,90,0.2)}
    .pf{background:var(--off2);color:var(--muted);border:1px solid var(--border)}
    .hub-city{font-size:22px;font-weight:800;color:var(--dark);margin-bottom:10px;font-family:'Nunito',sans-serif}
    .hub-desc{font-size:14px;color:var(--muted);line-height:1.65;margin-bottom:22px}
    .hub-stats{display:flex;gap:24px}
    .hsv{font-size:22px;font-weight:900;line-height:1;font-family:'Nunito',sans-serif}
    .hsl{font-size:11px;color:var(--muted);margin-top:4px;font-weight:500}
    .tz-bar{background:var(--dark);color:rgba(255,255,255,.7);border-radius:12px;padding:16px 24px;font-size:13.5px;display:flex;align-items:center;gap:14px}
    .tz-bar strong{color:white}
    .insights-bg{background:var(--off)}
    .insights-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .icard{background:white;border:1.5px solid var(--border);border-radius:18px;padding:32px;display:flex;flex-direction:column;transition:all .25s;position:relative;overflow:hidden}
    .icard:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(45,45,58,0.09)}
    .icard-stripe{position:absolute;top:0;left:0;right:0;height:3px;border-radius:18px 18px 0 0}
    .icard-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
    .icard-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);font-family:'Nunito',sans-serif}
    .icard-tag{font-size:10px;font-weight:700;padding:4px 10px;border-radius:10px;background:var(--off2);color:var(--dark-l);font-family:'Nunito',sans-serif}
    .icard h3{font-size:17px;font-weight:800;line-height:1.35;margin-bottom:10px;color:var(--dark);font-family:'Nunito',sans-serif}
    .icard p{font-size:14px;color:var(--muted);line-height:1.65;flex:1;margin-bottom:22px}
    .icard-link{font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:5px;font-family:'Nunito',sans-serif}
    .contact-grid{display:grid;grid-template-columns:1fr 1.1fr;gap:72px;align-items:start}
    .email-block{margin:28px 0;padding:22px;background:var(--off);border-radius:14px;border:1.5px solid var(--border)}
    .email-lbl{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:6px;font-family:'Nunito',sans-serif}
    .email-val{font-size:19px;font-weight:700;color:var(--pink);font-family:'Nunito',sans-serif}
    .cmeta{display:flex;flex-direction:column;gap:16px}
    .cmeta-item{display:flex;align-items:flex-start;gap:14px}
    .cmeta-icon{width:36px;height:36px;border-radius:10px;background:var(--off2);display:grid;place-items:center;font-size:16px;flex-shrink:0}
    .cmeta-lbl{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--muted);font-family:'Nunito',sans-serif}
    .cmeta-val{font-size:14.5px;font-weight:600;color:var(--dark);margin-top:2px}
    .form-card{background:white;border-radius:24px;padding:40px;border:1.5px solid var(--border);box-shadow:0 12px 48px rgba(45,45,58,0.07)}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .fg{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
    .fl{font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-family:'Nunito',sans-serif}
    .fi,.fs,.ft{border:1.5px solid var(--border);border-radius:10px;padding:11px 14px;font-size:14.5px;font-family:'Nunito Sans',system-ui,sans-serif;color:var(--dark);background:var(--off);outline:none;transition:border-color .18s;width:100%}
    .fi:focus,.fs:focus,.ft:focus{border-color:var(--pink);background:white;box-shadow:0 0 0 3px rgba(232,35,90,0.1)}
    .ft{resize:vertical;min-height:110px}
    .fsub{width:100%;padding:14px;background:var(--pink);color:white;font-size:15px;font-weight:700;border-radius:10px;transition:all .2s;margin-top:4px;cursor:pointer;border:none;font-family:'Nunito',sans-serif}
    .fsub:hover:not(:disabled){background:var(--pink-l);transform:translateY(-2px);box-shadow:0 8px 24px rgba(232,35,90,0.35)}
    .fsub:disabled{opacity:.6;cursor:not-allowed}
    .form-ok{text-align:center;padding:40px 20px}
    .form-ok-circle{width:64px;height:64px;background:rgba(41,182,216,0.1);border-radius:50%;display:grid;place-items:center;font-size:28px;margin:0 auto 20px;border:2px solid rgba(41,182,216,0.25);color:var(--cyan)}
    .form-ok h3{font-size:22px;font-weight:800;color:var(--dark);margin-bottom:10px;font-family:'Nunito',sans-serif}
    .form-ok p{color:var(--muted);line-height:1.6}
    @media(max-width:960px){
      .hero-inner{grid-template-columns:1fr}.radar-card{display:none}
      .hubs-grid{grid-template-columns:1fr}.insights-grid{grid-template-columns:1fr}
      .contact-grid{grid-template-columns:1fr;gap:48px}
      .dcard.feat .dcard-inner{grid-template-columns:1fr}
    }
    @media(max-width:768px){
      .domains-grid{grid-template-columns:1fr}.dcard.feat{grid-column:auto}
      .form-grid{grid-template-columns:1fr}.section{padding:72px 0}
      .hero{padding:48px 0 64px}
    }
  `

  return (
    <>
      <Head>
        <title>RECRUITABLE | Explore, Connect and Get Hired — KL · NYC · LON</title>
        <meta name="description" content="Specialist recruitment for AI, LLM Engineering, Data Science, MLOps, and Software Engineering across APAC. Pre-vetted top 5% talent. Hire in under 7 days."/>
      </Head>
      <style>{CSS}</style>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-blobs">
          <div className="blob" style={{width:600,height:600,background:'#E91E8C',top:'-15%',right:'-8%'}}/>
          <div className="blob" style={{width:500,height:500,background:'#29ABE2',bottom:'-15%',left:'-8%'}}/>
          <div className="blob" style={{width:320,height:320,background:'#6B4C9A',top:'35%',left:'38%'}}/>
        </div>
        <div className="hero-inner">
          <div>
            <div className="hero-badge"><span className="badge-dot"/>Top 5% Specialist Talent · APAC-Wide</div>
            <p className="hero-tagline">Explore, connect and get hired.</p>
            <h1 className="hero-h1">We recruit the <span className="c-pink">engineers</span><br/>building tomorrow&apos;s <span className="c-cyan">AI</span> companies</h1>
            <p className="hero-desc">RecruitABLE connects the world&apos;s most demanding technology companies with pre-vetted specialists in AI/ML, LLM Engineering, Data Science, and Forward Deployment — in under 7 days.</p>
            <div className="hero-actions">
              <a href="#contact" className="btn-pink">Start a Search →</a>
              <a href="#domains" className="btn-outline">Our Specialisations</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><div className="stat-val c-pink">&lt; 7</div><div className="stat-lbl">Days to place</div></div>
              <div className="hero-stat"><div className="stat-val c-cyan">Top 5%</div><div className="stat-lbl">Vetted only</div></div>
              <div className="hero-stat"><div className="stat-val c-purple">3</div><div className="stat-lbl">Global hubs</div></div>
              <div className="hero-stat"><div className="stat-val c-orange">5</div><div className="stat-lbl">Core domains</div></div>
            </div>
          </div>
          <div className="radar-card">
            <div className="radar-title">Technical Vetting Benchmark — Top 5% Threshold</div>
            <RadarChart/>
            <div className="radar-legend">
              {RADAR_DATA.map(d => (
                <div key={d.label} className="rl-item">
                  <span className="rl-label">
                    <span style={{width:8,height:8,borderRadius:'50%',background:d.color,display:'inline-block',flexShrink:0}}/>
                    {d.label}
                  </span>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div className="rl-bar-bg"><div className="rl-bar" style={{width:`${d.val}%`,background:d.color}}/></div>
                    <span className="rl-pct" style={{color:d.color}}>{d.val}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="stripe"/>

      {/* SPECIALISATION */}
      <section className="section domains-bg" id="domains">
        <div className="si">
          <div className="eyebrow" style={{color:'#E91E8C'}}><span className="eyebrow-bar" style={{background:'#E91E8C'}}/>Specialisation</div>
          <h2 className="section-h2">Specialists in the roles <span className="c-pink">that matter</span></h2>
          <p className="section-desc">We do not generalise. Every placement sits within one of five high-signal domains where we maintain deep, live market intelligence across APAC and beyond.</p>
          <div className="domain-tabs">
            <button className={`dtab${activeTab==='AI'?' ap':''}`} onClick={()=>setActiveTab('AI')}>AI / ML &amp; LLM</button>
            <button className={`dtab${activeTab==='Engineering'?' ac':''}`} onClick={()=>setActiveTab('Engineering')}>Engineering</button>
          </div>
          <div className="domains-grid">
            {activeTab==='AI' && (
              <div className="dcard feat">
                <div className="dcard-stripe" style={{background:'linear-gradient(90deg,#E91E8C,#F7941D)'}}/>
                <div className="dcard-inner">
                  <div>
                    <div className="feat-flag">★ Fastest Growing Role in AI</div>
                    <div className="dtag tb">Bridge Role</div>
                    <h3>Forward Deployment Engineering</h3>
                    <p>The rarest hybrid in the AI industry: engineers who implement complex AI products directly into client infrastructure. Equal parts field engineer, solutions architect, and AI practitioner — this is the critical gap between selling AI and deploying it at scale.</p>
                  </div>
                  <div>
                    <p style={{fontSize:14,color:'var(--muted)',marginBottom:20,lineHeight:1.7}}>We have mapped this emerging discipline since 2022. Our candidates have shipped production AI at tier-1 SaaS companies, global fintechs, and AI-native startups across SEA and the US.</p>
                    <div className="skills">{['Full-Stack Dev','Cloud Infra','Field DevOps','LLM Integration','Customer Success','Enterprise SaaS'].map(s=><span className="sp sp-pk" key={s}>{s}</span>)}</div>
                  </div>
                </div>
              </div>
            )}
            {(activeTab==='AI'?DOMAINS.filter(d=>d.id!=='forward'&&d.tag==='AI/ML'):DOMAINS.filter(d=>d.tag==='Engineering')).map(d=>(
              <div className="dcard" key={d.id}>
                <div className="dcard-stripe" style={{background:`linear-gradient(90deg,${d.color},${d.accent})`}}/>
                <div className={`dtag ${d.tag==='AI/ML'?'ta':'te'}`}>{d.tag}</div>
                <h3>{d.title}</h3><p>{d.desc}</p>
                <div className="skills">{d.skills.map(s=><span className="sp" key={s}>{s}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="stripe" style={{background:'linear-gradient(90deg,#6B4C9A,#29ABE2,#FFC107)'}}/>

      {/* GLOBAL HUBS */}
      <section className="section" id="hubs">
        <div className="si">
          <div className="eyebrow" style={{color:'#29ABE2'}}><span className="eyebrow-bar" style={{background:'#29ABE2'}}/>Global Hubs</div>
          <h2 className="section-h2">Where we <span className="c-cyan">operate</span></h2>
          <p className="section-desc">Three anchor points, one mission. Kuala Lumpur is our talent engine — New York and London are where we place them.</p>
          <div className="hubs-grid">
            {HUBS.map(hub=>(
              <div key={hub.city} className="hub-card">
                <div className="hub-stripe" style={{background:hub.color}}/>
                <div className="hub-top">
                  <span className="hub-code" style={{color:hub.color}}>{hub.code}</span>
                  <span className={`hub-pill ${hub.primary?'pe':'pf'}`}>{hub.role}</span>
                </div>
                <div className="hub-city">{hub.city}</div>
                <p className="hub-desc">{hub.desc}</p>
                <div className="hub-stats">{hub.stats.map(s=><div key={s.label}><div className="hsv" style={{color:hub.color}}>{s.val}</div><div className="hsl">{s.label}</div></div>)}</div>
              </div>
            ))}
          </div>
          <div className="tz-bar">
            <span style={{fontSize:20}}>🌐</span>
            <span><strong>Follow-the-sun coverage:</strong> KL (GMT+8) · London (GMT/BST) · New York (ET) — seamless hiring support across every major time zone.</span>
          </div>
        </div>
      </section>

      {/* MARKET INSIGHTS */}
      <section className="section insights-bg" id="insights">
        <div className="si">
          <div className="eyebrow" style={{color:'#6B4C9A'}}><span className="eyebrow-bar" style={{background:'#6B4C9A'}}/>Market Insights</div>
          <h2 className="section-h2">Intelligence from the <span className="c-purple">front line</span></h2>
          <p className="section-desc">We publish what we see — not what sounds good. Candid market intelligence from active placements across APAC, US, and Europe.</p>
          <div className="insights-grid">
            {INSIGHTS.map(ins=>(
              <div key={ins.title} className="icard">
                <div className="icard-stripe" style={{background:ins.color}}/>
                <div className="icard-meta"><span className="icard-lbl">{ins.label}</span><span className="icard-tag">{ins.tag}</span></div>
                <h3>{ins.title}</h3><p>{ins.desc}</p>
                <a href="#contact" className="icard-link" style={{color:ins.color}}>Read more →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="section" id="contact">
        <div className="si">
          <div className="contact-grid">
            <div>
              <div className="eyebrow" style={{color:'#E91E8C'}}><span className="eyebrow-bar" style={{background:'#E91E8C'}}/>Get in Touch</div>
              <h2 className="section-h2">Let&apos;s find your <span className="c-pink">next hire</span></h2>
              <p style={{fontSize:16,color:'var(--muted)',lineHeight:1.7,marginBottom:8}}>Whether you need one specialist or an entire AI team, we work on retained and contingency mandates. Most searches are active within 48 hours.</p>
              <div className="email-block">
                <div className="email-lbl">Email us directly</div>
                <div className="email-val"><a href="mailto:info@recruitable.asia">info@recruitable.asia</a></div>
              </div>
              <div className="cmeta">
                <div className="cmeta-item"><div className="cmeta-icon">◎</div><div><div className="cmeta-lbl">Global Hubs</div><div className="cmeta-val">Kuala Lumpur · New York City · London</div></div></div>
                <div className="cmeta-item"><div className="cmeta-icon">◷</div><div><div className="cmeta-lbl">Response Time</div><div className="cmeta-val">Within 4 business hours</div></div></div>
                <div className="cmeta-item"><div className="cmeta-icon">↗</div><div><div className="cmeta-lbl">Typical Time-to-Hire</div><div className="cmeta-val" style={{color:'#E91E8C'}}>Under 7 days</div></div></div>
              </div>
            </div>
            <div className="form-card">
              {form.status==='sent'?(
                <div className="form-ok">
                  <div className="form-ok-circle">✓</div>
                  <h3>Message received</h3>
                  <p>We&apos;ll be in touch at <strong>{form.company||'your company'}</strong> within 4 business hours.</p>
                </div>
              ):(
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="fg"><label className="fl">Your name</label><input className="fi" type="text" required placeholder="Alex Chen" value={form.name} onChange={e=>setForm(s=>({...s,name:e.target.value}))}/></div>
                    <div className="fg"><label className="fl">Company</label><input className="fi" type="text" required placeholder="Acme AI Ltd" value={form.company} onChange={e=>setForm(s=>({...s,company:e.target.value}))}/></div>
                  </div>
                  <div className="fg">
                    <label className="fl">Specialisation</label>
                    <select className="fs" required value={form.domain} onChange={e=>setForm(s=>({...s,domain:e.target.value}))}>
                      <option value="">Select a specialisation...</option>
                      <option>Forward Deployment Engineering</option>
                      <option>LLM Engineering</option>
                      <option>Data Science / AI</option>
                      <option>MLOps</option>
                      <option>Software Engineering</option>
                      <option>Cloud Architecture</option>
                      <option>Multiple / Not sure</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label className="fl">Tell us about the role</label>
                    <textarea className="ft" required placeholder="Describe the role, tech stack, seniority level, and timeline..." value={form.message} onChange={e=>setForm(s=>({...s,message:e.target.value}))}/>
                  </div>
                  <button type="submit" className="fsub" disabled={form.status==='sending'}>{form.status==='sending'?'Sending...':'Submit Enquiry →'}</button>
                  <p style={{fontSize:12,color:'var(--muted)',marginTop:14,textAlign:'center'}}>Or email us at <a href="mailto:info@recruitable.asia" style={{color:'#E91E8C',fontWeight:700}}>info@recruitable.asia</a></p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
