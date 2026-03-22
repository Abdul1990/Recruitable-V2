import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

// Brand colors from logo: Pink #E91E63 | Orange #FF9400 | Cyan #03A9F4 | Purple #3F51B5 | Yellow #FFC107 | Dark #212121
// Background: White | Tagline: "Explore, connect and get hired"

const DOMAINS = [
  // AI & ML
  { id:'ai-eng', cat:'AI & ML', title:'AI Engineer', desc:'Developing cutting edge AI models and integrating them into production-ready environments.', skills:['Python','PyTorch','LLMs','RAG'], color:'#E91E63', accent:'#FF9400' },
  { id:'ai-prod-eng', cat:'AI & ML', title:'AI Product Engineer', desc:'Bridging the gap between AI research and user-facing product features.', skills:['LangChain','Next.js','Prompt Eng.'], color:'#03A9F4', accent:'#3F51B5' },
  { id:'sol-eng', cat:'AI & ML', title:'Solution Engineer', desc:'Architecting complex technical solutions for enterprise AI integrations.', skills:['Sales Engineering','Solutions Arch.'], color:'#3F51B5', accent:'#E91E63' },
  { id:'fwd-deploy', cat:'AI & ML', title:'Forward Deployment Engineer', desc:'Executing high-impact AI deployments directly within client infrastructure.', skills:['DevOps','Field Eng.','SaaS'], color:'#FF9400', accent:'#FFC107', highlight:true },
  { id:'ai-pm', cat:'AI & ML', title:'AI Product Manager', desc:'Leading the strategy and roadmap for AI-native product ecosystems.', skills:['Prod Management','AI Strategy'], color:'#03A9F4', accent:'#3F51B5' },
  
  // Software Engineering
  { id:'backend', cat:'Software Engineering', title:'Back-end Development', desc:'Scaling robust server-side architectures for high-concurrency systems.', skills:['NodeJS','Go','Rust','Postgres'], color:'#E91E63', accent:'#03A9F4' },
  { id:'fullstack', cat:'Software Engineering', title:'Full Stack Development', desc:'End-to-end product delivery across modern web and mobile stacks.', skills:['React','Next.js','TypeScript'], color:'#03A9F4', accent:'#3F51B5' },
  { id:'frontend', cat:'Software Engineering', title:'Front End Development', desc:'Crafting pixel-perfect, high-performance user interfaces.', skills:['React','Vue','TailwindCSS'], color:'#3F51B5', accent:'#00BCD4' },
  { id:'mobile', cat:'Software Engineering', title:'Mobile Development', desc:'Building native and cross-platform mobile experiences for scale.', skills:['Kotlin','Flutter','Swift'], color:'#FF9400', accent:'#FFC107' },
  { id:'eng-mgr', cat:'Software Engineering', title:'Engineering Manager', desc:'Leading and scaling high-performing technical teams and culture.', skills:['Leadership','Agile','Mentorship'], color:'#00BCD4', accent:'#3F51B5' },

  // Data
  { id:'ml-eng', cat:'Data', title:'ML Engineering', desc:'Productionizing ML models with scalable infrastructure and MLOps.', skills:['Kubeflow','SageMaker','Docker'], color:'#E91E63', accent:'#3F51B5' },
  { id:'data-eng', cat:'Data', title:'Data Engineering', desc:'Architecting data pipelines and warehouses for large-scale intelligence.', skills:['Spark','Snowflake','SQL','etl'], color:'#03A9F4', accent:'#FF9400' },
  { id:'data-sci', cat:'Data', title:'Data Scientist', desc:'Extracting actionable insights from complex datasets via statistical modelling.', skills:['Python','Stats','Pandas'], color:'#3F51B5', accent:'#E91E63' },

  // Product
  { id:'prod-mgr', cat:'Product', title:'Product Manager', desc:'Driving user-centric product discovery and execution.', skills:['Agile','UI/UX','Roadmapping'], color:'#FF9400', accent:'#3F51B5' },
  { id:'prod-des', cat:'Product', title:'Product Designer', desc:'Designing intuitive and beautiful user experiences for complex software.', skills:['Figma','Design Systems'], color:'#03A9F4', accent:'#E91E63' },
  { id:'prod-eng', cat:'Product', title:'Product Engineering', desc:'Highly technical product leaders who code and lead features.', skills:['MVP','Full-stack','Tech Lead'], color:'#E91E63', accent:'#03A9F4' },
]

const HUBS = [
  { city:'Kuala Lumpur', code:'KL', role:'Engine Room', desc:'Our operational headquarters and primary talent pipeline. Home to the largest concentration of vetted AI and engineering talent in Southeast Asia.', stats:[{label:'Talent Pool',val:'8,400+'},{label:'Avg. Fill Time',val:'< 7 days'}], primary:true, color:'#E91E63', region:'KL' },
  { city:'United States', code:'US', role:'Strategic Frontier', desc:"Placing top-tier APAC talent into the world's most competitive AI and fintech companies across New York, San Francisco, and beyond.", stats:[{label:'US Clients',val:'35+'},{label:'Time Zone',val:'ET/PT'}], primary:false, color:'#03A9F4', region:'US' },
  { city:'London', code:'LON', role:'Strategic Frontier', desc:'Connecting European scale-ups and global enterprises with pre-vetted specialists across the APAC region.', stats:[{label:'EU Clients',val:'20+'},{label:'Time Zone',val:'GMT'}], primary:false, color:'#3F51B5', region:'London' },
]

const INSIGHTS = [
  {
    label: 'US Market Report',
    tag: 'AI Tech Roles',
    color: '#E91E63',
    title: 'The AI talent squeeze: 73% of US hiring managers cannot fill their AI roles',
    desc: 'Demand for AI engineers in the US has grown 4× faster than supply since GPT-4\'s release. Median total comp for LLM infrastructure roles now sits at $285K in SF and $240K in NYC — yet roles stay open for an average of 94 days. The bottleneck is not budget. It is pipeline. Companies chasing the same 12,000 US-based LLM engineers with 3+ years of production experience are losing to global talent strategies. Roles in highest demand right now: AI Platform Engineer, ML Inference Specialist, RAG Systems Architect, and Prompt/Evaluation Engineer.',
    stats: ['Median LLM Engineer comp: $285K (SF)', 'Avg. time-to-fill AI roles: 94 days', '4× demand growth vs supply since 2023'],
  },
  {
    label: 'KL Talent Market',
    tag: 'Software Engineering',
    color: '#03A9F4',
    title: 'Kuala Lumpur\'s software engineering moment: why FAANG keeps coming back',
    desc: 'Google, AWS, ByteDance, and Grab have all expanded engineering headcount in KL over the past 18 months — and it is not just cost arbitrage. Malaysia produces 70,000+ STEM graduates annually, boasts 98% English proficiency among engineers, and sits in GMT+8 — a clean overlap with both Singapore and Sydney. Median software engineering salaries in KL range from MYR 8,000–22,000/month for senior IC roles, a fraction of equivalent Singapore talent. The result: global companies are building real product teams here, not just support functions. Most in-demand stacks right now are Go, Kotlin, React, and Terraform.',
    stats: ['70,000+ STEM grads/year', 'Senior IC salaries: MYR 8K–22K/month', 'GMT+8 — ideal APAC timezone anchor'],
  },
  {
    label: 'Role Spotlight',
    tag: 'Future of Engineering',
    color: '#3F51B5',
    title: 'Forward Deployment Engineers are the most important hire in AI — and nobody is training for it',
    desc: 'The hardest part of the AI era is not building the model. It is deploying it inside a legacy enterprise. Forward Deployment Engineers (FDEs) are the bridge: equal parts software engineer, solutions architect, and change management consultant. Pioneered by Palantir and Anduril, the role is now spreading fast across AI-native companies selling into government, healthcare, and financial services. FDEs earn $350K–$500K+ total comp at leading AI companies. They need production coding ability, client-facing communication, and the emotional intelligence to navigate organisational politics — a combination that is extraordinarily rare. If you are an engineer who can also present to a C-suite, your market value just tripled.',
    stats: ['Total comp: $350K–$500K+ at top AI cos', 'Role growth: 210% YoY across AI-native firms', 'Rarest profile: eng + consulting + EQ'],
  },
]

const RADAR_DATA = [
  { label:'Data Science', val:95, angle:-90, color:'#E91E63' },
  { label:'AI / ML', val:100, angle:-18, color:'#FF9400' },
  { label:'LLM Ops', val:90, angle:54, color:'#03A9F4' },
  { label:'Fwd. Deploy', val:95, angle:126, color:'#3F51B5' },
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
          <stop offset="0%" stopColor="#E91E63" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#03A9F4" stopOpacity="0.18"/>
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
      <polygon points={polygon} fill="url(#rf)" stroke="#E91E63" strokeWidth="2" strokeLinejoin="round"/>
      {RADAR_DATA.map(d => {
        const p = toXY(d.angle, d.val)
        return <circle key={d.label} cx={p.x} cy={p.y} r={5} fill={d.color} stroke="white" strokeWidth="2"/>
      })}
      {RADAR_DATA.map(d => {
        const p = toXY(d.angle, 118)
        const anchor = p.x < cx-10 ? 'end' : p.x > cx+10 ? 'start' : 'middle'
        return <text key={d.label} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="central" fontSize="9" fontFamily="Nunito, sans-serif" fill="#2D2D44" fontWeight="600" opacity="0.65">{d.label}</text>
      })}
      <text x={cx} y={cy-7} textAnchor="middle" fontSize="15" fontFamily="Nunito, sans-serif" fill="#E91E63" fontWeight="700">Top</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize="10" fontFamily="Nunito, sans-serif" fill="#2D2D44" fontWeight="600" opacity="0.45">5% only</text>
    </svg>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('Software Engineering')
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
      --pink:#E91E63; --pink-l:#ff4081;
      --orange:#FF9400; --cyan:#03A9F4; --cyan-d:#0288d1;
      --purple:#3F51B5; --yellow:#FFC107;
      --dark:#212121; --dark-l:#424242;
      --off:#F4F6FB; --off2:#E8ECF4;
      --muted:#8A8A9E; --border:rgba(33,33,33,0.11);
      --ease:cubic-bezier(0.4,0,0.2,1);
    }
    .hero{min-height:calc(100vh - 84px);display:flex;align-items:center;padding:72px 0 80px;position:relative;overflow:hidden;background:var(--off)}
    .hero-blobs{position:absolute;inset:0;overflow:hidden;pointer-events:none}
    .blob{position:absolute;border-radius:50%;filter:blur(90px);opacity:0.1}
    .hero-inner{max-width:1200px;margin:0 auto;padding:0 24px;text-align:center;position:relative;z-index:1}
    .hero-badge{display:inline-flex;align-items:center;gap:8px;background:white;border:1.5px solid rgba(232,35,90,0.22);color:var(--pink);font-size:11.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:7px 16px;border-radius:24px;margin-bottom:24px;box-shadow:0 2px 12px rgba(232,35,90,0.1)}
    .badge-dot{width:7px;height:7px;border-radius:50%;background:var(--pink);animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
    .hero-tagline{font-size:18px;color:var(--cyan);font-style:italic;margin-bottom:14px;font-family:'Nunito',sans-serif;font-weight:600}
    .hero-h1{font-size:clamp(36px,6vw,64px);font-weight:900;line-height:1.05;letter-spacing:-.02em;margin-bottom:24px;color:var(--dark);font-family:'Nunito',sans-serif;max-width:900px;margin-left:auto;margin-right:auto}
    .c-pink{color:var(--pink)}.c-cyan{color:var(--cyan)}.c-orange{color:var(--orange)}.c-purple{color:var(--purple)}
    .hero-desc{font-size:18px;color:var(--muted);max-width:640px;line-height:1.7;margin-bottom:40px;margin-left:auto;margin-right:auto}
    .hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:52px;justify-content:center}
    .btn-pink{background:var(--pink);color:white;font-size:15px;font-weight:700;padding:13px 28px;border-radius:8px;transition:all .2s;box-shadow:0 4px 16px rgba(232,35,90,0.22);font-family:'Nunito',sans-serif}
    .btn-pink:hover{background:var(--pink-l);transform:translateY(-2px);box-shadow:0 8px 24px rgba(232,35,90,0.35)}
    .btn-outline{background:white;color:var(--dark);font-size:15px;font-weight:600;padding:13px 28px;border-radius:8px;border:1.5px solid var(--border);transition:all .2s;font-family:'Nunito',sans-serif}
    .btn-outline:hover{border-color:var(--cyan);color:var(--cyan)}
    .hero-stats{display:flex;flex-wrap:wrap;gap:0;justify-content:center;max-width:900px;margin:0 auto}
    .hero-stat{padding:0 32px}
    .hero-stat+.hero-stat{border-left:1px solid var(--border)}
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
    .stripe{height:5px;background:linear-gradient(90deg,#E91E63 0%,#FF9400 25%,#FFC107 50%,#03A9F4 75%,#3F51B5 100%)}
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
    .hub-card{background:white;border:1.5px solid var(--border);border-radius:20px;padding:32px;transition:all .25s;position:relative;overflow:hidden;display:block;text-decoration:none;color:inherit;cursor:pointer}
    .hub-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(45,45,58,0.1)}
    .hub-card-cta{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;margin-top:18px;font-family:'Nunito',sans-serif;opacity:0.7;transition:opacity .2s}
    .hub-card:hover .hub-card-cta{opacity:1}
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
    .icard p{font-size:14px;color:var(--muted);line-height:1.65;margin-bottom:18px}
    .icard-stats{list-style:none;padding:0;margin:0 0 22px;display:flex;flex-direction:column;gap:7px;flex:1}
    .icard-stats li{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:var(--dark-l);font-family:'Nunito',sans-serif;padding:6px 10px;border-radius:8px;border:1px solid var(--border);background:var(--off)}
    .icard-stat-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
    .icard-link{font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:5px;font-family:'Nunito',sans-serif;margin-top:auto}
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
        <title>RECRUITABLE | Explore, Connect and Get Hired — KL · US · LON</title>
        <meta name="description" content="Specialist recruitment for AI, LLM Engineering, Data Science, MLOps, and Software Engineering across APAC. Pre-vetted top 5% talent. Hire in under 7 days."/>
      </Head>
      <style>{CSS}</style>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-blobs">
          <div className="blob" style={{width:600,height:600,background:'#E91E63',top:'-15%',right:'-8%'}}/>
          <div className="blob" style={{width:500,height:500,background:'#03A9F4',bottom:'-15%',left:'-8%'}}/>
          <div className="blob" style={{width:320,height:320,background:'#3F51B5',top:'35%',left:'38%'}}/>
        </div>
        <div className="hero-inner">
          <div>
            <div className="hero-badge"><span className="badge-dot"/>Global Scale · APAC · US · EMEA</div>
            <p className="hero-tagline">Explore, connect and get hired.</p>
            <h1 className="hero-h1">We help the world&apos;s most ambitious <span className="c-pink">Tech Teams</span> scale at speed</h1>
            <p className="hero-desc">From high-growth AI and SaaS unicorns to global Fintech leaders and E-commerce powerhouses, we scale top-tier talent across every technical vertical.</p>
            <div className="hero-actions">
              <a href="#contact" className="btn-pink">Start a Search →</a>
              <a href="#domains" className="btn-outline">Our Specialisations</a>
            </div>

            <div style={{marginTop:48,marginBottom:40}}>
              <p className="fl" style={{marginBottom:16,opacity:0.6}}>Candidate Benchmarks by Role</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center'}}>
                {RADAR_DATA.map(d=>(
                  <div key={d.label} style={{background:'white',padding:'8px 16px',borderRadius:12,border:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8}}>
                    <span style={{width:8,height:8,borderRadius:'50%',background:d.color}}/>
                    <span style={{fontSize:13,fontWeight:700,color:'var(--dark)'}}>{d.label}</span>
                    <span style={{fontSize:13,fontWeight:800,color:d.color}}>{d.val}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hero-stats" style={{marginTop:40,paddingTop:40,borderTop:'1px solid var(--border)'}}>
              <div className="hero-stat"><div className="stat-val c-pink">&lt; 7</div><div className="stat-lbl">Days to place</div></div>
              <div className="hero-stat"><div className="stat-val c-cyan">Top 5%</div><div className="stat-lbl">Vetted Only</div></div>
              <div className="hero-stat"><div className="stat-val c-purple">95%</div><div className="stat-lbl">Software Bench</div></div>
              <div className="hero-stat"><div className="stat-val c-orange">100%</div><div className="stat-lbl">Fintech Ready</div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="stripe"/>

      {/* SPECIALISATION */}
      <section className="section domains-bg" id="domains">
        <div className="si">
          <div className="eyebrow" style={{color:'#E91E63'}}><span className="eyebrow-bar" style={{background:'#E91E63'}}/>Specialisation</div>
          <h2 className="section-h2">Where the World’s <span className="c-pink">Top 5%</span> Meets the Future of Tech</h2>
          <div className="section-desc" style={{maxWidth:800}}>
            <p style={{marginBottom:16,fontSize:18,fontWeight:600,color:'var(--dark)'}}>We don’t just fill roles; we fuel breakthroughs.</p>
            <p style={{marginBottom:16}}>By scouting the top 5% of engineering and leadership talent across the US, London, and APAC, we bridge the gap between elite visionaries and the world’s most disruptive companies.</p>
            <p>From stealth-mode AI labs to hyper-growth SaaS and Fintech giants, we introduce the architects of tomorrow to the businesses defining it today.</p>
          </div>
          <div className="domain-tabs" style={{overflowX:'auto',paddingBottom:10}}>
            <button className={`dtab${activeTab==='Software Engineering'?' ap':''}`} onClick={()=>setActiveTab('Software Engineering')}>Software</button>
            <button className={`dtab${activeTab==='AI & ML'?' ac':''}`} onClick={()=>setActiveTab('AI & ML')}>AI &amp; ML</button>
            <button className={`dtab${activeTab==='Data'?' ap':''}`} style={{'--pink':'var(--purple)'}} onClick={()=>setActiveTab('Data')}>Data</button>
            <button className={`dtab${activeTab==='Product'?' ac':''}`} style={{'--cyan':'var(--orange)'}} onClick={()=>setActiveTab('Product')}>Product</button>
          </div>
          <div className="domains-grid">
            {DOMAINS.filter(d => d.cat === activeTab).map(d => (
              <div className="dcard" key={d.id} style={{display:'flex',flexDirection:'column'}}>
                <div className="dcard-stripe" style={{background:`linear-gradient(90deg,${d.color},${d.accent})`}}/>
                <div className={`dtag ${d.cat==='AI & ML'?'tb':d.cat==='Software Engineering'?'ta':d.cat==='Data'?'te':'tb'}`}>{d.cat}</div>
                <h3 style={{fontSize:18}}>{d.title}</h3>
                <p style={{flex:1}}>{d.desc}</p>
                <div className="skills">{d.skills.map(s=><span className="sp" key={s}>{s}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="stripe" style={{background:'linear-gradient(90deg,#3F51B5,#03A9F4,#FFC107)'}}/>

      {/* GLOBAL HUBS */}
      <section className="section" id="hubs">
        <div className="si">
          <div className="eyebrow" style={{color:'#03A9F4'}}><span className="eyebrow-bar" style={{background:'#03A9F4'}}/>Global Hubs</div>
          <h2 className="section-h2">Where we <span className="c-cyan">operate</span></h2>

          <div className="hubs-grid">
            {HUBS.map(hub=>(
              <Link key={hub.city} href={`/jobs?region=${hub.region}`} className="hub-card">
                <div className="hub-stripe" style={{background:hub.color}}/>
                <div className="hub-top">
                  <span className="hub-code" style={{color:hub.color}}>{hub.code}</span>
                  <span className={`hub-pill ${hub.primary?'pe':'pf'}`}>{hub.role}</span>
                </div>
                <div className="hub-city">{hub.city}</div>
                <p className="hub-desc">{hub.desc}</p>
                <div className="hub-stats">{hub.stats.map(s=><div key={s.label}><div className="hsv" style={{color:hub.color}}>{s.val}</div><div className="hsl">{s.label}</div></div>)}</div>
                <div className="hub-card-cta" style={{color:hub.color}}>View {hub.code} jobs →</div>
              </Link>
            ))}
          </div>
          <div className="tz-bar">
            <span style={{fontSize:20}}>🌐</span>
            <span><strong>Follow-the-sun coverage:</strong> KL (GMT+8) · London (GMT/BST) · US (ET/PT) — seamless hiring support across every major time zone.</span>
          </div>
        </div>
      </section>

      {/* MARKET INSIGHTS */}
      <section className="section insights-bg" id="insights">
        <div className="si">
          <div className="eyebrow" style={{color:'#3F51B5'}}><span className="eyebrow-bar" style={{background:'#3F51B5'}}/>Market Insights</div>
          <h2 className="section-h2">Intelligence from the <span className="c-purple">front line</span></h2>
          <p className="section-desc">We publish what we see — not what sounds good. Candid market intelligence from active placements across APAC, US, and Europe.</p>
          <div className="insights-grid">
            {INSIGHTS.map(ins=>(
              <div key={ins.title} className="icard">
                <div className="icard-stripe" style={{background:ins.color}}/>
                <div className="icard-meta"><span className="icard-lbl">{ins.label}</span><span className="icard-tag">{ins.tag}</span></div>
                <h3>{ins.title}</h3>
                <p>{ins.desc}</p>
                {ins.stats && (
                  <ul className="icard-stats">
                    {ins.stats.map(s => <li key={s} style={{borderColor:ins.color+'40'}}><span className="icard-stat-dot" style={{background:ins.color}}/>{s}</li>)}
                  </ul>
                )}
                <a href="#contact" className="icard-link" style={{color:ins.color}}>Talk to our team →</a>
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
              <div className="eyebrow" style={{color:'#E91E63'}}><span className="eyebrow-bar" style={{background:'#E91E63'}}/>Get in Touch</div>
              <h2 className="section-h2">Let&apos;s find your <span className="c-pink">next hire</span></h2>
              <p style={{fontSize:16,color:'var(--muted)',lineHeight:1.7,marginBottom:8}}>Whether you need one specialist or an entire AI team, we work on retained and contingency mandates. Most searches are active within 48 hours.</p>
              <div className="email-block">
                <div className="email-lbl">Email us directly</div>
                <div className="email-val"><a href="mailto:info@recruitable.asia">info@recruitable.asia</a></div>
              </div>
              <div className="cmeta">
                <div className="cmeta-item"><div className="cmeta-icon">◎</div><div><div className="cmeta-lbl">Global Hubs</div><div className="cmeta-val">Kuala Lumpur · United States · London</div></div></div>
                <div className="cmeta-item"><div className="cmeta-icon">◷</div><div><div className="cmeta-lbl">Response Time</div><div className="cmeta-val">Within 4 business hours</div></div></div>
                <div className="cmeta-item"><div className="cmeta-icon">↗</div><div><div className="cmeta-lbl">Typical Time-to-Hire</div><div className="cmeta-val" style={{color:'#E91E8C'}}>Under 30 days</div></div></div>
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
                  <p style={{fontSize:12,color:'var(--muted)',marginTop:14,textAlign:'center'}}>Or email us at <a href="mailto:info@recruitable.asia" style={{color:'#E91E63',fontWeight:700}}>info@recruitable.asia</a></p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
