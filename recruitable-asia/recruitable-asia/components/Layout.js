import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  MapPin, X, Briefcase, Users, Brain, ChevronRight
} from 'lucide-react'

function PuzzleMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <path d="M13 8 Q13 5 18 5 Q23 5 23 8" stroke="#2D2D3A" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M8 12 L16 12 L16 14.5 Q18 14.5 18 16.5 Q18 18.5 16 18.5 L16 20 L8 20 L8 17.5 Q6 17.5 6 15.5 Q6 13.5 8 13.5 Z" fill="#E8235A"/>
      <path d="M17 12 L26 12 L26 20 L24 20 Q24 22 22 22 Q20 22 20 20 L17 20 L17 18 Q15 18 15 16 Q15 14 17 14 Z" fill="#F5A623"/>
      <path d="M8 21 L16 21 L16 28 L13 28 Q13 30 11 30 Q9 30 9 28 L8 28 L8 24 Q6 24 6 22 Q6 20 8 20 Z" fill="#29B6D8"/>
      <path d="M17 21 L26 21 L26 28 L24 28 Q24 30 22 30 Q20 30 20 28 L17 28 L17 25 Q15 25 15 23 Q15 21 17 21 Z" fill="#5B4B8A"/>
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
          --pink:    #E8235A;
          --orange:  #F5A623;
          --cyan:    #29B6D8;
          --purple:  #5B4B8A;
          --teal:    #5BB8D4;
          --charcoal:#2D2D3A;
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
            <div className="topbar-hub"><span className="hub-pip" style={{ background: '#29B6D8' }} /><span>KL — Engine Room</span></div>
            <div className="topbar-hub"><span className="hub-pip" style={{ background: '#E8235A' }} /><span>NYC — Strategic Frontier</span></div>
            <div className="topbar-hub"><span className="hub-pip" style={{ background: '#5B4B8A' }} /><span>LON — Strategic Frontier</span></div>
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
            <PuzzleMark size={36} />
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
            <PuzzleMark size={30} />
            <div>
              <div className="footer-wordmark">Recruitable</div>
              <span className="footer-tagline">Explore, connect and get hired</span>
            </div>
          </div>
          <div className="footer-right">
            KL · NYC · LON &nbsp;·&nbsp; © 2026 Recruitable Asia. All rights reserved. &nbsp;·&nbsp;{' '}
            <a href="mailto:info@recruitable.asia">info@recruitable.asia</a> &nbsp;·&nbsp;{' '}
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
