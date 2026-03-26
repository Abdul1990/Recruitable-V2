import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  MapPin, DollarSign, X, Upload,
  Send, Clock, ChevronRight, Search
} from 'lucide-react'

// ─── JOB DATA ────────────────────────────────────────────────────────────────
const JOBS = [
  // ── US ──────────────────────────────────────────────────────────────────────
  {
    id: 1,
    title: 'AI Engineer',
    company: 'Stealth AI Lab (YC-backed)',
    location: 'SF',
    locationFull: 'San Francisco, CA',
    region: 'US',
    type: 'AI / ML',
    salary: '$185k – $260k',
    salaryNote: 'USD + equity',
    stack: ['PyTorch', 'CUDA', 'LangChain', 'Python', 'MLflow'],
    posted: '1 day ago',
    color: '#E8235A',
    badge: 'Hot Role',
    description: `We are partnering with a well-funded YC-backed AI lab to place an exceptional AI Engineer at the frontier of large-scale model deployment. The company recently closed a Series A and is scaling its core research-to-production pipeline.

**The Role:**
You will design, train, and ship production-grade LLMs and multimodal systems alongside world-class researchers, directly influencing the roadmap of AI systems serving millions of users globally.

**What You'll Do:**
- Fine-tune and adapt foundational models (GPT-4 class and beyond) for enterprise production environments
- Build high-throughput inference pipelines using CUDA-optimised serving stacks
- Design RAG architectures and agentic systems using LangChain and LlamaIndex
- Collaborate with research to bring experimental models to production SLA
- Drive MLflow-based experimentation tracking and model versioning at scale

**You Are:**
- 4+ years of deep ML engineering — not just API wrapping
- Proficient in PyTorch at the CUDA kernel level
- Experienced shipping models to production — not just notebooks
- Familiar with distributed training (FSDP, DeepSpeed)
- SF Bay Area based or willing to relocate (hybrid 3 days on-site)

This is a top 5% mandate. We only submit candidates who have shipped production AI at scale.`,
  },
  {
    id: 2,
    title: 'AI Product Engineer',
    company: 'Stealth Series A Startup (YC W24)',
    location: 'NYC',
    locationFull: 'New York, NY',
    region: 'US',
    type: 'AI / ML',
    salary: '$145k – $195k',
    salaryNote: 'USD + equity',
    stack: ['Next.js', 'LangChain', 'TypeScript', 'OpenAI API', 'Vercel'],
    posted: '3 days ago',
    color: '#E8235A',
    badge: 'New',
    description: `A YC Winter 2024 AI startup is building the next generation of AI-native enterprise tooling. They need a rare hybrid — an engineer who ships beautiful product and understands LLM behaviour at a deep level.

**The Role:**
You will be the 3rd engineering hire, working directly with the founders to design and ship AI-powered features that customers love. Half product engineer, half AI systems thinker.

**What You'll Do:**
- Build and iterate on AI-powered product features using Next.js and OpenAI/Anthropic APIs
- Own prompt engineering and LangChain pipeline architecture for core product flows
- Design and build the frontend with clean, responsive TypeScript/React components
- Integrate user feedback loops to improve model output quality
- Drive technical decisions as an early hire with significant ownership

**You Are:**
- 3+ years as a full-stack or product engineer with AI integration experience
- Deep understanding of LLM behaviour, prompt engineering, and agent frameworks
- Strong TypeScript and React skills — you can ship pixel-perfect UIs
- Excited to be a founding engineer with equity upside
- Based in NYC (hybrid, 3 days on-site)

Early-stage equity. Competitive salary. Real ownership.`,
  },
  {
    id: 3,
    title: 'Forward Deployment Engineer',
    company: 'Enterprise AI Platform (Series B)',
    location: 'NYC',
    locationFull: 'New York, NY',
    region: 'US',
    type: 'AI / ML',
    salary: '$165k – $225k',
    salaryNote: 'USD + commission',
    stack: ['LLM APIs', 'Python', 'React', 'Cloud Infra', 'Enterprise SaaS'],
    posted: '5 hours ago',
    color: '#F5A623',
    badge: '🔥 Urgent',
    description: `This is the rarest role in AI — the bridge between cutting-edge AI capability and enterprise deployment reality. Our client builds AI infrastructure for Fortune 500 companies and needs a Forward Deployment Engineer to own technical relationships from pilot to full production.

**The Role:**
You will be embedded with enterprise clients during their AI adoption journey — part field engineer, part solutions architect, part trusted advisor.

**What You'll Do:**
- Lead technical implementation of AI platform within Fortune 500 environments
- Build custom integrations, RAG pipelines, and workflow automations using client data
- Diagnose complex deployment issues at the intersection of infrastructure, data, and AI
- Translate customer use cases into engineering requirements for the product team
- Travel to client sites (~30%) and represent the company's technical credibility

**You Are:**
- A full-stack engineer with solutions engineering or customer-facing technical experience
- Comfortable presenting to C-suite and debugging Kubernetes in the same day
- Deep knowledge of LLM APIs (OpenAI, Anthropic, Gemini) and RAG architectures
- 3+ years engineering with 1+ year in a client-facing technical role
- New York City based (travel required)

Top performers earn $280k+ OTE.`,
  },
  {
    id: 4,
    title: 'ML Engineer',
    company: 'AI-Native Fintech (Series C)',
    location: 'SF',
    locationFull: 'San Francisco, CA',
    region: 'US',
    type: 'AI / ML',
    salary: '$175k – $240k',
    salaryNote: 'USD + equity',
    stack: ['JAX', 'TensorFlow', 'Python', 'Kubernetes', 'Ray'],
    posted: '2 days ago',
    color: '#E8235A',
    badge: 'Senior',
    description: `A high-growth AI-native fintech is scaling its core ML team. They need a senior ML Engineer to own the fraud detection and risk modelling pipeline — a system processing 50M+ transactions daily requiring sub-10ms P99 latency.

**The Role:**
You will be the technical lead for a team of 3 ML engineers, owning the full lifecycle from feature engineering to production inference.

**What You'll Do:**
- Architect and scale real-time ML inference systems using Ray Serve and Kubernetes
- Build and improve gradient-boosted and deep learning models for transaction risk scoring
- Lead the migration from TensorFlow 1.x legacy systems to JAX/Flax
- Implement feature stores and real-time feature pipelines using Feast and Kafka
- Drive A/B testing frameworks for model performance validation

**You Are:**
- 5+ years ML engineering with 2+ years in a tech lead capacity
- Deep experience with low-latency serving systems (P99 < 10ms)
- Production experience with JAX or strong willingness to upskill rapidly
- Familiar with financial data, fraud signals, or risk modelling
- SF Bay Area based or willing to relocate

Exceptional compensation for an exceptional engineer.`,
  },
  {
    id: 5,
    title: 'Data Engineer',
    company: 'Stealth AI Infrastructure (YC S23)',
    location: 'SF',
    locationFull: 'San Francisco, CA',
    region: 'US',
    type: 'Data',
    salary: '$145k – $195k',
    salaryNote: 'USD + equity',
    stack: ['Spark', 'dbt', 'Airflow', 'Snowflake', 'Python'],
    posted: '4 days ago',
    color: '#3F51B5',
    badge: 'Top Pick',
    description: `A YC Summer 2023 AI infrastructure company is building the data foundation for the next wave of enterprise AI. They need a Data Engineer who can design and own the pipelines that power both their product and internal ML systems.

**The Role:**
You will architect and maintain the data infrastructure that feeds real-time ML models, analytics dashboards, and customer-facing AI features.

**What You'll Do:**
- Design and build scalable data pipelines using Spark and Airflow
- Own the dbt transformation layer across Snowflake data warehouse
- Implement real-time streaming pipelines using Kafka or Kinesis
- Build data quality frameworks and observability tooling
- Partner with ML engineers to design feature pipelines for production models

**You Are:**
- 3+ years data engineering experience with production pipeline ownership
- Strong SQL and Python skills — you write clean, tested code
- Experience with Snowflake, BigQuery, or Redshift at scale
- Familiar with data modelling patterns (Kimball, Data Vault)
- SF Bay Area based or open to relocation (hybrid)

Build the data layer that powers frontier AI. Real equity, real impact.`,
  },
  {
    id: 6,
    title: 'Full Stack Engineer',
    company: 'Stealth B2B SaaS (YC S24)',
    location: 'NYC',
    locationFull: 'New York, NY',
    region: 'US',
    type: 'Engineering',
    salary: '$135k – $175k',
    salaryNote: 'USD + equity',
    stack: ['React', 'Next.js', 'TypeScript', 'Go', 'PostgreSQL'],
    posted: '1 week ago',
    color: '#03A9F4',
    badge: null,
    description: `A YC Summer 2024 B2B SaaS company is scaling its product engineering team. They've gone from 0 to $2M ARR in 8 months and need a Full Stack Engineer who can maintain quality while shipping at speed.

**The Role:**
You will join a lean team of 5 engineers and own features end-to-end — API design to polished frontend — with real autonomy and direct impact on the product roadmap.

**What You'll Do:**
- Build and ship customer-facing features using React/Next.js with TypeScript
- Design and implement RESTful and GraphQL APIs in Go
- Own database schema design and query optimisation in PostgreSQL
- Contribute to infrastructure-as-code on AWS
- Participate in technical architecture decisions with the founding team

**You Are:**
- 3+ years full stack experience with depth in both frontend and backend
- Fluent in TypeScript — you write typed code by default
- Experienced with Go or Rust (or motivated to move to compiled backend)
- Comfortable with fast-paced early-stage environments
- NYC based (hybrid, 3 days)

Founding engineer track. Significant equity upside.`,
  },
  {
    id: 7,
    title: 'Backend Engineer',
    company: 'AI Developer Tools (YC W23)',
    location: 'Remote',
    locationFull: 'Remote (US-based)',
    region: 'US',
    type: 'Engineering',
    salary: '$145k – $190k',
    salaryNote: 'USD + equity',
    stack: ['Rust', 'Go', 'Postgres', 'Redis', 'Kubernetes'],
    posted: '3 days ago',
    color: '#03A9F4',
    badge: 'Remote',
    description: `A YC Winter 2023 AI developer tools company with 4,000+ paying customers needs a Backend Engineer to help scale their infrastructure through their next phase of growth. The stack is Rust and Go — performance is the product.

**The Role:**
You will own backend systems that thousands of developers rely on daily, with a focus on latency, correctness, and reliability.

**What You'll Do:**
- Build and maintain high-performance backend services in Rust and Go
- Own PostgreSQL database architecture, query optimisation, and migrations
- Design and implement Redis-based caching and pub/sub systems
- Scale Kubernetes-based infrastructure to handle 10x traffic growth
- Participate in on-call rotation with a small, senior engineering team

**You Are:**
- 4+ years backend engineering, with production Rust or Go experience
- Deep understanding of database internals and query optimisation
- Experience with distributed systems and high-availability design
- US-based and comfortable with async-first remote culture
- Bonus: Open source contributor or systems programming background

Fully remote. Quarterly team offsites in San Francisco.`,
  },
  {
    id: 8,
    title: 'Engineering Manager',
    company: 'Stealth AI Startup (Series B, $80M raised)',
    location: 'SF',
    locationFull: 'San Francisco, CA',
    region: 'US',
    type: 'Engineering',
    salary: '$185k – $255k',
    salaryNote: 'USD + equity',
    stack: ['Python', 'AWS', 'Agile', 'LLMs', 'Team Building'],
    posted: '5 days ago',
    color: '#F5A623',
    badge: 'Leadership',
    description: `A well-funded Series B AI startup ($80M raised, stealth) is looking for an Engineering Manager to lead and scale their core product engineering team. This is a critical hire as the company prepares for a major product launch.

**The Role:**
You will manage a team of 8 engineers across backend, ML, and frontend, driving both technical excellence and team culture as the company scales.

**What You'll Do:**
- Manage and mentor a team of 8 engineers across backend, ML infra, and frontend
- Own the engineering delivery roadmap in partnership with the CPO and CTO
- Drive hiring — you will grow the team to 15 in the next 12 months
- Establish engineering standards, code review culture, and incident response
- Remove blockers and protect the team's focus on high-impact work

**You Are:**
- 3+ years engineering management with 6+ years prior software engineering
- Track record of hiring and retaining senior engineers in competitive markets
- Technically credible — you can review a PR and catch architectural issues
- Experience in AI/ML product companies strongly preferred
- SF Bay Area based (3 days on-site)

Significant equity. Real influence on company direction.`,
  },
  {
    id: 9,
    title: 'Data Scientist',
    company: 'AI Health Intelligence (YC W24)',
    location: 'NYC',
    locationFull: 'New York, NY',
    region: 'US',
    type: 'Data',
    salary: '$125k – $165k',
    salaryNote: 'USD + equity',
    stack: ['Python', 'R', 'Statistics', 'Pandas', 'scikit-learn'],
    posted: '6 days ago',
    color: '#3F51B5',
    badge: null,
    description: `A YC Winter 2024 healthtech AI company is using LLMs and statistical modelling to transform clinical decision-making. They need a Data Scientist who can bridge rigorous statistical methodology with practical AI product development.

**The Role:**
You will work at the intersection of clinical data analysis, statistical modelling, and ML experimentation to improve patient outcomes at scale.

**What You'll Do:**
- Design and run experiments to validate AI model improvements using rigorous statistical methods
- Build predictive models using patient data (de-identified) to surface clinical insights
- Partner with ML engineers to translate research findings into production features
- Own dashboards and reporting infrastructure for clinical outcomes metrics
- Communicate complex statistical findings to non-technical stakeholders

**You Are:**
- 3+ years data science experience, ideally with healthcare or regulated industry exposure
- Strong statistical fundamentals — you understand p-values, confidence intervals, and causality
- Proficient in Python (Pandas, scikit-learn, statsmodels) and R
- Comfortable working with sensitive data under HIPAA constraints
- NYC based (hybrid)

Work that matters. Real mission, real equity.`,
  },
  {
    id: 10,
    title: 'AI Product Manager',
    company: 'Enterprise AI SaaS (Series B)',
    location: 'SF',
    locationFull: 'San Francisco, CA',
    region: 'US',
    type: 'Product',
    salary: '$140k – $190k',
    salaryNote: 'USD + equity',
    stack: ['Product Strategy', 'LLM Products', 'Roadmapping', 'SQL', 'Figma'],
    posted: '2 days ago',
    color: '#FF9400',
    badge: 'Hot Role',
    description: `A Series B enterprise AI SaaS company with $40M ARR is looking for an AI Product Manager to own the next generation of their AI-native features. This is a role for someone who understands both the technical depth of LLMs and the practical needs of enterprise buyers.

**The Role:**
You will work directly with the CEO and CTO to define the AI product roadmap and drive cross-functional delivery across engineering, design, and go-to-market.

**What You'll Do:**
- Define and prioritise the AI product roadmap based on customer insights and market opportunity
- Work with engineering to spec and ship LLM-powered features with clear success metrics
- Own the feedback loop between enterprise customers and the AI development team
- Conduct competitive analysis and define differentiated positioning for AI capabilities
- Drive alignment across engineering, design, sales, and customer success

**You Are:**
- 4+ years product management, with 1+ year owning AI or ML features
- Technically literate — you can read API docs, understand model limitations, and speak to engineers in their language
- Strong writer and communicator — your PRDs are clear and your demos are compelling
- Experience with enterprise B2B SaaS
- SF based (hybrid, 3 days)

Define the AI future of a category-defining product.`,
  },

  // ── KL ──────────────────────────────────────────────────────────────────────
  {
    id: 11,
    title: 'AI Engineer',
    company: 'Stealth Regional Tech Unicorn',
    location: 'KL',
    locationFull: 'Kuala Lumpur, Malaysia',
    region: 'KL',
    type: 'AI / ML',
    salary: 'RM 25k – 40k',
    salaryNote: 'MYR / month',
    stack: ['Python', 'PyTorch', 'FastAPI', 'AWS', 'LLMs'],
    posted: '2 days ago',
    color: '#E8235A',
    badge: 'Hot Role',
    description: `Malaysia's fastest-growing tech company is building AI capabilities in-house and needs a founding AI Engineer to lead their LLM product development. This is a rare opportunity to be the first AI hire at a company with regional scale.

**The Role:**
You will architect and build the company's core AI systems — from data pipelines to model fine-tuning to production API infrastructure.

**What You'll Do:**
- Design and build LLM-powered features using OpenAI, Anthropic, and open-source models
- Fine-tune and evaluate foundational models for Southeast Asian market use cases
- Build FastAPI-based inference services and integrate them into the core platform
- Own the AI evaluation framework and model quality metrics
- Work with product and engineering to ship AI features to millions of SEA users

**You Are:**
- 3+ years ML or AI engineering with LLM experience
- Strong Python skills and familiarity with HuggingFace, LangChain, or similar
- Experience deploying models to production on AWS or GCP
- Bonus: Malay language NLP experience or SEA market context
- Based in or willing to relocate to Kuala Lumpur

Join before Series C. Real equity, regional impact.`,
  },
  {
    id: 12,
    title: 'Full Stack Developer',
    company: 'Leading Southeast Asian Superapp',
    location: 'KL',
    locationFull: 'Kuala Lumpur, Malaysia',
    region: 'KL',
    type: 'Engineering',
    salary: 'RM 15k – 25k',
    salaryNote: 'MYR / month',
    stack: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
    posted: '3 days ago',
    color: '#03A9F4',
    badge: 'Top Pick',
    description: `Southeast Asia's largest superapp is expanding its platform engineering team in KL and needs a senior Full Stack Developer to help scale their consumer-facing applications to 50M+ users.

**The Role:**
You will join a high-performing product squad and own full-stack features across web and mobile-web, shipping at scale for one of the region's most-used consumer apps.

**What You'll Do:**
- Build and ship consumer-facing features using React and Node.js
- Design and optimise MongoDB schemas for high-read, high-write workloads
- Integrate third-party APIs (payments, logistics, KYC) with robust error handling
- Build and monitor AWS infrastructure (ECS, RDS, CloudFront, Lambda)
- Collaborate closely with product, design, and QA to ship high-quality features

**You Are:**
- 4+ years full stack experience with strong JavaScript/TypeScript skills
- Comfortable with high-scale systems (tens of millions of users)
- AWS-certified or actively pursuing certification (company will fund)
- Based in or willing to relocate to Kuala Lumpur
- Bonus: E-commerce, fintech, or logistics product experience

Competitive salary + ESOP + relocation support.`,
  },
  {
    id: 13,
    title: 'ML Engineer',
    company: "Malaysia's Largest E-commerce Platform",
    location: 'KL',
    locationFull: 'Kuala Lumpur, Malaysia',
    region: 'KL',
    type: 'AI / ML',
    salary: 'RM 20k – 32k',
    salaryNote: 'MYR / month',
    stack: ['Python', 'TensorFlow', 'Spark', 'Hadoop', 'Kubernetes'],
    posted: '1 week ago',
    color: '#E8235A',
    badge: 'Senior',
    description: `Malaysia's leading e-commerce platform is investing heavily in personalisation, recommendations, and fraud detection, and needs a senior ML Engineer to own these critical systems.

**The Role:**
You will build and maintain ML systems that power product recommendations, search ranking, and fraud detection for tens of millions of shoppers.

**What You'll Do:**
- Build and maintain production recommendation and ranking models using TensorFlow
- Own large-scale feature engineering pipelines using Spark on Hadoop
- Deploy and monitor ML models using Kubernetes-based serving infrastructure
- Design A/B testing frameworks for online model evaluation
- Partner with data engineers and product teams to deliver measurable business impact

**You Are:**
- 4+ years ML engineering with production model deployment experience
- Strong Python and TensorFlow skills; Spark experience is essential
- Experience with recommendation systems or search ranking is a strong plus
- Based in or willing to relocate to Kuala Lumpur
- Bonus: Experience with e-commerce or marketplace platforms

Large-scale ML. Real-world impact. Regional brand.`,
  },
  {
    id: 14,
    title: 'Data Engineer',
    company: 'Top-5 Malaysian Bank (Digital Division)',
    location: 'KL',
    locationFull: 'Kuala Lumpur, Malaysia',
    region: 'KL',
    type: 'Data',
    salary: 'RM 18k – 28k',
    salaryNote: 'MYR / month',
    stack: ['Spark', 'dbt', 'Airflow', 'AWS', 'PostgreSQL'],
    posted: '4 days ago',
    color: '#3F51B5',
    badge: null,
    description: `A top-5 Malaysian bank is building a world-class data platform in its digital banking division and needs a Data Engineer to help architect and operate the pipelines that power AI-driven banking features.

**The Role:**
You will design, build, and maintain data pipelines that serve both regulatory reporting and AI product development for one of Malaysia's most trusted financial institutions.

**What You'll Do:**
- Build and maintain batch and streaming data pipelines using Spark and Airflow
- Own the dbt transformation layer across the bank's central data warehouse
- Implement data quality monitoring and observability tooling
- Work with ML teams to build feature stores for credit scoring and fraud detection models
- Ensure data governance and regulatory compliance across all pipelines

**You Are:**
- 3+ years data engineering with strong SQL and Python skills
- Experience with Spark, Airflow, and a cloud data warehouse (Snowflake, BigQuery, Redshift)
- Comfortable working within a regulated financial environment
- Based in Kuala Lumpur
- Bonus: Banking, insurance, or fintech data experience

Stability + innovation. Real-world financial AI at scale.`,
  },
  {
    id: 15,
    title: 'Product Manager',
    company: 'Stealth Fintech Scale-up (Series B)',
    location: 'KL',
    locationFull: 'Kuala Lumpur, Malaysia',
    region: 'KL',
    type: 'Product',
    salary: 'RM 15k – 25k',
    salaryNote: 'MYR / month',
    stack: ['Agile', 'Product Discovery', 'SQL', 'Figma', 'JTBD'],
    posted: '5 days ago',
    color: '#FF9400',
    badge: null,
    description: `A stealth fintech company (Series B, $30M raised) is disrupting SME lending in Southeast Asia and needs a Product Manager to own their core borrower product experience.

**The Role:**
You will work directly with the CPO to define and deliver the product roadmap for a lending platform used by thousands of SMEs across Malaysia and the region.

**What You'll Do:**
- Define and prioritise the product roadmap based on user research and business goals
- Work with engineering to scope, spec, and deliver features on time
- Own end-to-end product discovery using Jobs-to-be-Done and outcome-based frameworks
- Analyse product metrics using SQL and BI dashboards to drive decisions
- Collaborate with design, compliance, and risk teams to ship regulated financial products

**You Are:**
- 3+ years product management in a B2C or B2B SaaS or fintech environment
- Data-driven — you can write SQL and build dashboards yourself
- Experienced with Agile delivery in cross-functional teams
- Based in or willing to relocate to Kuala Lumpur
- Bonus: Lending, payments, or Southeast Asian market experience

High ownership. Real equity. Fast-growing regional fintech.`,
  },
  {
    id: 16,
    title: 'Backend Engineer',
    company: "Malaysia's Fastest-Growing Digital Bank",
    location: 'KL',
    locationFull: 'Kuala Lumpur, Malaysia',
    region: 'KL',
    type: 'Engineering',
    salary: 'RM 14k – 22k',
    salaryNote: 'MYR / month',
    stack: ['Go', 'PostgreSQL', 'Kubernetes', 'GCP', 'gRPC'],
    posted: '3 days ago',
    color: '#03A9F4',
    badge: null,
    description: `Malaysia's fastest-growing digital bank is scaling its core banking platform and needs a Backend Engineer to help build the reliable, secure infrastructure that millions of Malaysians depend on.

**The Role:**
You will build backend services for core banking functions — accounts, payments, transfers, and notifications — on a modern Go-based microservices stack.

**What You'll Do:**
- Build and maintain high-reliability Go microservices for core banking operations
- Design PostgreSQL schemas and optimise queries for financial transaction workloads
- Implement gRPC-based inter-service communication across a Kubernetes cluster on GCP
- Own security-first development practices in a regulated banking environment
- Participate in on-call and incident response for production banking systems

**You Are:**
- 3+ years backend engineering with Go or strong desire to move from Java/Kotlin
- Experience with PostgreSQL and relational database design
- Comfortable with Kubernetes and cloud-native deployment on GCP or AWS
- Understanding of financial services or payments systems is a strong plus
- Based in Kuala Lumpur

Build Malaysia's financial future. Competitive salary + banking benefits.`,
  },
  {
    id: 17,
    title: 'Data Scientist',
    company: 'APAC InsurTech Leader',
    location: 'KL',
    locationFull: 'Kuala Lumpur, Malaysia',
    region: 'KL',
    type: 'Data',
    salary: 'RM 14k – 22k',
    salaryNote: 'MYR / month',
    stack: ['Python', 'R', 'Machine Learning', 'Tableau', 'Statistics'],
    posted: '1 week ago',
    color: '#3F51B5',
    badge: null,
    description: `Southeast Asia's leading InsurTech company is building the next generation of risk pricing and claims automation, and needs a Data Scientist to drive their analytical and ML capabilities.

**The Role:**
You will develop statistical models and ML systems that power insurance pricing, fraud detection, and claims automation for millions of policyholders.

**What You'll Do:**
- Build and validate actuarial and ML models for insurance risk pricing
- Develop fraud detection models using claims and behavioural data
- Own the experimentation framework for model evaluation and business impact measurement
- Create dashboards and reporting for business stakeholders using Tableau
- Work with data engineers to access and prepare training data

**You Are:**
- 3+ years data science experience, ideally with insurance, banking, or financial risk
- Strong statistical foundations — comfortable with GLMs, survival models, Bayesian methods
- Proficient in Python and R; SQL is essential
- Based in or willing to relocate to Kuala Lumpur
- Bonus: Actuarial background or insurance domain knowledge

Regional scale. Meaningful work. Competitive compensation.`,
  },
  {
    id: 18,
    title: 'Engineering Manager',
    company: 'Regional Tech MNC (Global Engineering Team)',
    location: 'KL',
    locationFull: 'Kuala Lumpur, Malaysia',
    region: 'KL',
    type: 'Engineering',
    salary: 'RM 22k – 38k',
    salaryNote: 'MYR / month',
    stack: ['Leadership', 'Agile', 'Python', 'AWS', 'Team Scaling'],
    posted: '2 days ago',
    color: '#F5A623',
    badge: 'Leadership',
    description: `A global technology MNC is growing its KL engineering hub into a major delivery centre and needs an Engineering Manager to lead a team of 10 engineers across backend, data, and DevOps.

**The Role:**
You will own the people, process, and delivery for one of KL's highest-profile engineering teams, working closely with global product and architecture leadership.

**What You'll Do:**
- Manage and grow a team of 10 engineers across backend, data engineering, and DevOps
- Own delivery planning, sprint execution, and stakeholder communication
- Drive hiring across all levels — you will double the team in 18 months
- Establish engineering standards, code review culture, and on-call processes
- Partner with global product and architecture leaders to align on roadmap

**You Are:**
- 3+ years engineering management with 6+ years prior hands-on software engineering
- Experienced managing distributed or cross-time-zone teams
- Technically credible — comfortable reviewing code and discussing system design
- Based in or willing to relocate to Kuala Lumpur
- Bonus: Experience growing engineering hubs in Southeast Asia

Lead a world-class team. KL-based. Global scope.`,
  },

  // ── London ──────────────────────────────────────────────────────────────────
  {
    id: 19,
    title: 'AI Engineer',
    company: 'London DeepTech (Series A)',
    location: 'LON',
    locationFull: 'London, UK',
    region: 'London',
    type: 'AI / ML',
    salary: '£90k – £135k',
    salaryNote: 'GBP + equity',
    stack: ['PyTorch', 'Python', 'CUDA', 'Transformers', 'AWS'],
    posted: '2 days ago',
    color: '#E8235A',
    badge: 'Hot Role',
    description: `A well-funded London-based DeepTech company (Series A, £25M raised) is building proprietary AI models for scientific discovery and needs an exceptional AI Engineer to join their core research engineering team.

**The Role:**
You will work alongside ML researchers and domain scientists to build the training infrastructure and production systems that bring cutting-edge research to real-world application.

**What You'll Do:**
- Build and maintain distributed model training infrastructure using PyTorch on AWS
- Implement CUDA kernels and optimise model performance for throughput and latency
- Develop transformer-based model architectures and evaluation pipelines
- Build production inference APIs and monitoring systems
- Partner with research scientists to accelerate their experimental iteration

**You Are:**
- 4+ years ML engineering with production PyTorch experience
- Strong understanding of transformer architectures and training dynamics
- Experience with distributed training (DDP, FSDP) is highly valued
- Based in London or willing to relocate (hybrid, 3 days on-site)
- Right to work in the UK required

World-class research. London-based. Significant equity.`,
  },
  {
    id: 20,
    title: 'ML Engineer',
    company: 'Leading UK Fintech (Series C)',
    location: 'LON',
    locationFull: 'London, UK',
    region: 'London',
    type: 'AI / ML',
    salary: '£85k – £120k',
    salaryNote: 'GBP + equity',
    stack: ['Python', 'JAX', 'Kubernetes', 'GCP', 'Feast'],
    posted: '4 days ago',
    color: '#E8235A',
    badge: 'Senior',
    description: `One of the UK's fastest-growing fintech companies (Series C, £150M raised) is scaling its ML platform and needs a senior ML Engineer to own the feature platform and model serving infrastructure for their credit and risk products.

**The Role:**
You will be the 4th ML hire reporting to the Head of ML, owning the infrastructure that powers real-time credit decisions for hundreds of thousands of customers.

**What You'll Do:**
- Build and maintain the ML feature platform using Feast on GCP
- Implement real-time model serving infrastructure for credit risk decisions
- Migrate legacy TensorFlow models to JAX for improved performance
- Design and own the MLOps pipeline from experimentation to production
- Work closely with data scientists and risk analysts to ship production models

**You Are:**
- 4+ years ML engineering with production model serving experience
- Strong Python skills; JAX experience is a plus or strong upskilling intent
- Experience with feature stores and real-time ML infrastructure
- Financial services, credit, or risk ML experience is a strong advantage
- Based in London (hybrid, 2-3 days on-site)

Top-tier UK fintech. Exceptional compensation. Real equity.`,
  },
  {
    id: 21,
    title: 'Full Stack Engineer',
    company: 'Stealth B2B SaaS Scale-up (£50M ARR)',
    location: 'LON',
    locationFull: 'London, UK',
    region: 'London',
    type: 'Engineering',
    salary: '£70k – £100k',
    salaryNote: 'GBP + equity',
    stack: ['React', 'TypeScript', 'Go', 'PostgreSQL', 'AWS'],
    posted: '1 week ago',
    color: '#03A9F4',
    badge: null,
    description: `A stealth B2B SaaS company with £50M ARR and growing is expanding its product engineering team in London. They've built an exceptional product without much noise — and now they're scaling.

**The Role:**
You will join a senior engineering team and own features end-to-end, from API design in Go to polished frontend in React/TypeScript, with real autonomy over technical decisions.

**What You'll Do:**
- Build and ship customer-facing features using React with TypeScript
- Design and implement RESTful APIs in Go with a focus on correctness and performance
- Own PostgreSQL database schema design and query optimisation
- Contribute to AWS infrastructure using Terraform
- Participate in code reviews, architecture discussions, and technical strategy

**You Are:**
- 4+ years full stack engineering experience
- Comfortable with TypeScript across the stack — you write typed code by default
- Go experience or deep motivation to work in a compiled backend language
- Based in London (hybrid, 2 days on-site)
- Right to work in the UK required

Profitable, growing, low-noise. Real equity. Excellent team.`,
  },
  {
    id: 22,
    title: 'Data Engineer',
    company: 'Tier-1 Investment Bank (Technology Division)',
    location: 'LON',
    locationFull: 'London, UK',
    region: 'London',
    type: 'Data',
    salary: '£75k – £115k',
    salaryNote: 'GBP + bonus',
    stack: ['Spark', 'dbt', 'Airflow', 'Snowflake', 'Python'],
    posted: '5 days ago',
    color: '#3F51B5',
    badge: null,
    description: `A global tier-1 investment bank's technology division is modernising its data infrastructure and needs a Data Engineer to help build the pipelines that power trading analytics, risk reporting, and AI research.

**The Role:**
You will design, build, and maintain data pipelines that serve both regulatory reporting and quantitative research teams, working with Snowflake and Spark at scale.

**What You'll Do:**
- Build and maintain batch data pipelines using Spark and Airflow on AWS
- Own the dbt transformation layer across Snowflake for trading and risk data
- Implement data quality monitoring, SLA alerting, and observability tooling
- Work with quantitative researchers to build data products for model training
- Ensure compliance with financial data governance and regulatory requirements

**You Are:**
- 4+ years data engineering with experience in financial services or regulated industries
- Strong SQL and Python, with Spark and Airflow production experience
- Snowflake or BigQuery data warehouse experience
- Comfortable working within a structured, compliance-aware environment
- Based in London (hybrid)

Tier-1 compensation. Exceptional data scale. London City.`,
  },
  {
    id: 23,
    title: 'Product Manager',
    company: 'AI Legal Tech (YC-backed, London)',
    location: 'LON',
    locationFull: 'London, UK',
    region: 'London',
    type: 'Product',
    salary: '£70k – £95k',
    salaryNote: 'GBP + equity',
    stack: ['Product Strategy', 'AI Products', 'Agile', 'SQL', 'Figma'],
    posted: '3 days ago',
    color: '#FF9400',
    badge: 'New',
    description: `A YC-backed AI legal tech company is transforming how law firms and in-house teams work, and needs a Product Manager to own their core AI-powered document intelligence product.

**The Role:**
You will work directly with the founders to define the product roadmap, drive customer discovery, and deliver AI-powered features that make lawyers dramatically more productive.

**What You'll Do:**
- Define and prioritise the AI product roadmap based on lawyer user research and legal workflows
- Work closely with engineering to spec and ship LLM-powered document features
- Own the customer feedback loop between law firm users and the engineering team
- Define success metrics and build dashboards to track product impact
- Partner with the sales team to align product capabilities with enterprise deals

**You Are:**
- 3+ years product management experience, ideally with B2B SaaS or legal/professional services
- Technically literate — comfortable reading API docs and discussing LLM capabilities
- Strong writer and communicator — your specs are clear and your demos sell
- Based in London (hybrid)
- Right to work in the UK required

Early-stage. Big mission. Real equity.`,
  },
  {
    id: 24,
    title: 'Backend Engineer',
    company: 'UK RegTech Leader (Series B)',
    location: 'LON',
    locationFull: 'London, UK',
    region: 'London',
    type: 'Engineering',
    salary: '£65k – £95k',
    salaryNote: 'GBP + equity',
    stack: ['Python', 'Go', 'PostgreSQL', 'GCP', 'Kafka'],
    posted: '6 days ago',
    color: '#03A9F4',
    badge: null,
    description: `The UK's leading RegTech company (Series B, £40M raised) is building the compliance infrastructure for financial services and needs a Backend Engineer to help scale their data processing and API platform.

**The Role:**
You will own backend services that process millions of financial transactions daily for compliance monitoring, working in Python and Go on a modern GCP stack.

**What You'll Do:**
- Build and maintain high-throughput data processing services in Python and Go
- Design and optimise PostgreSQL schemas for compliance and audit trail data
- Implement Kafka-based event streaming for real-time transaction monitoring
- Deploy and manage services on GCP using Kubernetes
- Work with compliance and product teams to deliver regulatory requirements

**You Are:**
- 3+ years backend engineering with Python and growing Go interest
- Comfortable with event-driven architecture and message queues
- Experience with GCP or AWS cloud-native services
- Financial services, compliance, or RegTech experience is a plus
- Based in London (hybrid, 2 days on-site)

Compliance is the new infrastructure. Series B equity. London.`,
  },
  {
    id: 25,
    title: 'Engineering Manager',
    company: 'Fast-Scaling UK HealthTech (Series C)',
    location: 'LON',
    locationFull: 'London, UK',
    region: 'London',
    type: 'Engineering',
    salary: '£105k – £145k',
    salaryNote: 'GBP + equity',
    stack: ['Leadership', 'Python', 'AWS', 'Agile', 'Team Scaling'],
    posted: '1 day ago',
    color: '#F5A623',
    badge: 'Leadership',
    description: `A fast-scaling UK HealthTech company (Series C, £80M raised) is building AI-driven clinical decision support tools and needs an Engineering Manager to lead their platform engineering team through a critical growth phase.

**The Role:**
You will manage a team of 9 engineers across backend, data platform, and infrastructure, driving delivery, culture, and hiring as the company prepares for enterprise NHS rollout.

**What You'll Do:**
- Lead and grow a team of 9 engineers across platform, data, and infrastructure
- Own the delivery roadmap for the platform engineering team in partnership with the CTO
- Drive hiring — you will grow to 16 engineers in 18 months
- Establish engineering culture, incident response, and on-call processes
- Represent engineering in cross-functional leadership discussions

**You Are:**
- 3+ years engineering management with 6+ years prior software engineering experience
- Track record of growing and retaining senior engineers
- Technical credibility — you can read code, review PRDs, and make architectural calls
- Experience in healthtech, regulated environments, or enterprise SaaS
- Based in London (hybrid)

Lead the engineering team of a company changing healthcare. Significant equity.`,
  },
  {
    id: 26,
    title: 'Forward Deployment Engineer',
    company: 'Enterprise AI (US-HQ, London Hub)',
    location: 'LON',
    locationFull: 'London, UK',
    region: 'London',
    type: 'AI / ML',
    salary: '£85k – £120k',
    salaryNote: 'GBP + equity',
    stack: ['LLM APIs', 'Python', 'Enterprise SaaS', 'Cloud', 'Solutions Arch.'],
    posted: '2 days ago',
    color: '#F5A623',
    badge: 'Hot Role',
    description: `A US-headquartered enterprise AI company is expanding into the European market and needs a Forward Deployment Engineer to be their first London hire — owning technical relationships with FTSE 100 clients from first pilot to full deployment.

**The Role:**
You will be the technical face of the company for European enterprise clients — part implementation engineer, part solutions architect, part trusted advisor.

**What You'll Do:**
- Lead technical onboarding and implementation of the AI platform for FTSE 100 clients
- Build custom integrations, RAG pipelines, and workflow automations using client data
- Diagnose and resolve complex deployment issues across enterprise infrastructure
- Translate client requirements into product feedback for the US engineering team
- Travel across UK and Europe to client sites (~25%)

**You Are:**
- A full-stack engineer with enterprise implementation or solutions engineering experience
- Comfortable working with C-suite and debugging API integrations in the same day
- Strong knowledge of LLM APIs and enterprise integration patterns
- UK-based (London) with right to work in the UK
- Bonus: German or French language skills for European client coverage

Be the first London hire. Shape the European go-to-market. Significant equity.`,
  },
]

const REGIONS = ['All', 'US', 'KL', 'London']
const TYPES = ['All', 'AI / ML', 'Engineering', 'Data', 'Product']

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
      // Read CV file as base64 so bytes are actually transmitted
      let fileData = null
      let fileType = null
      if (file) {
        fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        fileType = file.type
      }
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          note: form.note,
          jobTitle: job.title,
          jobCompany: job.company,
          fileName: file ? file.name : null,
          fileData,
          fileType,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed')
      }
      setStatus('sent')
    } catch (err) {
      setStatus('idle')
      alert(err.message || 'Something went wrong. Please email info@recruitable.asia directly.')
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
            <p>We&apos;ve received your application for <strong>{job.title}</strong> at {job.company}. Our team reviews every CV personally — you&apos;ll hear from us within 2 business days.</p>
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
                <label>Anything you&apos;d like us to know? <span className="file-hint">(optional)</span></label>
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

// ─── REGION SEO CONFIG ───────────────────────────────────────────────────────
const REGION_SEO = {
  US: {
    title: 'AI & Tech Jobs in the United States | Recruitable',
    description: 'Browse exclusive AI Engineer, LLM Engineer, Data Scientist, and Software Engineering roles across San Francisco, New York, and beyond. Top 5% vetted APAC talent placed into US companies by Recruitable.',
    keywords: 'AI engineer jobs US, LLM engineer jobs New York, AI jobs San Francisco, tech jobs United States, data scientist jobs US, software engineer recruitment US, AI staffing agency US, forward deployment engineer jobs US, LLM jobs Silicon Valley, APAC talent for US companies',
    canonical: 'https://recruitable.asia/jobs?region=US',
    ogTitle: 'AI & Tech Jobs in the United States | Recruitable',
    ogDesc: 'Top 5% AI Engineers, LLM Engineers, Data Scientists, and Software Engineers placed into US companies from APAC talent pools. Roles across SF, NYC, and beyond.',
    schema: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "AI & Tech Jobs in the United States",
      "description": "Exclusive AI, ML, Data Science, and Software Engineering roles across San Francisco, New York, and US tech hubs — sourced by Recruitable from APAC's top 5% talent pool.",
      "url": "https://recruitable.asia/jobs?region=US",
      "numberOfItems": JOBS.filter(j => j.region === 'US').length,
      "provider": { "@type": "EmploymentAgency", "name": "Recruitable", "url": "https://recruitable.asia" }
    }
  },
  KL: {
    title: 'AI & Tech Jobs in Kuala Lumpur, Malaysia | Recruitable',
    description: 'Browse exclusive AI Engineer, Data Scientist, and Software Engineering roles in Kuala Lumpur and Malaysia. Top 5% pre-vetted talent from APAC\'s fastest-growing tech hub. Placed by Recruitable.',
    keywords: 'AI engineer jobs Kuala Lumpur, tech jobs Malaysia, software engineer jobs KL, data scientist jobs Malaysia, AI jobs Southeast Asia, LLM engineer jobs Malaysia, tech recruitment Kuala Lumpur, software engineering jobs Malaysia, AI talent Malaysia, FAANG jobs Kuala Lumpur',
    canonical: 'https://recruitable.asia/jobs?region=KL',
    ogTitle: 'AI & Tech Jobs in Kuala Lumpur, Malaysia | Recruitable',
    ogDesc: 'Top 5% AI Engineers, LLM Engineers, Data Scientists, and Software Engineers in Kuala Lumpur. Pre-vetted by Recruitable, APAC\'s specialist tech recruiter.',
    schema: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "AI & Tech Jobs in Kuala Lumpur, Malaysia",
      "description": "Exclusive AI, ML, Data Science, and Software Engineering roles in Kuala Lumpur — Malaysia's fastest-growing tech talent hub, sourced by Recruitable.",
      "url": "https://recruitable.asia/jobs?region=KL",
      "numberOfItems": JOBS.filter(j => j.region === 'KL').length,
      "provider": { "@type": "EmploymentAgency", "name": "Recruitable", "url": "https://recruitable.asia" }
    }
  },
  London: {
    title: 'AI & Tech Jobs in London, UK | Recruitable',
    description: 'Browse exclusive AI Engineer, LLM Engineer, Data Scientist, and Software Engineering roles in London. Top 5% APAC talent placed into London\'s leading tech and fintech companies by Recruitable.',
    keywords: 'AI engineer jobs London, tech jobs London UK, data scientist jobs London, software engineer jobs London, LLM engineer London, AI recruitment London, APAC talent London, fintech recruitment London, AI jobs UK, software engineering recruitment London',
    canonical: 'https://recruitable.asia/jobs?region=London',
    ogTitle: 'AI & Tech Jobs in London, UK | Recruitable',
    ogDesc: 'Top 5% AI Engineers, LLM Engineers, Data Scientists, and Software Engineers placed into London tech and fintech companies. Sourced from APAC by Recruitable.',
    schema: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "AI & Tech Jobs in London, UK",
      "description": "Exclusive AI, ML, Data Science, and Software Engineering roles in London — connecting APAC's top 5% engineers with London's leading tech and fintech companies.",
      "url": "https://recruitable.asia/jobs?region=London",
      "numberOfItems": JOBS.filter(j => j.region === 'London').length,
      "provider": { "@type": "EmploymentAgency", "name": "Recruitable", "url": "https://recruitable.asia" }
    }
  }
}

const DEFAULT_SEO = {
  title: 'AI & Tech Jobs in APAC, US & London | Recruitable — Top 5% Roles Only',
  description: "Browse exclusive AI Engineer, LLM Engineer, Data Scientist, MLOps, and Software Engineering roles across Kuala Lumpur, US, and London. Top 5% vetted opportunities from Recruitable, APAC's specialist AI and tech recruiter.",
  keywords: 'AI engineer jobs APAC, LLM engineer jobs, data scientist jobs Malaysia, software engineer jobs Kuala Lumpur, AI jobs Southeast Asia, tech jobs Malaysia, forward deployment engineer jobs, MLOps jobs APAC, AI jobs US, software engineering jobs London',
  canonical: 'https://recruitable.asia/jobs',
  ogTitle: 'AI & Tech Jobs in APAC, US & London | Recruitable',
  ogDesc: 'Browse exclusive AI Engineer, LLM Engineer, Data Scientist, and Software Engineering roles across Kuala Lumpur, US, and London. Top 5% vetted only.',
  schema: null
}

export function getServerSideProps({ query }) {
  const region = query.region && REGION_SEO[query.region] ? query.region : null
  const seo = region ? REGION_SEO[region] : DEFAULT_SEO
  return { props: { seo } }
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Jobs({ seo }) {
  const router = useRouter()
  const [region, setRegion] = useState('All')
  const [type, setType] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [applyJob, setApplyJob] = useState(null)

  useEffect(() => {
    if (!router.isReady) return
    const { region: qRegion } = router.query
    if (qRegion && REGIONS.includes(qRegion)) {
      setRegion(qRegion)
    }
  }, [router.isReady, router.query])

  const filtered = JOBS.filter(j => {
    const matchRegion = region === 'All' || j.region === region
    const matchType = type === 'All' || j.type === type
    const q = search.toLowerCase()
    const matchSearch = search === '' ||
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.stack.some(s => s.toLowerCase().includes(q)) ||
      j.location.toLowerCase().includes(q) ||
      j.locationFull.toLowerCase().includes(q) ||
      j.type.toLowerCase().includes(q)
    return matchRegion && matchType && matchSearch
  })

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description}/>
        <meta name="keywords" content={seo.keywords}/>
        <meta name="robots" content="index, follow"/>
        <link rel="canonical" href={seo.canonical}/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content={seo.canonical}/>
        <meta property="og:site_name" content="Recruitable"/>
        <meta property="og:title" content={seo.ogTitle}/>
        <meta property="og:description" content={seo.ogDesc}/>
        <meta property="og:image" content="https://recruitable.asia/og-image.png"/>
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content={seo.ogTitle}/>
        <meta name="twitter:description" content={seo.ogDesc}/>
        <meta name="twitter:image" content="https://recruitable.asia/og-image.png"/>
        {seo.schema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(seo.schema)}}/>
        )}
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
            Every role on this board is a pre-qualified mandate from a vetted client. We only work top 5% talent across US · KL · London. If that&apos;s you — we want to hear from you.
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
                onClick={() => { setRegion(r); setType('All') }}>{r}</button>
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
