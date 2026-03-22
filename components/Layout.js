import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  MapPin, X, Briefcase, Users, Brain, ChevronRight
} from 'lucide-react'

function PuzzleMark({ size = 42, color = 'var(--pink)' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path 
        d="M18.5 11C18.5 9.61929 19.6193 8.5 21 8.5C22.3807 8.5 23.5 9.61929 23.5 11C23.5 12.3807 22.3807 13.5 21 13.5C20.6725 13.5 20.3631 13.4371 20.0805 13.3229L19.5 13.0867V20.5C19.5 21.0523 19.0523 21.5 18.5 21.5H11.0867L11.3229 20.0805C11.4371 19.7979 11.5 19.4885 11.5 19.1611C11.5 17.7804 10.3807 16.6611 9 16.6611C7.61929 16.6611 6.5 17.7804 6.5 19.1611C6.5 19.4885 6.56291 19.7979 6.67711 20.0805L6.91334 20.6611H3.5C2.94772 20.6611 2.5 20.2134 2.5 19.6611V13.0867L3.13894 13.3229C3.42154 13.4371 3.73092 13.5 4.05833 13.5C5.43904 13.5 6.55833 12.3807 6.55833 11C6.55833 9.61929 5.43904 8.5 4.05833 8.5C3.73092 8.5 3.42154 8.56291 3.13894 8.67711L2.5 8.91334V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H13.0867L13.3229 3.13894C13.4371 3.42154 13.5 3.73092 13.5 4.05833C13.5 5.43904 12.3807 6.55833 11 6.55833C9.61929 6.55833 8.5 5.43904 8.5 4.05833C8.5 3.73092 8.56291 3.42154 8.67711 3.13894L8.91334 2.5H18.5C19.0523 2.5 19.5 2.94772 19.5 3.5V10.9133L18.9133 10.6771C18.3611 10.4571 18.5 11 18.5 11Z" 
        fill={color}
      />
      <circle cx="11" cy="11" r="2" fill="white" opacity="0.3" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Global Hubs', href: '/#hubs', icon: MapPin },
  { label: 'Elite Talent', href: '/#domains', icon: Users },
  { label: 'Neural Vetting', href: '/#insights', icon: Brain },
  { label: 'Jobs', href: '/jobs', icon: Briefcase, highlight: false },
  { label: 'Client Portal', href: '/portal', icon: ChevronRight, highlight: true },
]

export default function Layout({ children }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [router.pathname])

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --pink:    #E91E63;
          --orange:  #FF9400;
          --cyan:    #03A9F4;
          --purple:  #3F51B5;
          --teal:    #00BCD4;
          --charcoal:#212121;
          --charcoal-soft: #3D3D4E;
          --slate:   #F4F6FB;
          --slate-d: #E8ECF4;
          --muted:   #8A8A9E;
          --white:   #FFFFFF;
          --font-h:  'Nunito', system-ui, sans-serif;
          --font-b:  'Nunito Sans', system-ui, sans-serif;
          --ease:    cubic-bezier(0.4,0,0.2,1);
        }
        html { scroll-behavior: smooth; }
        body { font-family: var(--font-b); background: var(--white); color: var(--charcoal); line-height: 1.65; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        a { color: inherit; text-decoration: none; }
        button { cursor: pointer; border: none; background: none; font-family: inherit; }
        ::selection { background: var(--cyan); color: white; }

        .topbar {
          background: var(--charcoal); padding: 9px 0;
          font-size: 12px; color: rgba(255,255,255,0.5);
          font-family: var(--font-b);
        }
        .topbar-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
          display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        .topbar-hubs { display: flex; gap: 20px; align-items: center; }
        .topbar-hub { display: flex; align-items: center; gap: 7px; font-weight: 500; }
        .hub-pip { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .topbar-contact a { color: var(--teal); font-weight: 600; transition: color 0.2s; }
        .topbar-contact a:hover { color: white; }

        .nav {
          position: sticky; top: 0; left: 0; right: 0; z-index: 99;
          padding: 12px 0; background: rgba(255,255,255,0.97);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(45,45,58,0.08);
          transition: box-shadow 0.3s var(--ease);
        }
        .nav.scrolled { box-shadow: 0 4px 24px rgba(45,45,58,0.1); }
        .nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .logo { display: flex; align-items: center; gap: 11px; }
        .logo-wordmark { font-family: var(--font-h); font-size: 17px; font-weight: 900; letter-spacing: 0.16em; color: var(--charcoal); text-transform: uppercase; }
        .logo-tagline { font-size: 9px; font-weight: 600; color: var(--teal); letter-spacing: 0.06em; display: block; line-height: 1; margin-top: 2px; font-style: italic; }
        .nav-links { display: flex; align-items: center; gap: 2px; list-style: none; }
        .nav-link { font-size: 13px; font-weight: 700; color: rgba(45,45,58,0.6); padding: 7px 12px; border-radius: 6px; transition: all 0.18s; display: flex; align-items: center; gap: 5px; font-family: var(--font-h); }
        .nav-link:hover { color: var(--charcoal); background: rgba(45,45,58,0.05); }
        .nav-link.active { color: var(--cyan); }
        .nav-link-jobs { color: var(--charcoal); background: rgba(41,182,216,0.08); border: 1.5px solid rgba(41,182,216,0.2); }
        .nav-link-jobs:hover { background: rgba(41,182,216,0.15); color: var(--cyan); }
        .nav-cta { font-size: 13px; font-weight: 800; background: var(--pink); color: white; padding: 9px 18px; border-radius: 8px; transition: all 0.18s; white-space: nowrap; font-family: var(--font-h); display: flex; align-items: center; gap: 5px; }
        .nav-cta:hover { background: #d01e50; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,35,90,0.3); }
        .burger { display: none; flex-direction: column; gap: 5px; padding: 4px; }
        .burger-line { width: 22px; height: 2px; background: var(--charcoal); border-radius: 1px; display: block; transition: all 0.25s; }

        .page-content { min-height: calc(100vh - 200px); }

        .footer { background: var(--charcoal); padding: 36px 0; border-top: 1px solid rgba(255,255,255,0.05); }
        .footer-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .footer-brand { display: flex; align-items: center; gap: 12px; }
        .footer-wordmark { font-family: var(--font-h); font-size: 15px; font-weight: 900; letter-spacing: 0.16em; color: white; text-transform: uppercase; }
        .footer-tagline { font-size: 9px; font-style: italic; font-weight: 600; color: var(--teal); letter-spacing: 0.04em; display: block; margin-top: 2px; }
        .footer-right { font-size: 12.5px; color: rgba(255,255,255,0.3); font-weight: 500; }
        .footer-right a { color: var(--teal); transition: color 0.2s; }
        .footer-right a:hover { color: white; }

        @media (max-width: 900px) {
          .topbar-hubs { display: none; }
        }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .burger { display: flex; }
          .nav-links.open {
            display: flex; flex-direction: column; position: fixed;
            inset: 0; background: white; z-index: 98;
            justify-content: center; align-items: center; gap: 12px;
          }
          .nav-links.open .nav-link { font-size: 20px; padding: 12px 24px; }
          .nav-links.open .nav-cta { font-size: 18px; padding: 14px 36px; }
        }
      `}</style>

      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-hubs">
            <div className="topbar-hub"><span className="hub-pip" style={{ background: 'var(--cyan)' }} /><span>KL — Engine Room</span></div>
            <div className="topbar-hub"><span className="hub-pip" style={{ background: 'var(--pink)' }} /><span>US — Strategic Frontier</span></div>
            <div className="topbar-hub"><span className="hub-pip" style={{ background: 'var(--purple)' }} /><span>LON — Strategic Frontier</span></div>
          </div>
          <div className="topbar-contact">
            <a href="mailto:info@recruitable.asia">info@recruitable.asia</a>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <PuzzleMark size={42} />
            <div>
              <div className="logo-wordmark">Recruitable</div>
              <span className="logo-tagline">Explore, connect and get hired</span>
            </div>
          </Link>

          <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
            {NAV_LINKS.map(l => {
              const isActive = router.pathname === l.href || (l.href !== '/' && router.pathname.startsWith(l.href))
              if (l.highlight) {
                return (
                  <li key={l.label}>
                    <Link href={l.href} className="nav-cta" onClick={() => setMenuOpen(false)}>
                      <l.icon size={14} />
                      {l.label}
                    </Link>
                  </li>
                )
              }
              if (l.label === 'Jobs') {
                return (
                  <li key={l.label}>
                    <Link href={l.href} className={`nav-link nav-link-jobs${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
                      <l.icon size={13} />
                      {l.label}
                    </Link>
                  </li>
                )
              }
              return (
                <li key={l.label}>
                  <Link href={l.href} className={`nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
                    {l.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={22} color="var(--charcoal)" /> : (
              <>
                <span className="burger-line" />
                <span className="burger-line" />
                <span className="burger-line" />
              </>
            )}
          </button>
        </div>
      </nav>

      <div className="page-content">{children}</div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <PuzzleMark size={36} />
            <div>
              <div className="footer-wordmark">Recruitable</div>
              <span className="footer-tagline">Explore, connect and get hired</span>
            </div>
          </div>
          <div className="footer-right">
            KL · US · LON &nbsp;·&nbsp; © 2026 Recruitable Asia. All rights reserved. &nbsp;·&nbsp;{' '}
            <a href="mailto:info@recruitable.asia">info@recruitable.asia</a> &nbsp;·&nbsp;{' '}
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
