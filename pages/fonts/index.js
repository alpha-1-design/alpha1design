import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Icons from '../../components/Icons';

const PAIRINGS = [
  { id: 1,  heading: 'Playfair Display',      body: 'Source Sans 3',    vibe: 'Editorial'    },
  { id: 2,  heading: 'Bebas Neue',             body: 'DM Sans',          vibe: 'Bold & Clean' },
  { id: 3,  heading: 'Syne',                   body: 'DM Mono',          vibe: 'Technical'    },
  { id: 4,  heading: 'Fraunces',               body: 'Epilogue',         vibe: 'Literary'     },
  { id: 5,  heading: 'Space Grotesk',          body: 'Space Mono',       vibe: 'Developer'    },
  { id: 6,  heading: 'Cormorant Garamond',     body: 'Proza Libre',      vibe: 'Luxury'       },
  { id: 7,  heading: 'Unbounded',              body: 'Mulish',           vibe: 'Futuristic'   },
  { id: 8,  heading: 'Abril Fatface',          body: 'Lora',             vibe: 'Magazine'     },
  { id: 9,  heading: 'Josefin Sans',           body: 'Josefin Slab',     vibe: 'Geometric'    },
  { id: 10, heading: 'Raleway',                body: 'Merriweather',     vibe: 'Corporate'    },
  { id: 11, heading: 'Oswald',                 body: 'Quattrocento',     vibe: 'Classic'      },
  { id: 12, heading: 'Montserrat',             body: 'Crimson Text',     vibe: 'Modern Serif' },
  { id: 13, heading: 'DM Serif Display',       body: 'DM Sans',          vibe: 'Refined'      },
  { id: 14, heading: 'Archivo Black',          body: 'Archivo',          vibe: 'Systematic'   },
  { id: 15, heading: 'Gloock',                 body: 'Hanken Grotesk',   vibe: 'Contemporary' },
  { id: 16, heading: 'Big Shoulders Display',  body: 'Big Shoulders Text', vibe: 'Industrial' },
  { id: 17, heading: 'Yeseva One',             body: 'Josefin Sans',     vibe: 'Dramatic'     },
  { id: 18, heading: 'Teko',                   body: 'Barlow',           vibe: 'Condensed'    },
  { id: 19, heading: 'Tenor Sans',             body: 'EB Garamond',      vibe: 'Timeless'     },
  { id: 20, heading: 'Righteous',              body: 'Oxygen',           vibe: 'Playful'      },
];

const SAMPLE_TEXTS = [
  { label: 'Brand',   heading: 'Build Something Beautiful',  body: 'We craft digital experiences that inspire, engage, and convert. Every pixel is intentional, every interaction meaningful.' },
  { label: 'Article', heading: 'The Future of Design',       body: 'Design is not just what it looks like. Design is how it works. The best products balance form and function seamlessly.' },
  { label: 'Product', heading: 'Premium Tools for Creators', body: 'Everything you need to design, build, and ship faster. Trusted by designers and developers worldwide.' },
  { label: 'Blog',    heading: 'Why Typography Matters',     body: 'Good typography is invisible. Bad typography is everywhere. The right font pairing can make or break a design.' },
];

const SAVED_KEY = 'a1d-font-pairings';

function googleFontUrl(fonts) {
  const families = [...new Set(fonts)].map(f => f.replace(/ /g, '+') + ':wght@400;700').join('&family=');
  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
}

export default function FontPairer() {
  const [selected, setSelected] = useState(PAIRINGS[0]);
  const [compare,  setCompare]  = useState(PAIRINGS[1]);
  const [sampleIdx, setSampleIdx] = useState(0);
  const [customText, setCustomText] = useState('');
  const [saved, setSaved]       = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [fontSize, setFontSize] = useState(40);
  const [bgDark, setBgDark]     = useState(true);
  const [vibeFilter, setVibeFilter] = useState('All');

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')); } catch {}
  }, []);

  useEffect(() => {
    const fonts = [selected.heading, selected.body, compare.heading, compare.body];
    const url = googleFontUrl(fonts);
    const id = 'a1d-font-link';
    let link = document.getElementById(id);
    if (!link) { link = document.createElement('link'); link.id = id; link.rel = 'stylesheet'; document.head.appendChild(link); }
    link.href = url;
  }, [selected, compare]);

  const sample = SAMPLE_TEXTS[sampleIdx];
  const headingText = customText || sample.heading;
  const panelBg   = bgDark ? '#0a0a0a' : '#ffffff';
  const panelText = bgDark ? '#f0ede8' : '#1c1917';
  const panelMuted = bgDark ? '#666' : '#888';

  const vibes = ['All', ...new Set(PAIRINGS.map(p => p.vibe))];
  const filtered = vibeFilter === 'All' ? PAIRINGS : PAIRINGS.filter(p => p.vibe === vibeFilter);

  const savePairing = (p) => {
    if (saved.find(s => s.id === p.id)) return;
    const updated = [p, ...saved].slice(0, 20);
    setSaved(updated);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(updated)); } catch {}
  };

  const removeSaved = (id) => {
    const updated = saved.filter(s => s.id !== id);
    setSaved(updated);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(updated)); } catch {}
  };

  const copyCSS = (p) => {
    const css = `@import url('https://fonts.googleapis.com/css2?family=${p.heading.replace(/ /g,'+')}:wght@400;700&family=${p.body.replace(/ /g,'+')}:wght@400;600&display=swap');\n\n/* Heading */\nfont-family: '${p.heading}', serif;\n\n/* Body */\nfont-family: '${p.body}', sans-serif;`;
    navigator.clipboard.writeText(css);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const PanelCard = ({ pairing, label, setter }) => (
    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div style={{ padding: '12px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#8b5cf620', border: '1px solid #8b5cf630', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '13px', color: '#8b5cf6' }}>{label}</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)' }}>{pairing.heading}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>{pairing.body} · {pairing.vibe}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => savePairing(pairing)} style={{ width: '28px', height: '28px', borderRadius: '6px', background: saved.find(s=>s.id===pairing.id) ? '#8b5cf620' : 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: saved.find(s=>s.id===pairing.id) ? '#8b5cf6' : 'var(--muted)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={saved.find(s=>s.id===pairing.id)?'currentColor':'none'} stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
          <button onClick={() => copyCSS(pairing)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', background: copiedId===pairing.id ? '#8b5cf620' : 'var(--surface2)', color: copiedId===pairing.id ? '#8b5cf6' : 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            {copiedId===pairing.id ? <Icons.Check size={11} color="currentColor"/> : <Icons.Copy size={11} color="currentColor"/>}
            {copiedId===pairing.id ? 'Copied!' : 'CSS'}
          </button>
        </div>
      </div>
      <div style={{ padding: '32px 28px', background: panelBg, minHeight: '200px' }}>
        <div style={{ fontFamily: `'${pairing.heading}', serif`, fontSize: `${fontSize}px`, fontWeight: 700, lineHeight: 1.1, color: panelText, marginBottom: '16px', wordBreak: 'break-word' }}>{headingText}</div>
        <div style={{ fontFamily: `'${pairing.body}', sans-serif`, fontSize: '15px', lineHeight: 1.7, color: panelMuted }}>{sample.body}</div>
      </div>
      <div style={{ padding: '12px 16px', background: 'var(--surface2)', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <span className="label" style={{ display: 'block', marginBottom: '3px' }}>Heading</span>
          <span style={{ fontFamily: `'${pairing.heading}', serif`, fontSize: '14px', color: 'var(--text)' }}>{pairing.heading}</span>
        </div>
        <div style={{ flex: 1 }}>
          <span className="label" style={{ display: 'block', marginBottom: '3px' }}>Body</span>
          <span style={{ fontFamily: `'${pairing.body}', sans-serif`, fontSize: '14px', color: 'var(--text)' }}>{pairing.body}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Font Pairing — Alpha-1 Design</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <Header />
      <div style={{ height: '2px', background: 'linear-gradient(90deg, #8b5cf6, transparent)' }} />

      <main style={{ flex: 1, maxWidth: '1100px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#8b5cf615', border: '1px solid #8b5cf630', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h10M4 17h13" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <span className="label" style={{ color: '#8b5cf6' }}>04 / FONT PAIRING</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 52px)', letterSpacing: '0.04em', lineHeight: 1 }}>FONT PAIRING TOOL</h1>
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '6px' }}>20 curated pairings · side-by-side A/B preview · copy CSS instantly</p>
        </div>

        {/* Top controls */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          {SAMPLE_TEXTS.map((s, i) => (
            <button key={i} onClick={() => setSampleIdx(i)} style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: sampleIdx===i ? '#8b5cf6' : 'var(--surface)', color: sampleIdx===i ? '#fff' : 'var(--muted)', border: `1px solid ${sampleIdx===i ? '#8b5cf6' : 'var(--border)'}`, transition: 'all var(--transition)' }}>{s.label}</button>
          ))}
          <input value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Custom heading text..." style={{ flex: 1, minWidth: '160px', padding: '6px 12px', borderRadius: '6px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border2)', fontSize: '12px', outline: 'none', fontFamily: 'var(--font-mono)' }} onFocus={e => e.target.style.borderColor='#8b5cf6'} onBlur={e => e.target.style.borderColor='var(--border2)'} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '6px 12px' }}>
            <span className="label">Size</span>
            <input type="range" min="20" max="72" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} style={{ width: '70px', accentColor: '#8b5cf6' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', minWidth: '26px' }}>{fontSize}</span>
          </div>
          <button onClick={() => setBgDark(!bgDark)} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border2)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            {bgDark ? '○ Light' : '◑ Dark'}
          </button>
        </div>

        {/* Side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <PanelCard pairing={selected} label="A" setter={setSelected} />
          <PanelCard pairing={compare}  label="B" setter={setCompare}  />
        </div>

        {/* Pairing browser */}
        <div style={{ marginBottom: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="label" style={{ color: '#8b5cf6', marginRight: '4px' }}>Browse</span>
          {vibes.map(v => (
            <button key={v} onClick={() => setVibeFilter(v)} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-mono)', background: vibeFilter===v ? '#8b5cf6' : 'var(--surface)', color: vibeFilter===v ? '#fff' : 'var(--muted)', border: `1px solid ${vibeFilter===v ? '#8b5cf6' : 'var(--border)'}`, transition: 'all var(--transition)' }}>{v}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          {filtered.map((pairing) => {
            const isA = selected.id === pairing.id;
            const isB = compare.id  === pairing.id;
            return (
              <div key={pairing.id} style={{ background: 'var(--surface)', border: `1px solid ${isA ? '#8b5cf6' : isB ? '#6366f1' : 'var(--border)'}`, borderRadius: '12px', overflow: 'hidden', transition: 'all var(--transition)' }}>
                <div onClick={() => setSelected(pairing)} style={{ padding: '20px 20px 14px', background: panelBg, minHeight: '80px', cursor: 'pointer' }}>
                  <div style={{ fontFamily: `'${pairing.heading}', serif`, fontSize: '20px', fontWeight: 700, color: panelText, lineHeight: 1.2, marginBottom: '6px' }}>{headingText.slice(0,22)}{headingText.length>22?'…':''}</div>
                  <div style={{ fontFamily: `'${pairing.body}', sans-serif`, fontSize: '12px', color: panelMuted, lineHeight: 1.5 }}>{sample.body.slice(0,55)}…</div>
                </div>
                <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)' }}>{pairing.heading} / {pairing.body}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>{pairing.vibe}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => setSelected(pairing)} style={{ padding: '4px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: '700', background: isA ? '#8b5cf6' : 'var(--surface2)', color: isA ? '#fff' : 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>A</button>
                    <button onClick={() => setCompare(pairing)}  style={{ padding: '4px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: '700', background: isB ? '#6366f1' : 'var(--surface2)', color: isB ? '#fff' : 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>B</button>
                    <button onClick={() => copyCSS(pairing)} style={{ padding: '4px 8px', borderRadius: '5px', fontSize: '10px', background: 'var(--surface2)', color: copiedId===pairing.id ? '#8b5cf6' : 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                      {copiedId===pairing.id ? <Icons.Check size={10} color="currentColor"/> : <Icons.Copy size={10} color="currentColor"/>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Saved */}
        {saved.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <span className="label" style={{ color: '#8b5cf6' }}>Saved ({saved.length})</span>
            </div>
            {saved.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: i < saved.length-1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: `'${p.heading}', serif`, fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginRight: '8px' }}>{p.heading}</span>
                  <span style={{ fontFamily: `'${p.body}', sans-serif`, fontSize: '13px', color: 'var(--muted)' }}>{p.body}</span>
                </div>
                <button onClick={() => setSelected(p)} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>A</button>
                <button onClick={() => setCompare(p)}  style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>B</button>
                <button onClick={() => copyCSS(p)} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', background: copiedId===p.id ? '#8b5cf615' : 'var(--surface2)', color: copiedId===p.id ? '#8b5cf6' : 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>{copiedId===p.id ? 'Copied!' : 'CSS'}</button>
                <button onClick={() => removeSaved(p.id)} style={{ background: 'none', border: 'none', color: 'var(--muted2)', cursor: 'pointer', padding: '4px' }}><Icons.X size={13} color="currentColor"/></button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
