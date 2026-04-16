import { useState, useRef, useCallback, useEffect } from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Icons from '../../components/Icons';
import useShortcut from '../../lib/useShortcut';

function ImageCard({ img, index, onSelect, onRemove, isSelected }) {
  return (
    <div
      onClick={() => onSelect(index)}
      style={{
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: `2px solid ${isSelected ? 'var(--img)' : 'var(--border)'}`,
        background: 'var(--surface2)',
        aspectRatio: '1',
        transition: 'all var(--transition)',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isSelected ? '0 0 0 2px rgba(16,185,129,0.3)' : 'none',
      }}
    >
      <img
        src={img.src}
        alt={img.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(index); }}
        style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.7)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icons.X size={12} color="#fff" />
      </button>
      <div style={{
        position: 'absolute',
        bottom: '6px',
        left: '6px',
        padding: '3px 8px',
        borderRadius: '4px',
        background: 'rgba(0,0,0,0.6)',
        fontSize: '10px',
        fontFamily: 'var(--font-mono)',
        color: '#fff',
        maxWidth: '80px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {img.name}
      </div>
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '6px',
          left: '6px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'var(--img)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icons.Check size={10} color="#000" />
        </div>
      )}
    </div>
  );
}

function DraggableCanvasItem({ item, canvasWidth, canvasHeight, onUpdate, onRemove }) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const itemStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const handleMouseDown = (e, type) => {
    e.stopPropagation();
    if (type === 'drag') setDragging(true);
    else setResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    itemStart.current = { x: item.x, y: item.y, w: item.width, h: item.height };
  };

  useEffect(() => {
    if (!dragging && !resizing) return;
    const handleMove = (e) => {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      if (dragging) {
        onUpdate({ ...item, x: itemStart.current.x + dx, y: itemStart.current.y + dy });
      } else if (resizing) {
        const newW = Math.max(50, itemStart.current.w + dx);
        const newH = Math.max(50, itemStart.current.h + dy);
        onUpdate({ ...item, width: newW, height: newH });
      }
    };
    const handleUp = () => { setDragging(false); setResizing(false); };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, resizing, item, onUpdate]);

  return (
    <div
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      <img
        src={item.src}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'item.imageCrop' ? 'none' : 'cover', objectPosition: `${item.cropX || 0}% ${item.cropY || 0}%` }}
        draggable={false}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
        style={{
          position: 'absolute',
          inset: 0,
          border: '2px solid var(--img)',
          borderRadius: '4px',
          background: 'rgba(16,185,129,0.1)',
        }}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'resize')}
        style={{
          position: 'absolute',
          right: '-6px',
          bottom: '-6px',
          width: '16px',
          height: '16px',
          background: 'var(--img)',
          borderRadius: '4px',
          cursor: 'se-resize',
        }}
      />
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: '#ef4444',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icons.X size={10} color="#fff" />
      </button>
    </div>
  );
}

export default function ImageCollage() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [canvasItems, setCanvasItems] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ w: 1200, h: 800 });
  const [dragging, setDragging] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [cropMode, setCropMode] = useState(false);
  const [cropRect, setCropRect] = useState(null);
  const cropStart = useRef(null);
  const fileRef = useRef();
  const canvasRef = useRef();

  const ASPECT_RATIOS = [
    { label: '16:9', w: 16, h: 9 },
    { label: '4:3', w: 4, h: 3 },
    { label: '1:1', w: 1, h: 1 },
    { label: '3:4', w: 3, h: 4 },
    { label: '9:16', w: 9, h: 16 },
  ];

  useEffect(() => {
    const ratio = ASPECT_RATIOS.find(r => r.label === aspectRatio) || ASPECT_RATIOS[0];
    const base = 800;
    const scale = base / Math.max(ratio.w, ratio.h);
    setCanvasSize({ w: ratio.w * scale, h: ratio.h * scale });
  }, [aspectRatio]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImages((prev) => [...prev, {
            src: e.target.result,
            name: file.name,
            w: img.naturalWidth,
            h: img.naturalHeight,
            id: Date.now() + Math.random(),
          }]);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (selectedImage === index) setSelectedImage(null);
  };

  const addToCanvas = () => {
    if (selectedImage === null || selectedImage >= images.length) return;
    const img = images[selectedImage];
    const ratio = ASPECT_RATIOS.find(r => r.label === aspectRatio) || ASPECT_RATIOS[0];
    const baseSize = 200;
    const imgRatio = img.w / img.h;
    let w = baseSize;
    let h = baseSize / imgRatio;
    if (w > canvasSize.w * 0.4) { w = canvasSize.w * 0.4; h = w / imgRatio; }
    setCanvasItems((prev) => [...prev, {
      id: Date.now(),
      src: img.src,
      x: 20 + (prev.length * 30) % 200,
      y: 20 + (prev.length * 30) % 200,
      width: w,
      height: h,
      imageCrop: false,
      cropX: 0,
      cropY: 0,
    }]);
  };

  const updateCanvasItem = (id, updates) => {
    setCanvasItems((prev) => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeCanvasItem = (id) => {
    setCanvasItems((prev) => prev.filter(item => item.id !== id));
  };

  const handleCropStart = (e) => {
    if (!cropMode || selectedImage === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    cropStart.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleCropMove = (e) => {
    if (!cropMode || !cropStart.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCropRect({
      x: Math.min(cropStart.current.x, x),
      y: Math.min(cropStart.current.y, y),
      w: Math.abs(x - cropStart.current.x),
      h: Math.abs(y - cropStart.current.y),
    });
  };

  const handleCropEnd = () => {
    if (!cropMode || !cropRect || selectedImage === null) return;
    const img = images[selectedImage];
    const container = document.getElementById('source-image-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cropData = {
      x: (cropRect.x / rect.width) * 100,
      y: (cropRect.y / rect.height) * 100,
      w: (cropRect.w / rect.width) * 100,
      h: (cropRect.h / rect.height) * 100,
    };
    const ratio = ASPECT_RATIOS.find(r => r.label === aspectRatio) || ASPECT_RATIOS[0];
    const baseSize = 200;
    const imgRatio = img.w / img.h;
    let w = baseSize;
    let h = baseSize / imgRatio;
    if (w > canvasSize.w * 0.4) { w = canvasSize.w * 0.4; h = w / imgRatio; }
    setCanvasItems((prev) => [...prev, {
      id: Date.now(),
      src: img.src,
      x: 20 + (prev.length * 30) % 200,
      y: 20 + (prev.length * 30) % 200,
      width: w,
      height: h,
      imageCrop: true,
      cropX: cropData.x + cropData.w / 2,
      cropY: cropData.y + cropData.h / 2,
    }]);
    setCropRect(null);
    setCropMode(false);
  };

  const exportCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvasItems.forEach((item) => {
      const img = new Image();
      img.src = item.src;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = item.width;
      tempCanvas.height = item.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (item.imageCrop) {
        const sw = (item.cropX / 100) * img.naturalWidth;
        const sh = (item.cropY / 100) * img.naturalHeight;
        const swu = (item.cropW || 50) / 100 * img.naturalWidth;
        const shu = (item.cropH || 50) / 100 * img.naturalHeight;
        tempCtx.drawImage(img, sw, sh, swu, shu, 0, 0, item.width, item.height);
      } else {
        tempCtx.drawImage(img, 0, 0, item.width, item.height);
      }
      ctx.drawImage(tempCanvas, item.x, item.y);
    });
    const link = document.createElement('a');
    link.download = `collage-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [canvasItems, canvasSize, backgroundColor]);

  useShortcut([{ key: 'd', meta: true, action: exportCanvas }]);

  const clearCanvas = () => setCanvasItems([]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Image Collage / Moodboard — Alpha-1 Design</title>
        <meta name="description" content="Create beautiful image collages and moodboards. Upload multiple images, drag to arrange, crop specific regions, and export as a single composition. 100% client-side." />
        <meta property="og:title" content="Image Collage / Moodboard — Alpha-1 Design" />
        <meta property="og:description" content="Create beautiful image collages and moodboards. 100% client-side." />
        <meta property="og:image" content="/og-image-tool.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Header />
      <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--img), transparent)' }} />
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>

        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--surface2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Image size={17} color="var(--img)" />
            </div>
            <span className="label" style={{ color: 'var(--img)' }}>02 / IMAGE TOOLS</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 52px)', letterSpacing: '0.04em', lineHeight: 1 }}>COLLAGE / MOODBOARD</h1>
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '6px' }}>
            Select regions from different images and assemble them · ⌘D to export
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
          {/* Left Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Upload Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${dragging ? 'var(--img)' : 'var(--border2)'}`, borderRadius: '12px', padding: '32px 16px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--surface2)' : 'var(--surface)', transition: 'all var(--transition)' }}
            >
              <Icons.Upload size={32} color={dragging ? 'var(--img)' : 'var(--muted)'} />
              <p style={{ marginTop: '10px', fontWeight: '700', fontSize: '14px', color: 'var(--text)' }}>Drop images</p>
              <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '4px' }}>or click to browse</p>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
            </div>

            {/* Image Thumbnails */}
            {images.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="label">Source Images ({images.length})</span>
                  <button onClick={() => setImages([])} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                    <Icons.Trash size={12} color="var(--muted)" />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {images.map((img, idx) => (
                    <ImageCard
                      key={img.id}
                      img={img}
                      index={idx}
                      onSelect={setSelectedImage}
                      onRemove={removeImage}
                      isSelected={selectedImage === idx}
                    />
                  ))}
                </div>
                {selectedImage !== null && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={addToCanvas}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', background: 'var(--img)', color: '#000', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                    >
                      <Icons.Plus size={12} color="currentColor" />Add to Canvas
                    </button>
                    <button
                      onClick={() => setCropMode(true)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Crop Region
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Canvas Settings */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
              <span className="label" style={{ display: 'block', marginBottom: '12px' }}>Canvas Settings</span>
              
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>Aspect Ratio</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.label}
                      onClick={() => setAspectRatio(ratio.label)}
                      style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: aspectRatio === ratio.label ? 'var(--img)' : 'var(--surface2)', color: aspectRatio === ratio.label ? '#000' : 'var(--muted)', border: `1px solid ${aspectRatio === ratio.label ? 'var(--img)' : 'var(--border)'}`, transition: 'all var(--transition)' }}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>Background</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['#ffffff', '#f3f4f6', '#1f2937', '#0f172a', '#fef3c7', '#fce7f3', '#dbeafe', '#d1fae5'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      style={{ width: '28px', height: '28px', borderRadius: '6px', background: color, border: backgroundColor === color ? '2px solid var(--img)' : '1px solid var(--border)', cursor: 'pointer', transition: 'all var(--transition)' }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={clearCanvas}
                  disabled={canvasItems.length === 0}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', background: canvasItems.length > 0 ? 'var(--surface2)' : 'var(--surface)', color: canvasItems.length > 0 ? 'var(--text)' : 'var(--muted2)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '12px', cursor: canvasItems.length > 0 ? 'pointer' : 'not-allowed', opacity: canvasItems.length > 0 ? 1 : 0.5 }}
                >
                  <Icons.Trash size={12} color="currentColor" />Clear
                </button>
                <button
                  onClick={exportCanvas}
                  disabled={canvasItems.length === 0}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', background: canvasItems.length > 0 ? 'var(--img)' : 'var(--surface2)', color: canvasItems.length > 0 ? '#000' : 'var(--muted)', border: 'none', fontWeight: '700', fontSize: '12px', cursor: canvasItems.length > 0 ? 'pointer' : 'not-allowed', opacity: canvasItems.length > 0 ? 1 : 0.5 }}
                >
                  <Icons.Download size={12} color="currentColor" />Export
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="label">Composition Canvas ({canvasItems.length} items)</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>{canvasSize.w} × {canvasSize.h}</span>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                {/* Canvas */}
                <div
                  ref={canvasRef}
                  style={{
                    flex: 1,
                    aspectRatio: `${canvasSize.w}/${canvasSize.h}`,
                    maxHeight: '600px',
                    background: backgroundColor,
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 0 0 1px var(--border)',
                  }}
                >
                  {canvasItems.length === 0 ? (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted2)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      Select an image and click &quot;Add to Canvas&quot; to start
                    </div>
                  ) : (
                    canvasItems.map((item) => (
                      <DraggableCanvasItem
                        key={item.id}
                        item={item}
                        canvasWidth={canvasSize.w}
                        canvasHeight={canvasSize.h}
                        onUpdate={(updates) => updateCanvasItem(item.id, updates)}
                        onRemove={removeCanvasItem}
                      />
                    ))
                  )}
                </div>

                {/* Source Image Preview with Crop */}
                {selectedImage !== null && images[selectedImage] && (
                  <div
                    id="source-image-container"
                    style={{ width: '200px', flexShrink: 0 }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>
                      {cropMode ? 'Draw crop area' : 'Source Preview'}
                    </span>
                    <div
                      onMouseDown={cropMode ? handleCropStart : undefined}
                      onMouseMove={cropMode ? handleCropMove : undefined}
                      onMouseUp={cropMode ? handleCropEnd : undefined}
                      onMouseLeave={cropMode ? handleCropEnd : undefined}
                      style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', cursor: cropMode ? 'crosshair' : 'default', background: 'var(--surface2)', aspectRatio: '1' }}
                    >
                      <img
                        src={images[selectedImage].src}
                        alt={images[selectedImage].name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        draggable={false}
                      />
                      {cropRect && (
                        <div style={{
                          position: 'absolute',
                          left: cropRect.x,
                          top: cropRect.y,
                          width: cropRect.w,
                          height: cropRect.h,
                          border: '2px dashed var(--img)',
                          background: 'rgba(16,185,129,0.2)',
                          pointerEvents: 'none',
                        }} />
                      )}
                    </div>
                    {cropMode && (
                      <p style={{ fontSize: '10px', color: 'var(--img)', fontFamily: 'var(--font-mono)', marginTop: '8px', textAlign: 'center' }}>
                        Click and drag on image to select region
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div style={{ marginTop: '16px', padding: '14px 16px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div><span style={{ color: 'var(--text)' }}>Drag</span> images on canvas to move</div>
              <div><span style={{ color: 'var(--text)' }}>Resize</span> using corner handle</div>
              <div><span style={{ color: 'var(--text)' }}>Crop</span> select region from source</div>
              <div><span style={{ color: 'var(--text)' }}>Export</span> downloads PNG</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
