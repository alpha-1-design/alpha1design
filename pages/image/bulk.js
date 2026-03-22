import { useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Icons from '../../components/Icons';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const FORMATS = [
  { id: 'image/jpeg', label: 'JPG', ext: 'jpg'  },
  { id: 'image/png',  label: 'PNG', ext: 'png'  },
  { id: 'image/webp', label: 'WebP', ext: 'webp' },
];

function compressOne(file, quality, format) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (format === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        ctx.drawImage(img, 0, 0);
        const q = format === 'image/png' ? undefined : quality / 100;
        canvas.toBlob((blob) => {
          if (!blob || blob.size >= file.size) resolve({ blob: file, size: file.size, optimal: true });
          else resolve({ blob, size: blob.size, optimal: false });
        }, format, q);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function BulkCompressor() {
  const [files, setFiles]         = useState([]);
  const [results, setResults]     = useState([]);
  const [quality, setQuality]     = useState(80);
  const [format, setFormat]       = useState('image/jpeg');
  const [dragging, setDragging]   = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [done, setDone]           = useState(false);
  const fileRef = useRef();

  const addFiles = useCallback((newFiles) => {
    const imgs = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
    if (!imgs.length) return;
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      return [...prev, ...imgs.filter(f => !existing.has(f.name + f.size))];
    });
    setDone(false); setResults([]);
  }, []);

  const removeFile = (i) => { setFiles(prev => prev.filter((_,idx) => idx !== i)); setResults([]); setDone(false); };

  const handleCompress = async () => {
    if (!files.length || processing) return;
    setProcessing(true); setDone(false); setResults([]); setCurrentIdx(0);
    const out = [];
    for (let i = 0; i < files.length; i++) {
      setCurrentIdx(i + 1);
      out.push({ file: files[i], ...(await compressOne(files[i], quality, format)) });
    }
    setResults(out); setProcessing(false); setDone(true);
  };

  const handleDownloadZip = async () => {
    if (!results.length) return;
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const ext = FORMATS.find(f => f.id === format)?.ext || 'jpg';
    const folder = zip.folder('a1d-compressed');
    for (const r of results) folder.file(r.file.name.replace(/\.[^/.]+$/, '') + `-compressed.${ext}`, r.blob);
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(content); a.download = 'a1d-compressed.zip'; a.click();
  };

  const handleDownloadOne = (r) => {
    const ext = FORMATS.find(f => f.id === format)?.ext || 'jpg';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(r.blob);
    a.download = r.file.name.replace(/\.[^/.]+$/, '') + `.${ext}`; a.click();
  };

  const totalOriginal   = files.reduce((s, f) => s + f.size, 0);
  const totalCompressed = results.reduce((s, r) => s + r.size, 0);
  const totalSaved = totalOriginal > 0 && totalCompressed > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;
  const progress = files.length > 0 ? Math.round((currentIdx / files.length) * 100) : 0;
  const isPNG = format === 'image/png';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head><title>Bulk Compressor — Alpha-1 Design</title></Head>
      <Header />
      <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--img), transparent)' }} />
      <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--surface2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Compress size={17} color="var(--img)" />
            </div>
            <span className="label" style={{ color: 'var(--img)' }}>02B / BULK COMPRESSOR</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 52px)', letterSpacing: '0.04em', lineHeight: 1 }}>BULK COMPRESSOR</h1>
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '6px' }}>Compress multiple images · download as ZIP · 100% client-side</p>
        </div>

        <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'var(--img)' : 'var(--border2)'}`, borderRadius: '16px', padding: files.length ? '24px' : '60px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--surface2)' : 'var(--surface)', transition: 'all var(--transition)', marginBottom: '24px' }}>
          <Icons.Upload size={files.length ? 28 : 44} color={dragging ? 'var(--img)' : 'var(--muted)'} />
          <p style={{ marginTop: '12px', fontWeight: '700', fontSize: '15px', color: 'var(--text)' }}>{files.length ? `${files.length} image${files.length>1?'s':''} added — drop more` : 'Drop images here'}</p>
          {!files.length && <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '6px' }}>click to browse · select multiple</p>}
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} style={{ display: 'none' }} />
        </div>

        {files.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', marginBottom: '20px', alignItems: 'start' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className="label">Quality</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: '700', color: 'var(--img)' }}>{isPNG ? 'Lossless' : `${quality}%`}</span>
                </div>
                <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(parseInt(e.target.value))} disabled={isPNG || processing} style={{ width: '100%', accentColor: 'var(--img)', opacity: isPNG ? 0.4 : 1 }} />
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <span className="label" style={{ display: 'block', marginBottom: '10px' }}>Format</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {FORMATS.map(f => (
                    <button key={f.id} onClick={() => setFormat(f.id)} disabled={processing} style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', background: format===f.id ? 'var(--img)' : 'var(--surface2)', color: format===f.id ? '#000' : 'var(--muted)', border: `1px solid ${format===f.id ? 'var(--img)' : 'var(--border)'}`, fontFamily: 'var(--font-mono)' }}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={handleCompress} disabled={processing || !files.length} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '8px', background: processing ? 'var(--surface2)' : 'var(--img)', color: processing ? 'var(--muted)' : '#000', border: 'none', fontWeight: '700', fontSize: '13px', cursor: processing ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                  {processing ? <Icons.Loader size={15} color="currentColor"/> : <Icons.Compress size={15} color="currentColor"/>}
                  {processing ? `${currentIdx}/${files.length}` : 'Compress All'}
                </button>
                {done && (
                  <button onClick={handleDownloadZip} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '8px', background: 'var(--img)', color: '#000', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <Icons.Download size={15} color="currentColor"/>Download ZIP
                  </button>
                )}
                <button onClick={() => { setFiles([]); setResults([]); setDone(false); setCurrentIdx(0); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', background: 'none', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  <Icons.Trash size={13} color="currentColor"/>Clear All
                </button>
              </div>
            </div>

            {processing && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="label" style={{ color: 'var(--img)' }}>Compressing {currentIdx} of {files.length}...</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--img)', fontWeight: '700' }}>{progress}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--surface2)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '100px', background: 'linear-gradient(90deg, var(--img), #34d399)', width: `${progress}%`, transition: 'width 200ms ease' }} />
                </div>
              </div>
            )}

            {done && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Files',  value: `${files.length}`,           color: 'var(--text)' },
                  { label: 'Before', value: formatBytes(totalOriginal),   color: 'var(--text)' },
                  { label: 'After',  value: formatBytes(totalCompressed), color: 'var(--img)'  },
                  { label: 'Saved',  value: `${totalSaved > 0 ? totalSaved : 0}%`, color: totalSaved > 0 ? 'var(--img)' : 'var(--clr)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                    <span className="label" style={{ display: 'block', marginBottom: '4px' }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: '700', color }}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span className="label" style={{ color: 'var(--img)' }}>Queue — {files.length} images</span>
                {done && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--img)' }}>✓ Done</span>}
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {files.map((file, i) => {
                  const r = results[i];
                  const saving = r && !r.optimal ? Math.round((1 - r.size / file.size) * 100) : 0;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: i < files.length-1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: 'var(--surface2)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {r ? <img src={URL.createObjectURL(r.blob)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icons.Image size={15} color="var(--muted)"/>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                          {formatBytes(file.size)}
                          {r && <span style={{ color: r.optimal ? 'var(--clr)' : 'var(--img)', marginLeft: '8px' }}>→ {formatBytes(r.size)} {r.optimal ? '(optimal)' : `(-${saving}%)`}</span>}
                        </div>
                      </div>
                      {processing && currentIdx === i+1 && <Icons.Loader size={15} color="var(--img)"/>}
                      {r && <button onClick={() => handleDownloadOne(r)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', background: 'var(--surface2)', color: 'var(--img)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '11px', fontFamily: 'var(--font-mono)', flexShrink: 0 }}><Icons.Download size={11} color="currentColor"/>Save</button>}
                      {!processing && <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: 'var(--muted2)', cursor: 'pointer', padding: '4px', flexShrink: 0 }}><Icons.X size={14} color="currentColor"/></button>}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
