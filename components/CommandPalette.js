import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Icons from './Icons';
import ApiKeyManager from './ApiKeyManager';

const COMMANDS = [
  { id: 'ai', label: 'AI Writer', path: '/ai', icon: 'AI', keywords: 'text generate writing' },
  { id: 'image', label: 'Image Compress', path: '/image', icon: 'Image', keywords: 'compress resize optimize' },
  { id: 'bulk', label: 'Bulk Compress', path: '/image/bulk', icon: 'Compress', keywords: 'batch multiple files' },
  { id: 'palette', label: 'Color Palette', path: '/design', icon: 'Palette', keywords: 'colors design generator' },
  { id: 'fonts', label: 'Fonts', path: '/fonts', icon: 'AI', keywords: 'typography type' },
  { id: 'home', label: 'Home', path: '/', icon: 'Home', keywords: 'landing' },
  { id: 'keys', label: 'API Keys', path: 'keys', icon: 'Key', keywords: 'api key configuration' },
  { id: 'theme', label: 'Toggle Theme', path: 'theme', icon: 'Palette', keywords: 'dark light mode' },
];

export default function CommandPalette({ onClose }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  const filtered = query
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.keywords?.includes(query.toLowerCase()))
    : COMMANDS;

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selected]) {
      e.preventDefault();
      const cmd = filtered[selected];
      if (cmd.path === 'keys') { setShowKeyModal(true); onClose?.(); return; }
      if (cmd.path === 'theme') { window.dispatchEvent(new CustomEvent('toggle-theme')); onClose?.(); return; }
      router.push(cmd.path);
      onClose?.();
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  }, [filtered, selected, router, onClose]);

  useEffect(() => {
    inputRef.current?.focus();
    const down = (e) => { if (e.key === 'k' && e.metaKey) { e.preventDefault(); onClose?.(); } };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: '520px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <Icons.Search size={18} color="var(--muted)" />
          <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelected(0); }} onKeyDown={handleKeyDown} placeholder="Search commands..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '15px', color: 'var(--text)' }} />
          <span style={{ fontSize: '10px', color: 'var(--muted2)', fontFamily: 'var(--font-mono)', padding: '3px 6px', background: 'var(--surface2)', borderRadius: '4px' }}>ESC</span>
        </div>
        <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>No commands found</div>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = Icons[cmd.icon] || Icons.AI;
              return (
                <Link key={cmd.id} href={cmd.path} onClick={(e) => { if (cmd.path === 'keys') { e.preventDefault(); setShowKeyModal(true); } if (cmd.path === 'theme') { e.preventDefault(); window.dispatchEvent(new CustomEvent('toggle-theme')); } onClose?.(); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', background: i === selected ? 'var(--surface2)' : 'transparent', color: 'var(--text)', textDecoration: 'none', cursor: 'pointer' }}>
                  <Icon size={17} color={i === selected ? 'var(--ai)' : 'var(--muted)'} />
                  <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{cmd.label}</span>
                  {i === selected && <span style={{ fontSize: '10px', color: 'var(--muted2)', fontFamily: 'var(--font-mono)' }}>↵</span>}
                </Link>
              );
            })
          )}
        </div>
      </div>

      {showKeyModal && <ApiKeyManager onClose={() => setShowKeyModal(false)} />}
    </div>
  );
}