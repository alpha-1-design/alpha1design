import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Icons from '../../components/Icons';
import useShortcut from '../../lib/useShortcut';

const TYPES = [
  { id: 'blog',  label: 'Blog Post' },
  { id: 'email', label: 'Email'     },
  { id: 'tweet', label: 'Tweet'     },
  { id: 'code',  label: 'Code'      },
  { id: 'ad',    label: 'Ad Copy'   },
  { id: 'free',  label: 'Free'      },
];

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'casual',       label: 'Casual'       },
  { id: 'witty',        label: 'Witty'        },
  { id: 'bold',         label: 'Bold'         },
  { id: 'minimal',      label: 'Minimal'      },
];

const TEMPLATES = [
  { label: 'Product Launch',    prompt: 'Write a product launch announcement for Alpha-1 Design, a new AI-powered creative studio PWA.' },
  { label: 'Cold Email',        prompt: 'Write a cold outreach email to a potential client who runs a SaaS startup needing design help.' },
  { label: 'Twitter Thread',    prompt: 'Write a 5-tweet thread about why every developer should learn design fundamentals.' },
  { label: 'Landing Page Hero', prompt: 'Write a landing page headline, subheadline, and CTA for a premium design studio app.' },
  { label: 'React Hook',        prompt: 'Write a custom React hook called useDebounce that debounces a value by a given delay. Include TypeScript types and usage example.' },
];

// ── Model definitions ────────────────────────────────────────────────────────
const MODELS = [
  {
    id:       'claude',
    label:    'Claude',
    sub:      'Anthropic',
    color:    '#6366f1',
    endpoint: '/api/generate',
    keyName:  'ANTHROPIC_API_KEY',
    getKey:   'console.anthropic.com',
    free:     false,
    icon: ({ size = 16, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M13.827 3.52l7.863 20.028h-3.332l-1.639-4.402H7.304l-1.638 4.402H2.333L10.197 3.52h3.63zm-1.815 5.31l-2.568 6.905h5.135l-2.567-6.906z"/>
      </svg>
    ),
  },
  {
    id:       'gemini',
    label:    'Gemini',
    sub:      'Google',
    color:    '#4285f4',
    endpoint: '/api/gemini',
    keyName:  'GEMINI_API_KEY',
    getKey:   'aistudio.google.com',
    free:     true,
    icon: ({ size = 16 }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C12 2 7.5 8.5 7.5 12C7.5 15.5 12 22 12 22C12 22 16.5 15.5 16.5 12C16.5 8.5 12 2 12 2Z" fill="#4285f4"/>
        <path d="M2 12C2 12 8.5 7.5 12 7.5C15.5 7.5 22 12 22 12C22 12 15.5 16.5 12 16.5C8.5 16.5 2 12 2 12Z" fill="#34a853"/>
      </svg>
    ),
  },
  {
    id:       'groq',
    label:    'Groq',
    sub:      'Llama 3.3',
    color:    '#f55036',
    endpoint: '/api/groq',
    keyName:  'GROQ_API_KEY',
    getKey:   'console.groq.com',
    free:     true,
    icon: ({ size = 16, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="3.5" fill={color}/>
        <path d="M12 3V7M12 17V21M3 12H7M17 12H21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id:       'mistral',
    label:    'Mistral',
    sub:      'Small',
    color:    '#ff7000',
    endpoint: '/api/mistral',
    keyName:  'MISTRAL_API_KEY',
    getKey:   'console.mistral.ai',
    free:     true,
    icon: ({ size = 16, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2"  y="4"  width="5" height="5" fill={color}/>
        <rect x="9"  y="4"  width="5" height="5" fill={color}/>
        <rect x="16" y="4"  width="5" height="5" fill={color}/>
        <rect x="2"  y="11" width="5" height="5" fill={color}/>
        <rect x="16" y="11" width="5" height="5" fill={color}/>
        <rect x="9"  y="15" width="5" height="5" fill={color}/>
      </svg>
    ),
  },
];

function getStats(text) {
  if (!text) return null;
  const words     = text.trim().split(/\s+/).filter(Boolean).length;
  const chars     = text.length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(words / 200));
  return { words, chars, sentences, readingTime };
}

const HISTORY_KEY = 'a1d-ai-history';
const MAX_HISTORY = 10;
const MODEL_KEY   = 'a1d-preferred-model';

export default function AIWriter() {
  const [prompt, setPrompt]   = useState('');
  const [type, setType]       = useState('free');
  const [tone, setTone]       = useState('professional');
  const [result, setResult]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [modelId, setModelId] = useState('claude');
  const [usedModelId, setUsedModelId] = useState(null);

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      setHistory(h);
      const m = localStorage.getItem(MODEL_KEY);
      if (m && MODELS.find(x => x.id === m)) setModelId(m);
    } catch {}
  }, []);

  const activeModel  = MODELS.find(m => m.id === modelId) || MODELS[0];
  const usedModel    = usedModelId ? MODELS.find(m => m.id === usedModelId) : activeModel;
  const ModelIcon    = activeModel.icon;
  const UsedIcon     = usedModel?.icon;

  const saveToHistory = useCallback((p, r, t, tn, mid) => {
    const entry   = { prompt: p, result: r, type: t, tone: tn, model: mid, ts: Date.now() };
    const updated = [entry, ...history].slice(0, MAX_HISTORY);
    setHistory(updated);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
  }, [history]);

  const switchModel = (id) => {
    setModelId(id);
    setError('');
    try { localStorage.setItem(MODEL_KEY, id); } catch {}
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true); setError(''); setResult(''); setUsedModelId(null);
    try {
      const res  = await fetch(activeModel.endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt, type, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResult(data.result);
      setUsedModelId(activeModel.id);
      saveToHistory(prompt, data.result, type, tone, activeModel.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [prompt, type, tone, activeModel, loading, saveToHistory]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const restoreEntry = (entry) => {
    setPrompt(entry.prompt);
    setResult(entry.result);
    setType(entry.type);
    setTone(entry.tone);
    if (entry.model) switchModel(entry.model);
    setShowHistory(false);
  };

  useShortcut([
    { key: 'Enter', meta: true, action: handleGenerate },
    { key: 'k', meta: true, action: () => { setPrompt(''); setResult(''); setError(''); } },
  ]);

  const stats = getStats(result);

  // Check if error looks like a key/quota issue
  const isKeyError = error && (
    error.toLowerCase().includes('key') ||
    error.toLowerCase().includes('credit') ||
    error.toLowerCase().includes('quota') ||
    error.toLowerCase().includes('billing') ||
    error.toLowerCase().includes('balance') ||
    error.toLowerCase().includes('not configured') ||
    error.toLowerCase().includes('unauthorized') ||
    error.toLowerCase().includes('invalid')
  );

  // Other models to suggest switching to
  const otherModels = MODELS.filter(m => m.id !== modelId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head><title>AI Writer — Alpha-1 Design</title></Head>
      <Header />
      <div style={{ height: '2px', background: `linear-gradient(90deg, ${activeModel.color}, transparent)` }} />

      <main style={{ flex: 1, maxWidth: '860px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>

        {/* Title */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--surface2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.AI size={17} color="var(--ai)" />
              </div>
              <span className="label" style={{ color: 'var(--ai)' }}>01 / AI WRITER</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 52px)', letterSpacing: '0.04em', lineHeight: 1 }}>AI TEXT GENERATOR</h1>
            <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '6px' }}>
              4 AI models · switch instantly if one runs out
            </p>
          </div>

          <button onClick={() => setShowHistory(!showHistory)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '8px',
            background: showHistory ? 'var(--surface2)' : 'var(--surface)',
            color: 'var(--muted)', border: '1px solid var(--border2)',
            fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3.05 11A9 9 0 1 1 4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 7V11H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            History {history.length > 0 && `(${history.length})`}
          </button>
        </div>

        {/* ── MODEL SELECTOR ────────────────────────────────────────────── */}
        <div style={{ marginBottom: '28px' }}>
          <span className="label" style={{ display: 'block', marginBottom: '12px' }}>Choose AI Model</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            {MODELS.map((m) => {
              const Icon    = m.icon;
              const active  = modelId === m.id;
              return (
                <button key={m.id} onClick={() => switchModel(m.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderRadius: '10px',
                  border: `1.5px solid ${active ? m.color : 'var(--border)'}`,
                  background: active ? `${m.color}15` : 'var(--surface)',
                  cursor: 'pointer', transition: 'all 200ms ease',
                  textAlign: 'left',
                  boxShadow: active ? `0 0 0 1px ${m.color}30, 0 4px 16px ${m.color}20` : 'none',
                }}>
                  {/* Icon */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                    background: active ? `${m.color}25` : 'var(--surface2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${active ? `${m.color}40` : 'var(--border)'}`,
                  }}>
                    <Icon size={16} color={active ? m.color : 'var(--muted)'} />
                  </div>
                  {/* Labels */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: active ? m.color : 'var(--text)', lineHeight: 1.2 }}>{m.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{m.sub}</div>
                  </div>
                  {/* Free badge */}
                  {m.free && (
                    <span style={{
                      marginLeft: 'auto', flexShrink: 0,
                      fontFamily: 'var(--font-mono)', fontSize: '9px',
                      padding: '2px 6px', borderRadius: '4px',
                      background: 'rgba(16,185,129,0.1)',
                      color: '#10b981',
                      border: '1px solid rgba(16,185,129,0.25)',
                    }}>FREE</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error with switch suggestions */}
        {error && (
          <div style={{ borderRadius: '12px', marginBottom: '24px', overflow: 'hidden', border: '1px solid rgba(239,68,68,0.25)' }}>
            <div style={{ padding: '14px 16px', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontFamily: 'var(--font-mono)', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0 }}>⚠</span>
              <span>{error}</span>
            </div>
            {isKeyError && (
              <div style={{ padding: '14px 16px', background: 'var(--surface)', borderTop: '1px solid rgba(239,68,68,0.15)' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>
                  Switch to another model or get a free API key:
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {otherModels.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button key={m.id} onClick={() => switchModel(m.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        padding: '8px 14px', borderRadius: '8px',
                        background: `${m.color}15`, color: m.color,
                        border: `1px solid ${m.color}35`,
                        fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                        transition: 'all var(--transition)',
                      }}>
                        <Icon size={13} color={m.color} />
                        Use {m.label}
                        {m.free && <span style={{ fontSize: '10px', opacity: 0.8, fontFamily: 'var(--font-mono)' }}>· free</span>}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted2)', marginTop: '10px' }}>
                  Get a free key at&nbsp;
                  <a href={`https://${activeModel.getKey}`} target="_blank" rel="noopener noreferrer" style={{ color: activeModel.color }}>
                    {activeModel.getKey}
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* History panel */}
        {showHistory && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '12px', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label" style={{ color: 'var(--ai)' }}>Generation History</span>
              {history.length > 0 && (
                <button onClick={() => { setHistory([]); try { localStorage.removeItem(HISTORY_KEY); } catch {} }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
                  <Icons.Trash size={12} color="currentColor" /> Clear all
                </button>
              )}
            </div>
            {history.length === 0
              ? <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>No history yet.</div>
              : (
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {history.map((entry, i) => {
                    const hModel = MODELS.find(m => m.id === entry.model);
                    return (
                      <button key={i} onClick={() => restoreEntry(entry)} style={{
                        width: '100%', textAlign: 'left', padding: '14px 16px',
                        background: 'none', border: 'none',
                        borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--surface2)', color: 'var(--ai)', border: '1px solid var(--border2)' }}>{entry.type}</span>
                          {hModel && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: `${hModel.color}15`, color: hModel.color, border: `1px solid ${hModel.color}30` }}>{hModel.label}</span>
                          )}
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted2)' }}>{new Date(entry.ts).toLocaleTimeString()}</span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.prompt}</p>
                      </button>
                    );
                  })}
                </div>
              )
            }
          </div>
        )}

        {/* Templates */}
        <div style={{ marginBottom: '24px' }}>
          <span className="label" style={{ display: 'block', marginBottom: '10px' }}>Quick Templates</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {TEMPLATES.map((t) => (
              <button key={t.label} onClick={() => setPrompt(t.prompt)} style={{
                padding: '6px 13px', borderRadius: '6px',
                background: 'var(--surface)', color: 'var(--muted)',
                border: '1px solid var(--border)', fontSize: '12px',
                cursor: 'pointer', transition: 'all var(--transition)',
                fontFamily: 'var(--font-mono)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = activeModel.color; e.currentTarget.style.color = activeModel.color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
              >{t.label}</button>
            ))}
          </div>
        </div>

        {/* Type + Tone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <span className="label" style={{ display: 'block', marginBottom: '10px' }}>Content Type</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {TYPES.map((t) => (
                <button key={t.id} onClick={() => setType(t.id)} style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                  cursor: 'pointer', transition: 'all var(--transition)',
                  background: type === t.id ? activeModel.color : 'var(--surface)',
                  color: type === t.id ? '#fff' : 'var(--muted)',
                  border: `1px solid ${type === t.id ? activeModel.color : 'var(--border)'}`,
                }}>{t.label}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="label" style={{ display: 'block', marginBottom: '10px' }}>Tone</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {TONES.map((t) => (
                <button key={t.id} onClick={() => setTone(t.id)} style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                  cursor: 'pointer', transition: 'all var(--transition)',
                  background: tone === t.id ? 'var(--surface2)' : 'var(--surface)',
                  color: tone === t.id ? activeModel.color : 'var(--muted)',
                  border: `1px solid ${tone === t.id ? 'var(--border2)' : 'var(--border)'}`,
                }}>{t.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Prompt */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask ${activeModel.label} to write something...`}
            rows={5}
            style={{
              width: '100%', padding: '16px',
              background: 'var(--surface)', color: 'var(--text)',
              border: '1px solid var(--border2)', borderRadius: '12px',
              fontSize: '14px', lineHeight: '1.6', resize: 'vertical', outline: 'none',
              transition: 'border-color var(--transition)',
            }}
            onFocus={e => e.target.style.borderColor = activeModel.color}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'}
          />
          <span style={{ position: 'absolute', bottom: '12px', right: '14px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted2)' }}>{prompt.length}</span>
        </div>

        {/* Generate button */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
          <button onClick={handleGenerate} disabled={loading || !prompt.trim()} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 28px', borderRadius: '8px',
            background: loading || !prompt.trim() ? 'var(--surface2)' : activeModel.color,
            color: loading || !prompt.trim() ? 'var(--muted)' : '#fff',
            border: 'none', fontWeight: '700', fontSize: '14px', letterSpacing: '0.03em',
            cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition)',
            boxShadow: !loading && prompt.trim() ? `0 4px 20px ${activeModel.color}40` : 'none',
          }}>
            {loading
              ? <Icons.Loader size={16} color="currentColor" />
              : <ModelIcon size={16} color="#fff" />
            }
            {loading ? `${activeModel.label} is thinking...` : `Generate with ${activeModel.label}`}
          </button>
          {prompt && (
            <button onClick={() => { setPrompt(''); setResult(''); setError(''); }} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '12px 16px', borderRadius: '8px',
              background: 'none', color: 'var(--muted)',
              border: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px',
            }}>
              <Icons.Trash size={14} color="currentColor" />Clear
            </button>
          )}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted2)', marginLeft: 'auto' }}>⌘ Enter</span>
        </div>

        {/* Result */}
        {result && (
          <div style={{ background: 'var(--surface)', border: `1px solid ${usedModel?.color}30 `, borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="label">Output</span>
                {usedModel && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: `${usedModel.color}15`, color: usedModel.color, border: `1px solid ${usedModel.color}30` }}>
                    <UsedIcon size={10} color={usedModel.color} />
                    {usedModel.label} · {usedModel.sub}
                  </span>
                )}
              </div>
              <button onClick={handleCopy} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px', borderRadius: '6px',
                background: 'var(--surface2)', color: copied ? usedModel?.color : 'var(--muted)',
                border: '1px solid var(--border)', cursor: 'pointer',
                fontSize: '12px', fontFamily: 'var(--font-mono)',
                transition: 'all var(--transition)',
              }}>
                {copied ? <Icons.Check size={13} color="currentColor" /> : <Icons.Copy size={13} color="currentColor" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {stats && (
              <div style={{ display: 'flex', gap: '20px', padding: '10px 16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                {[
                  { label: 'Words',     value: stats.words },
                  { label: 'Chars',     value: stats.chars },
                  { label: 'Sentences', value: stats.sentences },
                  { label: 'Read time', value: `~${stats.readingTime} min` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="label">{label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: usedModel?.color, fontWeight: '700' }}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            <pre style={{
              padding: '20px', margin: 0,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              fontFamily: 'var(--font-mono)', fontSize: '13px',
              lineHeight: '1.75', color: 'var(--text)',
              maxHeight: '500px', overflowY: 'auto',
            }}>{result}</pre>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
