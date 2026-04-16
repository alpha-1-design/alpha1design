import { useState, useCallback, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Icons from '../../components/Icons';
import useShortcut from '../../lib/useShortcut';

// ── Color math ───────────────────────────────────────────────────────────────
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => { const k = (n + h / 30) % 12; const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); return Math.round(255 * c).toString(16).padStart(2, '0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b); let h, s, l = (max+min)/2;
  if (max === min) { h = s = 0; } else {
    const d = max - min; s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch(max) { case r: h=((g-b)/d+(g<b?6:0))/6; break; case g: h=((b-r)/d+2)/6; break; case b: h=((r-g)/d+4)/6; break; }
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}
function randomHex() { return hslToHex(Math.floor(Math.random()*360), 55+Math.floor(Math.random()*30), 35+Math.floor(Math.random()*30)); }
function luminance(hex) { const r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255; return 0.299*r+0.587*g+0.114*b; }
function getContrastRatio(hex1, hex2) { const l1 = luminance(hex1), l2 = luminance(hex2); const lighter = Math.max(l1, l2), darker = Math.min(l1, l2); return (lighter + 0.05) / (darker + 0.05); }

function extractColorsFromImage(imageSrc, numColors = 5) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxDim = 150;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const colorMap = {};
      for (let i = 0; i < pixels.length; i += 4) {
        const r = Math.round(pixels[i] / 16) * 16;
        const g = Math.round(pixels[i + 1] / 16) * 16;
        const b = Math.round(pixels[i + 2] / 16) * 16;
        const key = `${r},${g},${b}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }
      const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
      const topColors = sorted.slice(0, numColors).map(([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      });
      while (topColors.length < numColors) {
        topColors.push('#888888');
      }
      resolve(topColors);
    };
    img.onerror = () => resolve(['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']);
    img.src = imageSrc;
  });
}

const MODES = [
  { id: 'analogous',            label: 'Analogous'       },
  { id: 'complementary',        label: 'Complementary'   },
  { id: 'triadic',              label: 'Triadic'         },
  { id: 'split-complementary',  label: 'Split Comp.'     },
  { id: 'tetradic',             label: 'Tetradic'        },
  { id: 'monochromatic',        label: 'Grayscale'      },
  { id: 'gradient',             label: 'Gradient'       },
];

function generatePalette(baseHex, mode) {
  const [h, s, l] = hexToHsl(baseHex);
  const offsets = { analogous:[0,30,-30,60,-60], complementary:[0,180,30,210,-30], triadic:[0,120,240,60,300], 'split-complementary':[0,150,210,75,285], tetradic:[0,90,180,270,45] };
  if (mode === 'monochromatic') {
    const steps = [-40, -20, 0, 20, 40];
    return steps.map(step => {
      const newLum = Math.min(230, Math.max(25, luminance(baseHex) * 255 + step * 2.55));
      const gray = Math.round(newLum);
      const hex = gray.toString(16).padStart(2, '0');
      return `#${hex}${hex}${hex}`;
    });
  }
  return (offsets[mode] || offsets.analogous).map((offset, i) => {
    const newH = ((h + offset) % 360 + 360) % 360;
    const newS = Math.min(100, Math.max(20, s + (i%2===0?0:5)));
    const newL = Math.min(85, Math.max(20, l + (i-2)*8));
    return hslToHex(newH, newS, newL);
  });
}

const SAVED_KEY = 'a1d-palettes';

export default function ColorPalette() {
const [base, setBase]     = useState('#6366f1');
  const [mode, setMode]     = useState('analogous');
  const [palette, setPalette] = useState([]);
  const [locked, setLocked] = useState([false, false, false, false, false]);
  const [copied, setCopied]   = useState(null);
  const [saved, setSaved]   = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [saveName, setSaveName]   = useState('');
  const [exportFormat, setExportFormat] = useState('css');
  const [namingMode, setNamingMode] = useState(false);
  const [showContrast, setShowContrast] = useState(false);
  const [showImageImport, setShowImageImport] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [gradientStart, setGradientStart] = useState('#6366f1');
  const [gradientEnd, setGradientEnd] = useState('#ec4899');
  const [linkCopied, setLinkCopied] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const { base: urlBase, mode: urlMode, colors: urlColors } = router.query;
    if (urlBase && urlColors) {
      const colors = urlColors.split(',');
      setBase(decodeURIComponent(urlBase));
      if (urlMode) setMode(urlMode);
      setPalette(colors.map(c => decodeURIComponent(c)));
      setLocked([false, false, false, false, false]);
    }
  }, [router.query]);

  const gradientCss = `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtracting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const colors = await extractColorsFromImage(evt.target.result, 5);
      setBase(colors[0]);
      setPalette(colors);
      setLocked([false, false, false, false, false]);
      setIsExtracting(false);
      setShowImageImport(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); setSaved(s); } catch {}
  }, []);

  useEffect(() => {
    if (mode === 'gradient') {
      setPalette([gradientStart, gradientEnd]);
    } else if (palette.length === 0) {
      const fresh = generatePalette(base, mode);
      setPalette(fresh);
    }
  }, [mode, gradientStart, gradientEnd]);

  const persistSaved = (arr) => { setSaved(arr); try { localStorage.setItem(SAVED_KEY, JSON.stringify(arr)); } catch {} };

  const regenerate = useCallback((newBase, newMode, currentLocked = locked, currentPalette = palette) => {
    if (newMode === 'gradient') {
      setPalette([gradientStart, gradientEnd]);
      return;
    }
    const fresh = generatePalette(newBase || base, newMode || mode);
    setPalette(fresh.map((c, i) => currentLocked[i] ? currentPalette[i] : c));
  }, [base, mode, locked, palette, gradientStart, gradientEnd]);

  const handleBaseChange = (e) => { setBase(e.target.value); regenerate(e.target.value, mode); };
  const handleMode = (m) => { setMode(m); regenerate(base, m); };
  const handleRandomize = () => { const nb = randomHex(); setBase(nb); regenerate(nb, mode); };
  const toggleLock = (i) => setLocked(prev => { const n=[...prev]; n[i]=!n[i]; return n; });
  const copyHex = (hex, id) => { navigator.clipboard.writeText(hex); setCopied(id); setTimeout(()=>setCopied(null),1500); };

  const exportFormats = {
    css: () => mode === 'gradient' ? `background: ${gradientCss};` : `:root {\n${palette.map((c,i)=>`  --color-${i+1}: ${c};`).join('\n')}\n}`,
    scss: () => mode === 'gradient' ? `$gradient: ${gradientCss};` : palette.map((c,i)=>`$color-${i+1}: ${c};`).join('\n'),
    json: () => mode === 'gradient' ? JSON.stringify({ gradient: gradientCss }, null, 2) : JSON.stringify(palette, null, 2),
    tailwind: () => mode === 'gradient' ? `backgroundImage: {\n  'gradient': '${gradientCss}',\n}` : `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${palette.map((c,i)=>`        'brand-${i+1}': '${c}',`).join('\n')}\n      }\n    }\n  }\n}`,
    tailwind3: () => mode === 'gradient' ? `backgroundImage: {\n  'gradient': '${gradientCss}',\n}` : `colors: {\n${palette.map((c,i)=>`  'brand-${i+1}': '${c}',`).join('\n')}\n}`,
  };

  const handleExport = () => {
    const content = exportFormats[exportFormat]?.() || exportFormats.css();
    navigator.clipboard.writeText(content);
    setCopied(exportFormat); setTimeout(()=>setCopied(null),2000);
  };

  const exportCSS = () => {
    const css = mode === 'gradient' ? `background: ${gradientCss};` : `:root {\n${palette.map((c,i)=>`  --color-${i+1}: ${c};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css);
    setCopied('css'); setTimeout(()=>setCopied(null),2000);
  };

  const savePalette = () => {
    if (!saveName.trim()) return;
    const entry = { name: saveName.trim(), colors: [...palette], base, mode, ts: Date.now() };
    persistSaved([entry, ...saved].slice(0, 20));
    setSaveName(''); setNamingMode(false);
  };

  const loadPalette = (entry) => {
    setBase(entry.base); setMode(entry.mode);
    setPalette(entry.colors); setLocked([false,false,false,false,false]);
    setShowSaved(false);
  };

  const deleteSaved = (i) => persistSaved(saved.filter((_, idx) => idx !== i));

  const generateShareUrl = () => {
    const params = new URLSearchParams({
      base: base.replace('#', ''),
      mode,
      colors: palette.map(c => c.replace('#', '')).join(','),
    });
    return `${window.location.origin}/design?${params.toString()}`;
  };

  const copyShareLink = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Shortcuts
  useShortcut([
    { key: 'r', meta: true, action: handleRandomize },
    { key: 's', meta: true, action: () => setNamingMode(true) },
  ]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Color Palette — Alpha-1 Design</title>
        <meta name="description" content="Generate beautiful, harmonious color palettes with 6 harmony modes. Lock colors, export CSS variables, save collections, and extract colors from images." />
        <meta property="og:title" content="Color Palette Generator — Alpha-1 Design" />
        <meta property="og:description" content="Generate beautiful, harmonious color palettes with 6 harmony modes. Lock colors, export CSS variables, save collections, and extract colors from images." />
        <meta property="og:image" content="/og-design.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Header />
      <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--clr), transparent)' }} />

      <main style={{ flex: 1, maxWidth: '860px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        {/* Title */}
        <div style={{ marginBottom: '36px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--surface2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Palette size={17} color="var(--clr)" />
              </div>
              <span className="label" style={{ color: 'var(--clr)' }}>03 / COLOR PALETTE</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 52px)', letterSpacing: '0.04em', lineHeight: 1 }}>PALETTE GENERATOR</h1>
            <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '6px' }}>
              6 harmony modes · lock colors · export CSS ·&nbsp;
              <kbd style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '4px', padding: '1px 5px', fontSize: '11px' }}>⌘R</kbd> randomize ·&nbsp;
              <kbd style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '4px', padding: '1px 5px', fontSize: '11px' }}>⌘S</kbd> save
            </p>
          </div>

          {/* Saved collections button */}
          <button onClick={() => setShowSaved(!showSaved)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '8px',
            background: showSaved ? 'var(--surface2)' : 'var(--surface)',
            color: 'var(--muted)', border: '1px solid var(--border2)',
            fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16L21 8V19C21 20.1 20.1 21 19 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M17 21V13H7V21M7 3V8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Saved {saved.length > 0 && `(${saved.length})`}
          </button>
        </div>

        {/* Saved palettes panel */}
        {showSaved && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '12px', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <span className="label" style={{ color: 'var(--clr)' }}>Saved Collections</span>
            </div>
            {saved.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                No saved palettes yet. Generate one and hit ⌘S!
              </div>
            ) : (
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {saved.map((entry, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: i < saved.length-1 ? '1px solid var(--border)' : 'none' }}>
                    {/* Color preview */}
                    <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                      {entry.colors.map((c, ci) => (
                        <div key={ci} style={{ width: '20px', height: '32px', borderRadius: '4px', background: c }} />
                      ))}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text)', marginBottom: '2px' }}>{entry.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted2)' }}>{entry.mode} · {new Date(entry.ts).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => loadPalette(entry)} style={{ padding: '5px 12px', borderRadius: '6px', background: 'var(--surface2)', color: 'var(--clr)', border: '1px solid var(--border2)', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>Load</button>
                    <button onClick={() => deleteSaved(i)} style={{ background: 'none', border: 'none', color: 'var(--muted2)', cursor: 'pointer', padding: '4px' }}>
                      <Icons.X size={14} color="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
          {mode !== 'gradient' && (
          <div>
            <span className="label" style={{ display: 'block', marginBottom: '10px' }}>Base Color</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="color" value={base} onChange={handleBaseChange} style={{ width: '42px', height: '42px', borderRadius: '8px', border: '2px solid var(--border2)', cursor: 'pointer', padding: '2px', background: 'none' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)', letterSpacing: '0.06em' }}>{base.toUpperCase()}</span>
            </div>
          </div>
          )}
          <div style={{ flex: 1 }}>
            <span className="label" style={{ display: 'block', marginBottom: '10px' }}>Harmony Mode</span>
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
              {MODES.map((m) => (
                <button key={m.id} onClick={() => handleMode(m.id)} style={{
                  padding: '7px 13px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  background: mode === m.id ? 'var(--surface2)' : 'transparent',
                  color: mode === m.id ? 'var(--clr)' : 'var(--muted)',
                  border: `1px solid ${mode === m.id ? 'var(--border2)' : 'var(--border)'}`,
                  transition: 'all var(--transition)',
                }}>{m.label}</button>
              ))}
            </div>
            {mode === 'gradient' && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Start</span>
                  <input type="color" value={gradientStart} onChange={e => setGradientStart(e.target.value)} style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border2)', cursor: 'pointer', padding: '2px', background: 'none' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text)' }}>{gradientStart.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>End</span>
                  <input type="color" value={gradientEnd} onChange={e => setGradientEnd(e.target.value)} style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border2)', cursor: 'pointer', padding: '2px', background: 'none' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text)' }}>{gradientEnd.toUpperCase()}</span>
                </div>
                <div style={{ width: '100px', height: '28px', borderRadius: '6px', background: gradientCss, border: '1px solid var(--border)' }} />
              </div>
            )}
</div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button onClick={handleRandomize} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'var(--clr)', color: '#000', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
            <Icons.Refresh size={15} color="currentColor" />Randomize
          </button>
          <button onClick={() => regenerate(base, mode)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
            <Icons.Refresh size={15} color="currentColor" />Regenerate
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: copied === exportFormat ? 'var(--surface2)' : 'var(--surface)', color: copied === exportFormat ? 'var(--clr)' : 'var(--muted)', border: `1px solid ${copied === exportFormat ? 'var(--border2)' : 'var(--border)'}`, fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
              {copied === exportFormat ? <Icons.Check size={15} color="currentColor" /> : <Icons.Export size={15} color="currentColor" />}
              {copied === exportFormat ? 'Copied!' : `Export ${exportFormat.toUpperCase()}`}
            </button>
            <button onClick={() => setExportFormat(f => f === 'css' ? 'json' : f === 'json' ? 'scss' : f === 'scss' ? 'tailwind' : 'css')} style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--muted2)', border: '1px solid var(--border)', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
              ↻
            </button>
          </div>
          {!namingMode
            ? <button onClick={() => setNamingMode(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16L21 8V19C21 20.1 20.1 21 19 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M17 21V13H7V21M7 3V8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Save Palette
              </button>
            : <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  autoFocus
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') savePalette(); if (e.key === 'Escape') { setNamingMode(false); setSaveName(''); } }}
                  placeholder="Name this palette…"
                  style={{ padding: '9px 14px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--clr)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-mono)', minWidth: '180px' }}
                />
                <button onClick={savePalette} style={{ padding: '9px 14px', borderRadius: '8px', background: 'var(--clr)', color: '#000', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Save</button>
                <button onClick={() => { setNamingMode(false); setSaveName(''); }} style={{ padding: '9px', borderRadius: '8px', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer' }}>
                  <Icons.X size={14} color="currentColor" />
                </button>
              </div>
          }
          <button onClick={() => setShowContrast(!showContrast)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: showContrast ? 'var(--surface2)' : 'var(--surface)', color: showContrast ? 'var(--clr)' : 'var(--muted)', border: `1px solid ${showContrast ? 'var(--border2)' : 'var(--border)'}`, fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" opacity="0.3"/><path d="M12 6v2m0 8v2m4-6h2M4 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Contrast
          </button>
          <button onClick={() => setShowImageImport(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            From Image
          </button>
          <button onClick={copyShareLink} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: linkCopied ? 'var(--surface2)' : 'var(--surface)', color: linkCopied ? 'var(--clr)' : 'var(--muted)', border: `1px solid ${linkCopied ? 'var(--border2)' : 'var(--border)'}`, fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
            {linkCopied ? <Icons.Check size={15} color="currentColor" /> : <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            {linkCopied ? 'Link Copied!' : 'Share via URL'}
          </button>
        </div>

        {/* Image Import Modal */}
        {showImageImport && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowImageImport(false)}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '32px', maxWidth: '420px', width: '90%' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: 'var(--text)' }}>Extract from Image</div>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>Upload an image to extract its dominant colors and create your palette.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isExtracting}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                style={{ width: '100%', padding: '14px', borderRadius: '10px', background: isExtracting ? 'var(--surface2)' : 'var(--clr)', color: isExtracting ? 'var(--muted)' : '#000', border: 'none', fontWeight: '700', fontSize: '14px', cursor: isExtracting ? 'default' : 'pointer' }}
              >
                {isExtracting ? 'Extracting colors...' : 'Choose Image'}
              </button>
              <button onClick={() => setShowImageImport(false)} style={{ width: '100%', marginTop: '10px', padding: '10px', borderRadius: '10px', background: 'none', color: 'var(--muted)', border: 'none', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Palette swatches */}
        {mode === 'gradient' ? (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '180px', borderRadius: '14px', background: gradientCss, border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '700', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)', letterSpacing: '0.04em' }}>{gradientStart.toUpperCase()}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '700', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)', letterSpacing: '0.04em' }}>{gradientEnd.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => copyHex(gradientStart, 'gstart')} style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                {copied === 'gstart' ? 'Copied!' : `Copy ${gradientStart.toUpperCase()}`}
              </button>
              <button onClick={() => copyHex(gradientEnd, 'gend')} style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                {copied === 'gend' ? 'Copied!' : `Copy ${gradientEnd.toUpperCase()}`}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {palette.map((color, i) => (
              <div key={i} style={{ flex: '1 1 130px', minWidth: '110px', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)', transition: 'transform var(--transition)', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ height: '110px', background: color, position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '8px' }}>
                  <button onClick={() => toggleLock(i)} style={{ width: '28px', height: '28px', borderRadius: '6px', background: locked[i] ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)', border: locked[i] ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all var(--transition)' }}>
                    {locked[i] ? <Icons.Lock size={12} color="#fff" /> : <Icons.Unlock size={12} color="rgba(255,255,255,0.6)" />}
                  </button>
                </div>
                <div style={{ background: 'var(--surface2)', padding: '12px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: 'var(--text)', letterSpacing: '0.04em' }}>{color.toUpperCase()}</div>
                  <button onClick={() => copyHex(color, i)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '5px', background: copied===i ? 'var(--surface)' : 'var(--surface)', color: copied===i ? 'var(--clr)' : 'var(--muted)', border: `1px solid ${copied===i ? 'var(--border2)' : 'var(--border)'}`, fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)', width: '100%', justifyContent: 'center', transition: 'all var(--transition)' }}>
                    {copied===i ? <Icons.Check size={11} color="currentColor" /> : <Icons.Copy size={11} color="currentColor" />}
                    {copied===i ? 'Copied' : 'Copy Hex'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contrast Checker */}
        {showContrast && palette.length > 0 && mode !== 'gradient' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label" style={{ color: 'var(--clr)' }}>WCAG Contrast Ratios</span>
              <div style={{ display: 'flex', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                <span style={{ color: '#22c55e' }}>AAA ≥7:1</span>
                <span style={{ color: '#eab308' }}>AA ≥4.5:1</span>
                <span style={{ color: '#ef4444' }}>Fail &lt;4.5:1</span>
              </div>
            </div>
            <div style={{ padding: '16px', overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', textAlign: 'center', color: 'var(--muted)', fontWeight: '600', borderBottom: '1px solid var(--border)' }}></th>
                    {palette.map((c, i) => (
                      <th key={i} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: c, margin: '0 auto 4px', border: '1px solid var(--border)' }} />
                        <div style={{ color: 'var(--text)', fontSize: '10px' }}>{c.toUpperCase()}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {palette.map((rowColor, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', textAlign: 'center', borderBottom: i < palette.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: rowColor, margin: '0 auto 4px', border: '1px solid var(--border)' }} />
                        <div style={{ color: 'var(--text)', fontSize: '10px' }}>{rowColor.toUpperCase()}</div>
                      </td>
                      {palette.map((colColor, j) => {
                        if (i === j) {
                          return (
                            <td key={j} style={{ padding: '8px', textAlign: 'center', borderBottom: i < palette.length - 1 ? '1px solid var(--border)' : 'none', background: 'var(--surface2)' }}>
                              <span style={{ color: 'var(--muted2)' }}>—</span>
                            </td>
                          );
                        }
                        const ratio = getContrastRatio(rowColor, colColor);
                        const passAAA = ratio >= 7;
                        const passAA = ratio >= 4.5;
                        const color = passAAA ? '#22c55e' : passAA ? '#eab308' : '#ef4444';
                        const badge = passAAA ? 'AAA' : passAA ? 'AA' : 'Fail';
                        return (
                          <td key={j} style={{ padding: '8px', textAlign: 'center', borderBottom: i < palette.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ color, fontWeight: '700', marginBottom: '2px' }}>{ratio.toFixed(2)}:1</div>
                            <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: color + '20', color, fontWeight: '700' }}>{badge}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CSS Preview */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label" style={{ color: 'var(--clr)' }}>{mode === 'gradient' ? 'CSS Gradient' : 'CSS Variables'}</span>
            <button onClick={exportCSS} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>copy</button>
          </div>
          <pre style={{ padding: '16px', margin: 0, fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', lineHeight: '1.8', overflowX: 'auto' }}>
{mode === 'gradient' ? `background: ${gradientCss};` : `:root {\n${palette.map((c,i)=>`  --color-${i+1}: ${c};`).join('\n')}\n}`}
          </pre>
        </div>
      </main>
      <Footer />
    </div>
  );
}
