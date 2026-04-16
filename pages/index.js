import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icons from '../components/Icons';

const tools = [
  { href: '/ai',         label: 'AI Writer',       number: '01',  desc: 'Generate content with Claude, Gemini, Groq or Mistral. Templates, tone control, history.',          icon: 'AI',      accent: 'var(--ai)',  glow: 'var(--ai-glow)',        tags: ['4 AI Models', 'Templates', 'History']     },
  { href: '/image',      label: 'Image Compressor', number: '02',  desc: 'Client-side compression. Quality slider, format conversion, before/after preview.',                icon: 'Image',   accent: 'var(--img)', glow: 'var(--img-glow)',       tags: ['JPG PNG WebP', 'Privacy First', 'Instant'] },
  { href: '/image/bulk', label: 'Bulk Compressor',  number: '02B', desc: 'Compress dozens of images at once. Per-file progress, individual saves or ZIP download.',          icon: 'Compress',accent: 'var(--img)', glow: 'var(--img-glow)',       tags: ['Multi-File', 'ZIP Download', 'Fast']       },
  { href: '/design',     label: 'Color Palette',    number: '03',  desc: 'Generate harmonious palettes. 5 harmony modes, copy hex, export CSS, save collections.',           icon: 'Palette', accent: 'var(--clr)', glow: 'var(--clr-glow)',       tags: ['5 Modes', 'CSS Export', 'Collections']    },
  { href: '/fonts',      label: 'Font Pairing',     number: '04',  desc: '20 curated Google Font pairings. Side-by-side A/B preview, save favourites, copy CSS.',            icon: 'AI',      accent: '#8b5cf6',    glow: 'rgba(139,92,246,0.2)',  tags: ['20 Pairings', 'A/B Preview', 'Copy CSS']  },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Alpha-1 Design — Creative Studio</title>
        <meta name="description" content="A premium studio of AI and design tools for creators, designers, and developers. Generate content with AI, compress images, create color palettes, and pair fonts. Install as an app. Works offline." />
        <meta property="og:title" content="Alpha-1 Design — Creative Studio" />
        <meta property="og:description" content="A premium studio of AI and design tools for creators, designers, and developers. Generate content with AI, compress images, create color palettes, and pair fonts. Works offline." />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Header />
      <main style={{ flex: 1, padding: '0 24px' }}>
        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 0 60px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', border: '1px solid var(--border2)', background: 'var(--surface)', marginBottom: '32px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ai)', display: 'inline-block', animation: 'pulse-ring 2s ease-in-out infinite' }} />
            <span className="label">5 Tools · 4 AI Models · PWA · Offline Ready</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 96px)', letterSpacing: '0.04em', lineHeight: 1, marginBottom: '24px', background: 'linear-gradient(135deg, var(--text) 0%, #888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ALPHA-1<br/>DESIGN
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--muted)', maxWidth: '480px', margin: '0 auto 48px', lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>
            A premium studio of AI and design tools for creators, designers, and developers. Install as an app. Works offline.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/ai" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', background: 'var(--ai)', color: '#fff', fontWeight: '700', fontSize: '14px' }}>
              <Icons.Sparkle size={16} color="#fff" />Start Creating
            </Link>
            <Link href="/fonts" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border2)', fontWeight: '600', fontSize: '14px' }}>
              Explore Tools <Icons.ChevronRight size={16} color="var(--muted)" />
            </Link>
          </div>
        </section>

        <section style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {tools.map(({ href, label, number, desc, icon, accent, glow, tags }) => {
              const Icon = Icons[icon];
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', height: '100%', position: 'relative', overflow: 'hidden', transition: 'all var(--transition)', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=`${accent}50`; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 32px ${glow}`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
                  >
                    <span style={{ position: 'absolute', top: '16px', right: '20px', fontFamily: 'var(--font-display)', fontSize: '72px', color: accent, opacity: 0.07, lineHeight: 1, pointerEvents: 'none' }}>{number}</span>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${accent}15`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                      <Icon size={20} color={accent} />
                    </div>
                    <span className="label" style={{ color: accent, marginBottom: '8px', display: 'block' }}>{number}</span>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>{label}</h2>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '20px', fontFamily: 'var(--font-mono)' }}>{desc}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {tags.map(t => <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', background: `${accent}10`, color: accent, border: `1px solid ${accent}20` }}>{t}</span>)}
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
