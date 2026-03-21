/**
 * Navbar.js — Legacy component, kept for reference only.
 * The active navbar is in components/Layout.js
 * This file exists to prevent ESLint errors if it appears in the repo.
 */
import Link from 'next/link'
import { useState, useEffect } from 'react'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Domains', href: '/#domains' },
  { label: 'Hubs', href: '/#hubs' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Contact', href: '/#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 99,
      background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
      borderBottom: scrolled ? '1px solid rgba(45,45,58,0.08)' : 'none',
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: 'Nunito, sans-serif',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: '0.16em', color: '#2D2D3A', textTransform: 'uppercase' }}>
          Recruitable
        </span>
      </Link>
      <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0 }}>
        {links.map(l => (
          <li key={l.label}>
            <Link href={l.href} style={{ fontSize: 13, fontWeight: 700, color: 'rgba(45,45,58,0.6)', padding: '7px 12px', borderRadius: 6, textDecoration: 'none' }}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
