import { useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Icons from '../../components/Icons';
import useShortcut from '../../lib/useShortcut';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const FORMATS = [
  { id: 'image/jpeg', label: 'JPG',  ext: 'jpg'  },
  { id: 'image/png',  label: 'PNG',  ext: 'png'  },
  { id: 'image/webp', label: 'WebP', ext: 'webp' },
];

export default function ImageCompressor() {
  const [original, setOriginal]     = useState(null);
  const [compressed, setCompressed] = useState(null);
  const [quality, setQuality]       = useState(80);
  const [format, setFormat]         = useState('image/jpeg');
  const [dragging, setDragging]     = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef();

  const compress = useCallback((img, q, fmt) => {
    setProcessing(true);
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    // White bg for PNG→JPG transparency
    if (fmt === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(img, 0, 0);
    const useQuality = fmt === 'image/png' ? undefined : q / 100;
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setCompressed({ src: url, size: blob.size, blob });
      setProcessing(false);
    }, fmt, useQuality);
  }, []);

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginal({ src: e.target.result, size: file.size, name: file.name, w: img.width, h: img.height });
        setCompressed(null);
        compress(img, quality, format);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [quality, format, compress]);

  const recompress = (q, fmt) => {
    if (!original) return;
    const img = new Image(); img.onload = () => compress(img, q, fmt); img.src = original.src;
  };

  const handleQualityChange = (e) => { const q = parseInt(e.target.value); setQuality(q); recompress(q, format); };
  const handleFormatChange  = (f)  => { setFormat(f); recompress(quality, f); };
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files?.[0]); };
  const handleDownload = () => {
    if (!compressed) return;
    const ext = FORMATS.find(f => f.id === format)?.ext || 'jpg';
    const a = document.createElement('a');
    a.href = compressed.src;
    a.download = `a1d-compressed.${ext}`;
    a.click();
  };

  useShortcut([{ key: 'd', meta: true, action: handleDownload }]);

  const saving = original && compressed ? Math.round((1 - compressed.size / original.size) * 100) : 0;
  const isPNG = format === 'image/png';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head><title>Image Compressor — Alpha-1 Design</title></Head>
      <Header />
      <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--img), transparent)' }} />

      <main style={{ flex: 1, maxWidth: '860px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--surface2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Compress size={17} color="var(--img)" />
            </div>
            <span className="label" style={{ color: 'var(--img)' }}>02 / IMAGE COMPRESSOR</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 52px)', letterSpacing: '0.04em', lineHeight: 1 }}>IMAGE COMPRESSOR</h1>
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '6px' }}>
            100% client-side · your images never leave your device ·&nbsp;
            <kbd style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '4px', padding: '1px 5px', fontSize: '11px' }}>⌘D</kbd> to download
          </p>
        </div>

        {!original ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--img)' : 'var(--border2)'}`,
              borderRadius: '16px', padding: '72px 24px',
              textAlign: 'center', cursor: 'pointer',
              background: dragging ? 'var(--surface2)' : 'var(--surface)',
              transition: 'all var(--transition)',
            }}
          >
            <Icons.Upload size={44} color={dragging ? 'var(--img)' : 'var(--muted)'} />
            <p style={{ marginTop: '16px', fontWeight: '700', fontSize: '16px', color: 'var(--text)' }}>Drop an image here</p>
            <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '6px' }}>or click to browse — JPG, PNG, WebP, GIF</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => processFile(e.target.files?.[0])} style={{ display: 'none' }} />
          </div>
        ) : (
          <>
            {/* Controls row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', marginBottom: '20px', alignItems: 'start' }}>
              {/* Quality */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="label">Quality {isPNG && '(PNG = lossless)'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: '700', color: quality > 70 ? 'var(--img)' : quality > 40 ? 'var(--clr)' : '#f87171' }}>
                    {isPNG ? '—' : `${quality}%`}
                  </span>
                </div>
                <input type="range" min="10" max="100" value={quality} onChange={handleQualityChange} disabled={isPNG}
                  style={{ width: '100%', accentColor: 'var(--img)', cursor: isPNG ? 'not-allowed' : 'pointer', opacity: isPNG ? 0.4 : 1 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted2)' }}>Smaller</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted2)' }}>Higher quality</span>
                </div>
              </div>

              {/* Format */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                <span className="label" style={{ display: 'block', marginBottom: '12px' }}>Output Format</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {FORMATS.map((f) => (
                    <button key={f.id} onClick={() => handleFormatChange(f.id)} style={{
                      padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700',
                      cursor: 'pointer', transition: 'all var(--transition)',
                      background: format === f.id ? 'var(--img)' : 'var(--surface2)',
                      color: format === f.id ? '#000' : 'var(--muted)',
                      border: `1px solid ${format === f.id ? 'var(--img)' : 'var(--border)'}`,
                      fontFamily: 'var(--font-mono)',
                    }}>{f.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Original',   value: formatBytes(original.size),    color: 'var(--text)' },
                { label: 'Compressed', value: compressed ? formatBytes(compressed.size) : '…', color: 'var(--img)' },
                { label: 'Saved',      value: compressed ? `${saving > 0 ? saving : 0}%` : '…', color: saving > 0 ? 'var(--img)' : 'var(--muted)' },
                { label: 'Dimensions', value: `${original.w}×${original.h}`, color: 'var(--muted)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                  <span className="label" style={{ display: 'block', marginBottom: '4px' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: '700', color }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              {[
                { label: 'Original', src: original.src, size: original.size },
                { label: 'Output',   src: compressed?.src, size: compressed?.size },
              ].map(({ label, src, size }) => (
                <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '9px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="label">{label}</span>
                    {size && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{formatBytes(size)}</span>}
                  </div>
                  <div style={{ padding: '12px', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'repeating-conic-gradient(var(--surface2) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px' }}>
                    {src
                      ? <img src={src} alt={label} style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '4px', objectFit: 'contain' }} />
                      : processing
                        ? <Icons.Loader size={24} color="var(--muted)" />
                        : <span style={{ color: 'var(--muted2)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Waiting…</span>
                    }
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleDownload} disabled={!compressed || processing} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '11px 22px', borderRadius: '8px',
                background: compressed && !processing ? 'var(--img)' : 'var(--surface2)',
                color: compressed && !processing ? '#000' : 'var(--muted)',
                border: 'none', fontWeight: '700', fontSize: '14px',
                cursor: compressed && !processing ? 'pointer' : 'not-allowed',
                transition: 'all var(--transition)',
              }}>
                {processing ? <Icons.Loader size={16} color="currentColor" /> : <Icons.Download size={16} color="currentColor" />}
                {processing ? 'Processing…' : 'Download'}
              </button>
              <button onClick={() => { setOriginal(null); setCompressed(null); setQuality(80); setFormat('image/jpeg'); }} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '11px 16px', borderRadius: '8px',
                background: 'none', color: 'var(--muted)',
                border: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px',
              }}>
                <Icons.Trash size={14} color="currentColor" />New Image
              </button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
