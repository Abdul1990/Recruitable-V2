import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '../../lib/auth/context'

function linkedInAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const redirectUri = encodeURIComponent(`${base}/api/auth/linkedin/callback`)
  const scope = encodeURIComponent('openid profile email')
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
}

export default function AppLanding() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { error } = router.query

  useEffect(() => {
    if (!loading && user) router.replace('/app/feed')
  }, [user, loading, router])

  if (loading) return <Spinner />

  return (
    <>
      <Head><title>recruitable app</title></Head>
      <div style={s.shell}>
        <div style={s.card}>
          <div style={s.logoRow}>
            <div style={s.logoBox}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4a2 2 0 0 0-2 2v3.8h1.5c1.5 0 2.7 1.2 2.7 2.7S5 16.2 3.5 16.2H2V20a2 2 0 0 0 2 2h3.8v-1.5c0-1.5 1.2-2.7 2.7-2.7s2.7 1.2 2.7 2.7V22H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z"/>
              </svg>
            </div>
            <span style={s.logoText}>recruitable</span>
          </div>

          <h1 style={s.h1}>AI finds you your<br />next tech role</h1>
          <p style={s.sub}>
            Swipe AI-matched jobs across Singapore, Malaysia, Australia, Vietnam, Indonesia &amp; Thailand.
          </p>

          <div style={s.flags}>
            {['🇸🇬','🇲🇾','🇦🇺','🇻🇳','🇮🇩','🇹🇭'].map(f => (
              <span key={f} style={s.flag}>{f}</span>
            ))}
          </div>

          {error && (
            <div style={s.errorBox}>
              {error === 'linkedin_cancelled' ? 'Sign-in was cancelled.' : 'Something went wrong — please try again.'}
            </div>
          )}

          <a href={linkedInAuthUrl()} style={s.linkedinBtn}>
            <LinkedInIcon />
            Continue with LinkedIn
          </a>
          <p style={s.hint}>Free for candidates · Takes 2 minutes</p>

          {process.env.NODE_ENV === 'development' && (
            // eslint-disable-next-line @next/next/no-html-link-for-pages
            <a href="/api/auth/dev-login" style={s.devBtn}>
              🛠 Dev login (bypass LinkedIn)
            </a>
          )}

          <div style={s.features}>
            {[
              ['🤖', 'AI match score on every job'],
              ['💬', 'Message clients on match'],
              ['📅', 'Book interviews in-app'],
            ].map(([icon, text]) => (
              <div key={text} style={s.featureRow}>
                <span style={s.featureIcon}>{icon}</span>
                <span style={s.featureText}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{marginRight: 10, flexShrink: 0}}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
  )
}

function Spinner() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>
      <div style={{width:32,height:32,border:'3px solid #E91E63',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const s = {
  shell: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg,#fce4ec 0%,#F4F6FB 60%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
  },
  card: {
    background: 'white',
    borderRadius: 24,
    padding: '40px 32px',
    maxWidth: 420,
    width: '100%',
    boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
  },
  logoRow: { display:'flex', alignItems:'center', gap:10, marginBottom:28 },
  logoBox: { width:36, height:36, background:'#E91E63', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' },
  logoText: { fontFamily:'Inter,sans-serif', fontWeight:800, fontSize:20, color:'#212121' },
  h1: { fontFamily:'Inter,sans-serif', fontWeight:800, fontSize:30, color:'#212121', margin:'0 0 12px', lineHeight:1.2 },
  sub: { fontFamily:'Inter,sans-serif', fontSize:15, color:'#666', lineHeight:1.6, margin:'0 0 20px' },
  flags: { display:'flex', gap:8, marginBottom:24 },
  flag: { fontSize:22 },
  errorBox: { background:'#fff3f3', border:'1px solid #ffcdd2', borderRadius:8, padding:'10px 14px', color:'#c62828', fontSize:13, fontFamily:'Inter,sans-serif', marginBottom:16 },
  linkedinBtn: { display:'flex', alignItems:'center', justifyContent:'center', background:'#0A66C2', color:'white', borderRadius:14, padding:'16px 24px', fontFamily:'Inter,sans-serif', fontWeight:800, fontSize:16, textDecoration:'none', width:'100%', cursor:'pointer' },
  hint: { textAlign:'center', fontSize:12, color:'#9e9e9e', fontFamily:'Inter,sans-serif', margin:'10px 0 12px' },
  devBtn: { display:'block', textAlign:'center', margin:'8px 0 16px', padding:'12px', background:'#f5f5f5', border:'1px dashed #ccc', borderRadius:10, fontFamily:'Inter,sans-serif', fontSize:13, color:'#666', textDecoration:'none', cursor:'pointer' },
  features: { display:'flex', flexDirection:'column', gap:10, borderTop:'1px solid #f0f0f0', paddingTop:20 },
  featureRow: { display:'flex', alignItems:'center', gap:10 },
  featureIcon: { fontSize:18 },
  featureText: { fontFamily:'Inter,sans-serif', fontSize:14, color:'#424242', fontWeight:600 },
}

export const dynamic = 'force-dynamic'
