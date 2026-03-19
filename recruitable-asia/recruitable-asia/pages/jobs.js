import Head from 'next/head'
import { useState } from 'react'
import {
  MapPin, DollarSign, X, Upload,
  Send, Briefcase, Clock, ChevronRight, Search
} from 'lucide-react'

// ─── JOB DATA ────────────────────────────────────────────────────────────────
const JOBS = [
  {
    id: 1,
    title: 'AI Engineer',
    company: 'Tier-1 AI Lab',
    location: 'NYC',
    locationFull: 'New York City, USA',
    region: 'USA',
    type: 'AI / ML',
    salary: '$180k – $250k',
    salaryNote: 'USD + equity',
    stack: ['PyTorch', 'LangChain', 'CUDA', 'Python', 'MLflow'],
    posted: '2 days ago',
    color: '#E8235A',
    badge: 'Hot Role',
    description: `We are partnering with a top-tier AI research lab to find an exceptional AI Engineer ready to push the frontier of large-scale model deployment.

**The Role:**
You will be responsible for designing, training, and productionising state-of-the-art LLMs and multimodal systems. You will work alongside world-class researchers and directly influence the roadmap of production AI systems serving millions of users.

**What You'll Do:**
- Fine-tune and adapt foundational models (GPT-4 class) for production enterprise applications
- Build and maintain high-throughput inference pipelines using CUDA-optimised serving stacks
- Design RAG architectures and agentic systems using LangChain / LlamaIndex
- Collaborate with research to bring experimental models to production SLA
- Drive MLflow-based experimentation tracking and model versioning

**You Are:**
- 4+ years of deep ML engineering (not just API wrapping)
- Proficient in PyTorch at the CUDA kernel level
- Experienced shipping models to production — not just notebooks
- Familiar with distributed training (FSDP, DeepSpeed)
- Based in NYC or willing to relocate (hybrid 3 days on-site)

This is a top 5% mandate. We will only submit candidates who have shipped production AI at scale.`,
  },
  {
    id: 2,
    title: 'AI Engineer',
    company: 'AI-Native Fintech',
    location: 'SF',
    locationFull: 'San Francisco, USA',
    region: 'USA',
    type: 'AI / ML',
    salary: '$200k – $280k',
    salaryNote: 'USD + equity',
    stack: ['TensorFlow', 'JAX', 'Python', 'Kubernetes', 'Ray'],
    posted: '1 day ago',
    color: '#E8235A',
    badge: 'Urgent',
    description: `A high-growth AI-native fintech is scaling its core ML team and needs a senior AI Engineer to own the fraud detection and risk modelling pipeline.

**The Role:**
You will be the technical lead for a team of 3 ML engineers, owning the full lifecycle from feature engineering to production inference. The system processes 50M+ transactions daily and requires sub-10ms latency at P99.

**What You'll Do:**
- Architect and scale real-time ML inference systems using Ray Serve and Kubernetes
- Build and improve gradient-boosted and deep learning models for transaction risk scoring
- Lead the migration from TensorFlow 1.x legacy systems to JAX/Flax
- Implement feature stores and real-time feature pipelines using Feast + Kafka
- Drive A/B testing frameworks for model performance validation

**You Are:**
- 5+ years ML engineering, with 2+ years in a tech lead capacity
- Deep experience with low-latency serving systems (P99 < 10ms)
- Production experience with JAX or willingness to upskill rapidly
- Familiar with financial data, fraud signals, or risk modelling
- SF Bay Area based or willing to relocate

Exceptional compensation for an exceptional engineer.`,
  },
  {
    id: 3,
    title: 'Full Stack Engineer',
    company: 'European SaaS Scale-up',
    location: 'Europe',
    locationFull: 'Remote (Europe)',
    region: 'Europe',
    type: 'Engineering',
    salary: '€90k – €130k',
    salaryNote: 'EUR + stock options',
    stack: ['React', 'Next.js', 'Go', 'PostgreSQL', 'Terraform'],
    posted: '3 days ago',
    color: '#5B4B8A',
    badge: 'Remote',
    description: `A Series B European SaaS company (€40M raised) is scaling its product engineering team and needs a Full Stack Engineer who thrives in high-ownership environments.

**The Role:**
You will join a lean, high-output product squad and own features end-to-end — from API design to polished frontend. The stack is modern, the team is senior, and there is real autonomy.

**What You'll Do:**
- Build and ship customer-facing features using React/Next.js with TypeScript
- Design and implement RESTful and GraphQL APIs in Go
- Own database schema design and query optimisation in PostgreSQL
- Contribute to infrastructure-as-code using Terraform on AWS
- Participate in technical architecture decisions with the engineering lead

**You Are:**
- 4+ years full stack experience, with genuine depth in both frontend and backend
- Fluent in TypeScript — you write typed code by default
- Experienced with Go or Rust (or deeply motivated to move to compiled backend)
- Comfortable working async-first across European time zones
- EU work authorisation required

Fully remote within Europe. Quarterly team gatherings in Amsterdam.`,
  },
  {
    id: 4,
    title: 'Full Stack Engineer',
    company: 'KL Tech Unicorn',
    location: 'KL',
    locationFull: 'Kuala Lumpur, Malaysia',
    region: 'APAC',
    type: 'Engineering',
    salary: 'RM 20k – 35k',
    salaryNote: 'MYR / month',
    stack: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
    posted: '4 days ago',
    color: '#29B6D8',
    badge: 'Top Pick',
    description: `A fast-scaling Malaysian tech company (regional unicorn candidate) is building out its core platform team. This is a rare opportunity to join pre-Series C at a pivotal growth stage.

**The Role:**
You will be part of the founding engineering team for a new product vertical, with direct influence over technical architecture and the opportunity to grow into a senior or lead role within 18 months.

**What You'll Do:**
- Build full-stack features across a React frontend and Node.js / Python backend
- Design and optimise MongoDB schemas for high-read workloads
- Integrate third-party APIs (payments, logistics, KYC) with robust error handling
- Build and monitor AWS infrastructure (ECS, RDS, CloudFront, Lambda)
- Work closely with product and design to ship high-quality, tested features

**You Are:**
- 3+ years full stack experience with a proven shipping record
- Strong in JavaScript/TypeScript across the stack
- AWS-certified or working towards it (company will fund certification)
- Based in or willing to relocate to Kuala Lumpur
- Bonus: Experience with Southeast Asian market products (e-commerce, fintech, logistics)

Competitive Malaysian salary + ESOP + visa sponsorship available.`,
  },
  {
    id: 5,
    title: 'Data Engineer',
    company: 'AI-Native SaaS Platform',
    location: 'KL',
    locationFull: 'Kuala Lumpur, Malaysia',
    region: 'APAC',
    type: 'Data Engineering',
    salary: 'RM 18k – 28k',
    salaryNote: 'MYR / month',
    stack: ['Apache Spark', 'dbt', 'Airflow', 'Snowflake', 'Python', 'Kafka'],
    posted: '1 day ago',
    color: '#F5A623',
    badge: 'Top Pick',
    description: `A fast-growing AI-native SaaS company in KL is building out its core data platform team. This is a greenfield opportunity to architect a modern data stack from the ground up.

**The Role:**
You will own the design and implementation of the company's data infrastructure — from ingestion pipelines to the analytics layer that powers their AI product suite. You'll work closely with Data Scientists and ML Engineers to ensure data quality, freshness, and reliability at scale.

**What You'll Do:**
- Design and build scalable ELT pipelines using Apache Spark and dbt on Snowflake
- Orchestrate workflows with Apache Airflow, ensuring SLA-compliant data delivery
- Build real-time streaming pipelines using Kafka for event-driven AI features
- Define and enforce data quality contracts, lineage tracking, and schema governance
- Partner with ML Engineers to build feature stores and model training datasets

**You Are:**
- 3+ years of data engineering with production Spark and dbt experience
- Fluent in Python and SQL — you think in transformations
- Experience with a modern cloud data warehouse (Snowflake, BigQuery, or Redshift)
- Comfortable with streaming (Kafka, Flink, or Kinesis)
- Based in or willing to relocate to Kuala Lumpur

ESOP + visa sponsorship available. Hybrid working from our KL HQ.`,
  },
  {
    id: 6,
    title: 'Data Engineer',
    company: 'European FinTech Scale-up',
    location: 'Europe',
    locationFull: 'Remote (Europe)',
    region: 'Europe',
    type: 'Data Engineering',
    salary: '€80k – €115k',
    salaryNote: 'EUR + stock options',
    stack: ['dbt', 'Airflow', 'BigQuery', 'Python', 'Terraform', 'Kafka'],
    posted: '2 days ago',
    color: '#F5A623',
    badge: 'Remote',
    description: `A Series B European fintech (€55M raised) needs a Data Engineer to scale the data platform underpinning their risk and compliance AI products.

**The Role:**
You'll join a senior data team of 5 and take ownership of critical data pipelines serving both internal analytics and external-facing AI features. The stack is modern, the data is complex (financial transactions, KYC, regulatory feeds), and the impact is direct.

**What You'll Do:**
- Build and maintain ELT pipelines with dbt and BigQuery at petabyte scale
- Design reliable Airflow DAGs for regulatory reporting and ML feature pipelines
- Implement real-time event streaming with Kafka for fraud signal processing
- Own infrastructure-as-code for data infrastructure using Terraform
- Collaborate with compliance and product teams on data contracts and SLAs

**You Are:**
- 4+ years data engineering, with strong dbt and BigQuery (or Snowflake) depth
- Experience with financial data — transactions, risk signals, or regulatory datasets preferred
- Comfortable with Terraform and cloud-native data infrastructure on GCP or AWS
- Async-first mindset, fluent written English
- EU work authorisation required

Fully remote within Europe. Quarterly off-sites in Amsterdam or Berlin.`,
  },
  {
    id: 7,
    title: 'Forward Deployment Engineer',
    company: 'Enterprise AI Platform',
    location: 'NYC',
    locationFull: 'New York City, USA',
    region: 'USA',
    type: 'Forward Deploy',
    salary: '$160k – $220k',
    salaryNote: 'USD + commission',
    stack: ['LLM APIs', 'Python', 'React', 'Cloud Infra', 'Enterprise SaaS'],
    posted: '5 hours ago',
    color: '#F5A623',
    badge: '🔥 New',
    description: `This is the rarest role in AI — the bridge between cutting-edge AI capability and enterprise deployment reality. Our client builds AI infrastructure for Fortune 500 companies and needs a Forward Deployment Engineer who can operate at the intersection of engineering and customer success.

**The Role:**
You will be embedded with enterprise clients during their AI adoption journey — part field engineer, part solutions architect, part trusted advisor. You will own the technical relationship from first pilot to full production rollout.

**What You'll Do:**
- Lead technical implementation of AI platform within Fortune 500 client environments
- Build custom integrations, RAG pipelines, and workflow automations using client data
- Diagnose and resolve complex deployment issues at the intersection of infra, data, and AI
- Translate customer use cases into engineering requirements for the product team
- Travel to client sites (~30%) and represent the technical credibility of the company

**You Are:**
- A full-stack engineer who has also done solutions engineering, implementation, or customer-facing technical work
- Comfortable presenting to C-suite and debugging Kubernetes in the same day
- Deep knowledge of LLM APIs (OpenAI, Anthropic, Gemini) and RAG architectures
- 3+ years engineering with 1+ year in a client-facing technical role
- New York City based (travel required)

This role pays base + commission on client expansion. Top performers earn $280k+ OTE.`,
  },
]

const REGIONS = ['All', 'USA', 'Europe', 'APAC']
const TYPES = ['All', 'AI / ML', 'Data Engineering', 'Engineering', 'Forward Deploy']

// ─── QUICK APPLY MODAL ───────────────────────────────────────────────────────
function ApplyModal({ job, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', note: '' })
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | sending | sent

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (f) setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('email', form.email)
      formData.append('note', form.note)
      formData.append('jobTitle', job.title)
      formData.append('jobCompany', job.company)
      if (file) formData.append('cv', file, file.name)

      const res = await fetch('/api/apply', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('sent')
    } catch {
      setStatus('idle')
      alert('Something went wrong. Please email info@recruitable.asia directly.')
    }
  }

  if (!job) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>

        {status === 'sent' ? (
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h3>Application Submitted</h3>
            <p>We've received your application for <strong>{job.title}</strong> at {job.company}. Our team reviews every CV personally — you'll hear from us within 2 business days.</p>
            <button className="modal-success-btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div className="modal-tag" style={{ background: `${job.color}18`, color: job.color, border: `1px solid ${job.color}30` }}>{job.type}</div>
              <h2 className="modal-title">{job.title}</h2>
              <p className="modal-sub">{job.company} · {job.locationFull}</p>
              <div className="modal-salary">
                <DollarSign size={14} />
                {job.salary} <span>{job.salaryNote}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-form-grid">
                <div className="modal-form-group">
                  <label>Full Name *</label>
                  <input type="text" required placeholder="Alex Chen"
                    value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} />
                </div>
                <div className="modal-form-group">
                  <label>Email *</label>
                  <input type="email" required placeholder="alex@company.com"
                    value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} />
                </div>
              </div>

              <div className="modal-form-group">
                <label>CV / Resume * <span className="file-hint">(PDF or DOCX, max 10MB)</span></label>
                <div
                  className={`drop-zone${file ? ' has-file' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => document.getElementById('cv-upload').click()}
                >
                  <input
                    id="cv-upload" type="file" accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }} onChange={handleFile}
                  />
                  {file ? (
                    <div className="drop-zone-file">
                      <div className="drop-zone-file-icon">📄</div>
                      <div>
                        <div className="drop-zone-filename">{file.name}</div>
                        <div className="drop-zone-filesize">{(file.size / 1024).toFixed(0)} KB · Click to change</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} color="var(--muted)" />
                      <div className="drop-zone-text">Drop your CV here or <span>browse</span></div>
                      <div className="drop-zone-hint">PDF or DOCX accepted</div>
                    </>
                  )}
                </div>
              </div>

              <div className="modal-form-group">
                <label>Anything you'd like us to know? <span className="file-hint">(optional)</span></label>
                <textarea placeholder="Relevant experience, availability, notice period..."
                  value={form.note} onChange={e => setForm(s => ({ ...s, note: e.target.value }))} />
              </div>

              <button
                type="submit"
                className="modal-submit"
                style={{ background: job.color }}
                disabled={!file || status === 'sending'}
              >
                {status === 'sending' ? (
                  <span className="sending-dots">Submitting<span>.</span><span>.</span><span>.</span></span>
                ) : (
                  <><Send size={15} /> Submit Application</>
                )}
              </button>
              <p className="modal-disclaimer">
                By applying you agree that your data may be shared with relevant hiring companies. We never spam. &nbsp;·&nbsp;{' '}
                <a href="mailto:info@recruitable.asia">info@recruitable.asia</a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ─── JOB DETAIL DRAWER ───────────────────────────────────────────────────────
function JobDetail({ job, onApply, onClose }) {
  if (!job) return null
  const lines = job.description.split('\n')

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <button className="drawer-close" onClick={onClose}><X size={20} /></button>
        <div className="drawer-header" style={{ borderTop: `4px solid ${job.color}` }}>
          <div className="drawer-meta">
            <span className="drawer-tag" style={{ background: `${job.color}18`, color: job.color, border: `1px solid ${job.color}30` }}>{job.type}</span>
            {job.badge && <span className="drawer-badge">{job.badge}</span>}
          </div>
          <h2 className="drawer-title">{job.title}</h2>
          <p className="drawer-company">{job.company}</p>
          <div className="drawer-info-row">
            <span className="drawer-info-item"><MapPin size={13} />{job.locationFull}</span>
            <span className="drawer-info-item"><DollarSign size={13} />{job.salary}</span>
            <span className="drawer-info-item"><Clock size={13} />{job.posted}</span>
          </div>
          <div className="drawer-stack">
            {job.stack.map(s => <span key={s} className="stack-chip">{s}</span>)}
          </div>
          <button className="drawer-apply-btn" style={{ background: job.color }} onClick={onApply}>
            Quick Apply <ChevronRight size={15} />
          </button>
        </div>
        <div className="drawer-body">
          {lines.map((line, i) => {
            if (!line.trim()) return <br key={i} />
            if (line.startsWith('**') && line.endsWith('**')) {
              return <h4 key={i} className="drawer-section-title">{line.replace(/\*\*/g, '')}</h4>
            }
            if (line.startsWith('- ')) {
              return <div key={i} className="drawer-bullet"><span>→</span>{line.slice(2)}</div>
            }
            return <p key={i} className="drawer-para">{line.replace(/\*\*/g, '')}</p>
          })}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Jobs() {
  const [region, setRegion] = useState('All')
  const [type, setType] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [applyJob, setApplyJob] = useState(null)

  const filtered = JOBS.filter(j => {
    const matchRegion = region === 'All' || j.region === region
    const matchType = type === 'All' || j.type === type
    const matchSearch = search === '' ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.stack.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      j.location.toLowerCase().includes(search.toLowerCase())
    return matchRegion && matchType && matchSearch
  })

  return (
    <>
      <Head>
        <title>Jobs | Recruitable — Top 5% Tech Roles</title>
        <meta name="description" content="Browse exclusive top 5% AI Engineer, Data Engineer, LLM Engineer, and Forward Deployment roles across NYC, SF, Europe, and KL." />
        <meta property="og:title" content="Top 5% Tech Roles — Recruitable"/>
        <meta property="og:description" content="Exclusive AI Engineer, Data Engineer, LLM Engineer, and Forward Deployment roles. APAC · Europe · USA. Top 5% only."/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://recruitable.asia/jobs"/>
        <meta property="og:image" content="https://recruitable.asia/og-image.png"/>
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content="Top 5% Tech Roles — Recruitable"/>
        <meta name="twitter:description" content="AI Engineer, Data Engineer, LLM Engineer, Forward Deployment roles across APAC, Europe, and the US."/>
        <meta name="twitter:image" content="https://recruitable.asia/og-image.png"/>
      </Head>

      <style>{`
        /* PAGE */
        .jobs-hero { background: var(--charcoal); padding: 56px 0 48px; }
        .jobs-hero-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .jobs-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; color: var(--teal); margin-bottom: 12px; font-family: var(--font-h); }
        .jobs-h1 { font-family: var(--font-h); font-size: clamp(28px, 4vw, 48px); font-weight: 900; color: white; line-height: 1.15; margin-bottom: 12px; }
        .jobs-h1 span { color: var(--pink); }
        .jobs-sub { font-size: 16px; color: rgba(255,255,255,0.5); font-weight: 400; max-width: 520px; line-height: 1.65; }

        /* FILTER BAR */
        .filter-bar { background: white; border-bottom: 1px solid var(--slate-d); padding: 20px 0; position: sticky; top: 57px; z-index: 10; box-shadow: 0 2px 12px rgba(45,45,58,0.06); }
        .filter-bar-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .filter-search { display: flex; align-items: center; gap: 8px; background: var(--slate); border: 1.5px solid var(--slate-d); border-radius: 9px; padding: 9px 14px; flex: 1; min-width: 200px; transition: border-color 0.2s; }
        .filter-search:focus-within { border-color: var(--cyan); background: white; }
        .filter-search input { border: none; background: none; font-size: 14px; font-family: var(--font-b); color: var(--charcoal); outline: none; width: 100%; font-weight: 500; }
        .filter-search input::placeholder { color: var(--muted); }
        .filter-group { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-chip { font-size: 12.5px; font-weight: 700; padding: 8px 15px; border-radius: 8px; border: 1.5px solid var(--slate-d); color: var(--muted); transition: all 0.18s; cursor: pointer; font-family: var(--font-h); white-space: nowrap; background: white; }
        .filter-chip:hover { border-color: var(--cyan); color: var(--cyan); }
        .filter-chip.active-region { background: var(--cyan); border-color: var(--cyan); color: white; }
        .filter-chip.active-type { background: var(--purple); border-color: var(--purple); color: white; }
        .filter-divider { width: 1px; height: 32px; background: var(--slate-d); }
        .filter-count { font-size: 12px; font-weight: 700; color: var(--muted); white-space: nowrap; font-family: var(--font-h); }

        /* JOB GRID */
        .jobs-body { max-width: 1200px; margin: 0 auto; padding: 40px 24px; }
        .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
        .job-card {
          background: white; border: 1.5px solid var(--slate-d); border-radius: 18px;
          padding: 28px; cursor: pointer; transition: all 0.22s var(--ease);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
        }
        .job-card:hover { border-color: rgba(45,45,58,0.18); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(45,45,58,0.1); }
        .job-card-stripe { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 18px 18px 0 0; }
        .job-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
        .job-type-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 11px; border-radius: 10px; font-family: var(--font-h); }
        .job-badge { font-size: 10px; font-weight: 800; padding: 4px 11px; border-radius: 10px; background: rgba(45,45,58,0.06); color: var(--charcoal-soft); font-family: var(--font-h); }
        .job-title { font-family: var(--font-h); font-size: 20px; font-weight: 900; color: var(--charcoal); margin-bottom: 4px; line-height: 1.2; }
        .job-company { font-size: 13px; font-weight: 600; color: var(--muted); margin-bottom: 16px; }
        .job-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
        .job-meta-item { display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 600; color: var(--charcoal-soft); }
        .job-salary { font-weight: 800; }
        .job-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .stack-chip { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 8px; background: var(--slate); color: var(--charcoal-soft); border: 1px solid var(--slate-d); font-family: var(--font-h); }
        .job-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 16px; border-top: 1px solid var(--slate-d); }
        .job-posted { font-size: 11.5px; color: var(--muted); font-weight: 600; display: flex; align-items: center; gap: 5px; }
        .job-view-btn { font-size: 12.5px; font-weight: 800; color: var(--cyan); font-family: var(--font-h); display: flex; align-items: center; gap: 3px; }
        .no-results { text-align: center; padding: 80px 24px; }
        .no-results h3 { font-family: var(--font-h); font-size: 22px; font-weight: 800; color: var(--charcoal); margin-bottom: 10px; }
        .no-results p { font-size: 15px; color: var(--muted); }

        /* MODAL */
        .modal-overlay { position: fixed; inset: 0; background: rgba(45,45,58,0.55); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; backdrop-filter: blur(4px); }
        .modal { background: white; border-radius: 22px; width: 100%; max-width: 560px; max-height: 92vh; overflow-y: auto; position: relative; box-shadow: 0 24px 80px rgba(0,0,0,0.25); }
        .modal-close { position: absolute; top: 20px; right: 20px; width: 34px; height: 34px; border-radius: 50%; background: var(--slate); display: grid; place-items: center; color: var(--muted); transition: all 0.18s; z-index: 1; }
        .modal-close:hover { background: var(--slate-d); color: var(--charcoal); }
        .modal-header { padding: 32px 32px 24px; border-bottom: 1px solid var(--slate-d); }
        .modal-tag { display: inline-flex; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 11px; border-radius: 10px; margin-bottom: 10px; font-family: var(--font-h); }
        .modal-title { font-family: var(--font-h); font-size: 24px; font-weight: 900; color: var(--charcoal); margin-bottom: 4px; }
        .modal-sub { font-size: 14px; font-weight: 600; color: var(--muted); margin-bottom: 10px; }
        .modal-salary { font-size: 14px; font-weight: 700; color: var(--charcoal-soft); display: flex; align-items: center; gap: 4px; }
        .modal-salary span { color: var(--muted); font-weight: 500; }
        form { padding: 28px 32px; }
        .modal-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .modal-form-group { margin-bottom: 18px; }
        .modal-form-group label { font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--charcoal-soft); margin-bottom: 7px; display: block; font-family: var(--font-h); }
        .file-hint { font-weight: 500; text-transform: none; letter-spacing: 0; color: var(--muted); }
        .modal-form-group input, .modal-form-group textarea {
          width: 100%; font-size: 14px; font-family: var(--font-b); padding: 10px 14px;
          border-radius: 9px; font-weight: 500; border: 1.5px solid var(--slate-d);
          background: var(--slate); color: var(--charcoal); transition: all 0.2s; outline: none;
        }
        .modal-form-group input:focus, .modal-form-group textarea:focus { border-color: var(--cyan); background: white; box-shadow: 0 0 0 3px rgba(41,182,216,0.1); }
        .modal-form-group textarea { min-height: 90px; resize: vertical; }
        .drop-zone {
          border: 2px dashed var(--slate-d); border-radius: 12px; padding: 28px 20px;
          text-align: center; cursor: pointer; transition: all 0.2s; background: var(--slate);
        }
        .drop-zone:hover { border-color: var(--cyan); background: rgba(41,182,216,0.04); }
        .drop-zone.has-file { border-color: var(--cyan); background: rgba(41,182,216,0.05); border-style: solid; }
        .drop-zone-text { font-size: 14px; font-weight: 600; color: var(--charcoal-soft); margin: 10px 0 4px; }
        .drop-zone-text span { color: var(--cyan); text-decoration: underline; }
        .drop-zone-hint { font-size: 12px; color: var(--muted); font-weight: 500; }
        .drop-zone-file { display: flex; align-items: center; gap: 12px; text-align: left; }
        .drop-zone-file-icon { font-size: 28px; }
        .drop-zone-filename { font-size: 14px; font-weight: 700; color: var(--charcoal); }
        .drop-zone-filesize { font-size: 12px; color: var(--muted); margin-top: 2px; font-weight: 500; }
        .modal-submit { width: 100%; font-size: 15px; font-weight: 800; color: white; padding: 14px; border-radius: 10px; transition: all 0.2s; font-family: var(--font-h); display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px; }
        .modal-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .modal-submit:disabled { opacity: 0.55; }
        .modal-disclaimer { font-size: 11.5px; color: var(--muted); text-align: center; line-height: 1.6; font-weight: 500; }
        .modal-disclaimer a { color: var(--cyan); }
        .modal-success { padding: 60px 40px; text-align: center; }
        .modal-success-icon { width: 64px; height: 64px; background: rgba(41,182,216,0.1); color: var(--cyan); border-radius: 50%; display: grid; place-items: center; font-size: 28px; margin: 0 auto 20px; }
        .modal-success h3 { font-family: var(--font-h); font-size: 24px; font-weight: 900; margin-bottom: 12px; }
        .modal-success p { font-size: 15px; color: var(--charcoal-soft); line-height: 1.65; margin-bottom: 28px; }
        .modal-success-btn { background: var(--cyan); color: white; font-size: 14px; font-weight: 800; padding: 11px 28px; border-radius: 9px; font-family: var(--font-h); }
        @keyframes dot-pulse { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        .sending-dots span { animation: dot-pulse 1.4s infinite; }
        .sending-dots span:nth-child(2) { animation-delay: 0.2s; }
        .sending-dots span:nth-child(3) { animation-delay: 0.4s; }

        /* DRAWER */
        .drawer-overlay { position: fixed; inset: 0; background: rgba(45,45,58,0.45); z-index: 150; display: flex; justify-content: flex-end; backdrop-filter: blur(2px); }
        .drawer { background: white; width: 100%; max-width: 520px; height: 100vh; overflow-y: auto; position: relative; box-shadow: -12px 0 48px rgba(0,0,0,0.15); }
        .drawer-close { position: absolute; top: 20px; right: 20px; width: 34px; height: 34px; border-radius: 50%; background: var(--slate); display: grid; place-items: center; color: var(--muted); z-index: 1; }
        .drawer-close:hover { background: var(--slate-d); color: var(--charcoal); }
        .drawer-header { padding: 36px 32px 28px; border-bottom: 1px solid var(--slate-d); }
        .drawer-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .drawer-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 11px; border-radius: 10px; font-family: var(--font-h); }
        .drawer-badge { font-size: 10px; font-weight: 800; padding: 4px 11px; border-radius: 10px; background: rgba(45,45,58,0.06); color: var(--charcoal-soft); font-family: var(--font-h); }
        .drawer-title { font-family: var(--font-h); font-size: 26px; font-weight: 900; color: var(--charcoal); margin-bottom: 4px; line-height: 1.2; }
        .drawer-company { font-size: 14px; font-weight: 600; color: var(--muted); margin-bottom: 14px; }
        .drawer-info-row { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 16px; }
        .drawer-info-item { display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 600; color: var(--charcoal-soft); }
        .drawer-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .drawer-apply-btn { width: 100%; font-size: 14px; font-weight: 800; color: white; padding: 13px; border-radius: 10px; font-family: var(--font-h); display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
        .drawer-apply-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .drawer-body { padding: 28px 32px; }
        .drawer-section-title { font-family: var(--font-h); font-size: 15px; font-weight: 800; color: var(--charcoal); margin: 20px 0 8px; }
        .drawer-bullet { display: flex; gap: 10px; font-size: 14px; color: var(--charcoal-soft); line-height: 1.6; margin-bottom: 6px; font-weight: 400; }
        .drawer-bullet span { color: var(--cyan); font-weight: 800; flex-shrink: 0; }
        .drawer-para { font-size: 14px; color: var(--charcoal-soft); line-height: 1.7; margin-bottom: 8px; font-weight: 400; }

        @media (max-width: 640px) {
          .modal-form-grid { grid-template-columns: 1fr; }
          .drawer { max-width: 100%; }
          .jobs-grid { grid-template-columns: 1fr; }
          .filter-bar-inner { flex-direction: column; align-items: flex-start; }
          .filter-search { width: 100%; }
        }
      `}</style>

      {/* HERO */}
      <div className="jobs-hero">
        <div className="jobs-hero-inner">
          <div className="jobs-label">Top 5% Roles Only</div>
          <h1 className="jobs-h1">Exclusive <span>Tech Roles</span><br />for Exceptional Engineers</h1>
          <p className="jobs-sub">
            Every role on this board is a pre-qualified mandate from a vetted client. We only work top 5% talent. If that's you — we want to hear from you.
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="filter-bar-inner">
          <div className="filter-search">
            <Search size={15} color="var(--muted)" />
            <input
              placeholder="Search roles, stack, location..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-divider" />
          <div className="filter-group">
            {REGIONS.map(r => (
              <button key={r} className={`filter-chip${region === r ? ' active-region' : ''}`}
                onClick={() => setRegion(r)}>{r}</button>
            ))}
          </div>
          <div className="filter-divider" />
          <div className="filter-group">
            {TYPES.map(t => (
              <button key={t} className={`filter-chip${type === t ? ' active-type' : ''}`}
                onClick={() => setType(t)}>{t}</button>
            ))}
          </div>
          <span className="filter-count">{filtered.length} role{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* JOB GRID */}
      <div className="jobs-body">
        {filtered.length === 0 ? (
          <div className="no-results">
            <h3>No roles match your filters</h3>
            <p>Try adjusting your search or check back soon — we add new mandates weekly.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {filtered.map(job => (
              <div key={job.id} className="job-card" onClick={() => setSelectedJob(job)}>
                <div className="job-card-stripe" style={{ background: job.color }} />
                <div className="job-card-top">
                  <span className="job-type-tag" style={{ background: `${job.color}18`, color: job.color, border: `1px solid ${job.color}30` }}>{job.type}</span>
                  {job.badge && <span className="job-badge">{job.badge}</span>}
                </div>
                <div className="job-title">{job.title}</div>
                <div className="job-company">{job.company}</div>
                <div className="job-meta">
                  <span className="job-meta-item"><MapPin size={13} style={{ color: job.color }} />{job.locationFull}</span>
                  <span className="job-meta-item job-salary" style={{ color: job.color }}><DollarSign size={13} />{job.salary}</span>
                </div>
                <div className="job-stack">
                  {job.stack.slice(0, 4).map(s => <span key={s} className="stack-chip">{s}</span>)}
                  {job.stack.length > 4 && <span className="stack-chip">+{job.stack.length - 4}</span>}
                </div>
                <div className="job-card-footer">
                  <span className="job-posted"><Clock size={12} />{job.posted}</span>
                  <span className="job-view-btn">View role <ChevronRight size={14} /></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* JOB DETAIL DRAWER */}
      {selectedJob && (
        <JobDetail
          job={selectedJob}
          onApply={() => { setApplyJob(selectedJob); setSelectedJob(null) }}
          onClose={() => setSelectedJob(null)}
        />
      )}

      {/* QUICK APPLY MODAL */}
      {applyJob && (
        <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
      )}
    </>
  )
}
