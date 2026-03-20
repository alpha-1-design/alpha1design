import Link from 'next/link';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icons from '../components/Icons';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head><title>404 — Alpha-1 Design</title></Head>
      <Header />

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', textAlign: 'center',
      }}>
        {/* Giant 404 */}
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(100px, 20vw, 200px)',
            letterSpacing: '-0.04em', lineHeight: 1,
            background: 'linear-gradient(135deg, var(--border2) 0%, var(--surface2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'block',
            userSelect: 'none',
          }}>404</span>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'var(--surface)',
              border: '1px solid var(--border2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icons.Logo size={32} color="var(--ai)" />
            </div>
          </div>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '28px',
          letterSpacing: '0.06em', marginBottom: '12px',
        }}>PAGE NOT FOUND</h1>

        <p style={{
          color: 'var(--muted)', fontFamily: 'var(--font-mono)',
          fontSize: '13px', marginBottom: '40px', maxWidth: '360px', lineHeight: 1.7,
        }}>
          This page doesn't exist or was moved. Head back to the studio.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { href: '/',       label: 'Home',          icon: 'Home'    },
            { href: '/ai',     label: 'AI Writer',     icon: 'AI'      },
            { href: '/image',  label: 'Compressor',    icon: 'Image'   },
            { href: '/design', label: 'Color Palette', icon: 'Palette' },
          ].map(({ href, label, icon }) => {
            const Icon = Icons[icon];
            return (
              <Link key={href} href={href} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '8px',
                background: 'var(--surface)', color: 'var(--text)',
                border: '1px solid var(--border2)',
                fontSize: '13px', fontWeight: '600',
                transition: 'all var(--transition)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ai)'; e.currentTarget.style.color = 'var(--ai)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)'; }}
              >
                <Icon size={15} color="currentColor" />
                {label}
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
