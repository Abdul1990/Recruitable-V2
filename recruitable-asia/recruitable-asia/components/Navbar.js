import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Specialisation', href: '#specialisation' },
  { label: 'Malaysia Hub', href: '#malaysia' },
  { label: 'Market Insights', href: '#insights' },
  { label: 'Contact', href: '#contact' },
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
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoMark}>R</span>
          <span className={styles.logoText}>recruit<strong>ABLE</strong></span>
        </a>

        <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {links.map(l => (
            <li key={l.label}>
              <a href={l.href} onClick={() => setMenuOpen(false)} className={styles.link}>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#contact" className={styles.cta} onClick={() => setMenuOpen(false)}>
              Hire Talent
            </a>
          </li>
        </ul>

        <button
          className={styles.burger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={menuOpen ? styles.burgerLineActive1 : styles.burgerLine} />
          <span className={menuOpen ? styles.burgerLineActive2 : styles.burgerLine} />
          <span className={menuOpen ? styles.burgerLineActive3 : styles.burgerLine} />
        </button>
      </div>
    </nav>
  )
}
