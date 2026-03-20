import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icons from '../components/Icons';

const tools = [
  {
    href: '/ai',
    label: 'AI Writer',
    number: '01',
    desc: 'Generate blog posts, emails, tweets, and code with Claude AI. Prompt templates, tone control, streaming output.',
    icon: 'AI',
    accent: 'var(--ai)',
    glow: 'var(--ai-glow)',
    tags: ['Claude API', 'Streaming', 'Templates'],
  },
  {
    href: '/image',
    label: 'Image Compressor',
    number: '02',
    desc: 'Client-side image compression with zero uploads. Quality slider, before/after preview, instant download.',
    icon: 'Image',
    accent: 'var(--img)',
    glow: 'var(--img-glow)',
    tags: ['Client-Side', 'Privacy First', 'WebAPI'],
  },
  {
    href: '/design',
    label: 'Color Palette',
    number: '03',
    desc: 'Generate harmonious palettes — analogous, triadic, split-complementary. Copy hex, export CSS variables.',
    icon: 'Palette',
    accent: 'var(--clr)',
    glow: 'var(--clr-glow)',
    tags: ['5 Harmony Modes', 'CSS Export', 'Lock Colors'],
  },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head><title>Alpha-1 Design — Creative Studio</title></Head>
      <Header />

      <main style={{ flex: 1, padding: '0 24px' }}>
        {/* Hero */}
        <section style={{
          maxWidth: '900px', margin: '0 auto',
          padding: '80px 0 60px',
          textAlign: 'center',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '100px',
            border: '1px solid var(--border2)',
            background: 'var(--surface)',
            marginBottom: '32px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ai)', display: 'inline-block', animation: 'pulse-ring 2s ease-in-out infinite' }} />
            <span className="label">PWA · Installable · Offline Ready</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 8vw, 96px)',
            letterSpacing: '0.04em',
            lineHeight: 1,
            marginBottom: '24px',
            background: 'linear-gradient(135deg, var(--text) 0%, #888 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            ALPHA-1<br/>DESIGN
          </h1>

          <p style={{
            fontSize: '16px',
            color: 'var(--muted)',
            maxWidth: '480px',
            margin: '0 auto 48px',
            lineHeight: 1.7,
            fontFamily: 'var(--font-mono)',
          }}>
            A premium studio of AI tools for creators, designers, and developers.
            Install as an app. Works offline.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/ai" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '8px',
              background: 'var(--ai)', color: '#fff',
              fontWeight: '700', fontSize: '14px',
              letterSpacing: '0.04em',
              transition: 'all var(--transition)',
            }}>
              <Icons.Sparkle size={16} color="#fff" />
              Start Creating
            </Link>
            <Link href="/design" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '8px',
              background: 'var(--surface)', color: 'var(--text)',
              border: '1px solid var(--border2)',
              fontWeight: '600', fontSize: '14px',
              transition: 'all var(--transition)',
            }}>
              Explore Tools
              <Icons.ChevronRight size={16} color="var(--muted)" />
            </Link>
          </div>
        </section>

        {/* Tool Cards */}
        <section style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '80px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}>
            {tools.map(({ href, label, number, desc, icon, accent, glow, tags }) => {
              const Icon = Icons[icon];
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '28px',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all var(--transition)',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = `${accent}50`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 8px 32px ${glow}`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Background number */}
                    <span style={{
                      position: 'absolute', top: '16px', right: '20px',
                      fontFamily: 'var(--font-display)',
                      fontSize: '72px', color: accent, opacity: 0.07,
                      lineHeight: 1, pointerEvents: 'none',
                      letterSpacing: '-0.02em',
                    }}>{number}</span>

                    {/* Icon */}
                    <div style={{
                      width: '44px', height: '44px',
                      borderRadius: '10px',
                      background: `${accent}15`,
                      border: `1px solid ${accent}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '20px',
                    }}>
                      <Icon size={20} color={accent} />
                    </div>

                    <span className="label" style={{ color: accent, marginBottom: '8px', display: 'block' }}>{number}</span>
                    <h2 style={{
                      fontSize: '20px', fontWeight: '800',
                      marginBottom: '12px', letterSpacing: '-0.01em',
                    }}>{label}</h2>
                    <p style={{
                      fontSize: '13px', color: 'var(--muted)',
                      lineHeight: 1.7, marginBottom: '20px',
                      fontFamily: 'var(--font-mono)',
                    }}>{desc}</p>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {tags.map(t => (
                        <span key={t} style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px', letterSpacing: '0.08em',
                          padding: '3px 8px', borderRadius: '4px',
                          background: `${accent}10`,
                          color: accent,
                          border: `1px solid ${accent}20`,
                        }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
