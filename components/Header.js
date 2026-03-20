import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Icons from './Icons';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setShowInstall(true); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setShowInstall(false));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setShowInstall(false); setDeferredPrompt(null);
  };

  const accent =
    router.pathname.startsWith('/ai')     ? 'var(--ai)'  :
    router.pathname.startsWith('/image')  ? 'var(--img)' :
    router.pathname.startsWith('/design') ? 'var(--clr)' : 'var(--text)';

  const nav = [
    { href: '/ai',     label: 'AI Writer',  icon: 'AI'      },
    { href: '/image',  label: 'Compressor', icon: 'Image'   },
    { href: '/design', label: 'Palette',    icon: 'Palette' },
    { href: '/',       label: 'Home',       icon: 'Home'    },
  ];

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: 'var(--bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.Logo size={30} color={accent} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.08em', color: 'var(--text)' }}>
            ALPHA-1<span style={{ color: accent }}>.</span>
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
          {nav.map(({ href, label, icon }) => {
            const Icon = Icons[icon];
            const active = router.pathname === href || (href !== '/' && router.pathname.startsWith(href));
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
                color: active ? accent : 'var(--muted)',
                background: active ? 'var(--surface2)' : 'transparent',
                border: `1px solid ${active ? 'var(--border2)' : 'transparent'}`,
                transition: 'all var(--transition)',
              }}>
                <Icon size={14} color={active ? accent : 'var(--muted)'} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeSwitcher />
          {showInstall && (
            <button onClick={handleInstall} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
              background: 'var(--surface2)', color: accent,
              border: '1px solid var(--border2)', cursor: 'pointer',
            }}>
              <Icons.Install size={13} color={accent} />Install
            </button>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{
            background: 'none', border: 'none', padding: '4px', color: 'var(--text)', cursor: 'pointer', display: 'none',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              {menuOpen
                ? <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                : <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>}
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 99,
          background: 'var(--bg)', borderBottom: '1px solid var(--border)',
          padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {nav.map(({ href, label, icon }) => {
            const Icon = Icons[icon];
            const active = router.pathname === href || (href !== '/' && router.pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', borderRadius: '8px', fontSize: '15px', fontWeight: '600',
                color: active ? accent : 'var(--text)',
                background: active ? 'var(--surface2)' : 'transparent',
              }}>
                <Icon size={18} color={active ? accent : 'var(--muted)'} />
                {label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
