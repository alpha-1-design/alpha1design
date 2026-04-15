import { useState, useEffect } from 'react';
import Icons from './Icons';

const MODEL_INFO = {
  claude: {
    name: 'Claude',
    provider: 'Anthropic',
    url: 'https://console.anthropic.com/',
    keyName: 'ANTHROPIC_API_KEY',
    placeholder: 'sk-ant-...',
    description: 'Best for complex writing, coding, and analysis',
  },
  gemini: {
    name: 'Gemini',
    provider: 'Google',
    url: 'https://aistudio.google.com/app/apikey',
    keyName: 'GEMINI_API_KEY',
    placeholder: 'AIza...',
    description: 'Great for creative tasks and multimodal',
  },
  mistral: {
    name: 'Mistral',
    provider: 'Mistral AI',
    url: 'https://console.mistral.ai/',
    keyName: 'MISTRAL_API_KEY',
    placeholder: 'p_...',
    description: 'Fast and efficient, great for European users',
  },
  groq: {
    name: 'Groq',
    provider: 'Groq (Free)',
    url: 'https://console.groq.com/',
    keyName: 'GROQ_API_KEY',
    placeholder: 'gsk_...',
    description: 'Fastest AI - Llama 3.3 70B (Free for all users)',
    isFree: true,
    serverSide: true,
  },
};

const KEY_STORAGE_KEYS = {
  claude: 'a1d-claude-key',
  gemini: 'a1d-gemini-key',
  mistral: 'a1d-mistral-key',
};

export default function ApiKeyManager({ onClose, autoOpenFor = null, onSave }) {
  const [keys, setKeys] = useState({});
  const [inputs, setInputs] = useState({});
  const [showKey, setShowKey] = useState({});
  const [testing, setTesting] = useState(null);
  const [testResult, setTestResult] = useState({});
  const [activeTab, setActiveTab] = useState(autoOpenFor || 'claude');

  useEffect(() => {
    try {
      const loaded = {};
      Object.entries(KEY_STORAGE_KEYS).forEach(([id, key]) => {
        const val = localStorage.getItem(key);
        if (val) loaded[id] = val;
      });
      setKeys(loaded);
    } catch {}
  }, []);

  const saveKey = (modelId) => {
    const key = inputs[modelId]?.trim();
    if (!key) return;
    const storageKey = KEY_STORAGE_KEYS[modelId];
    setKeys({ ...keys, [modelId]: key });
    try { localStorage.setItem(storageKey, key); } catch {}
    setInputs({ ...inputs, [modelId]: '' });
    if (onSave) onSave(modelId, key);
  };

  const deleteKey = (modelId) => {
    const updated = { ...keys };
    delete updated[modelId];
    setKeys(updated);
    setTestResult({ ...testResult, [modelId]: null });
    try { localStorage.removeItem(KEY_STORAGE_KEYS[modelId]); } catch {}
  };

  const testKey = async (modelId) => {
    setTesting(modelId);
    setTestResult({ ...testResult, [modelId]: 'testing' });
    
    const key = keys[modelId];
    let success = false;
    let errorMsg = '';
    const endpointMap = { claude: '/api/generate', gemini: '/api/gemini', mistral: '/api/mistral', groq: '/api/groq' };
    
    try {
      const res = await fetch(endpointMap[modelId], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Say "OK"', type: 'free', tone: 'professional', apiKey: key }),
      });
      if (res.ok) success = true;
      else {
        const err = await res.json();
        errorMsg = err.error || 'Invalid key';
      }
    } catch (e) {
      errorMsg = e.message;
    }
    
    setTestResult({ ...testResult, [modelId]: success ? 'valid' : errorMsg });
    setTesting(null);
  };

  const models = Object.entries(MODEL_INFO);
  const hasKey = (id) => !!keys[id];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
              API Keys
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Your keys are stored locally in your browser
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
          }}>
            <Icons.X size={20} color="var(--muted)" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', padding: '12px 16px',
          borderBottom: '1px solid var(--border)', overflowX: 'auto',
        }}>
          {models.map(([id, info]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
              background: activeTab === id ? 'var(--surface2)' : 'transparent',
              color: activeTab === id ? 'var(--text)' : 'var(--muted)',
              border: `1px solid ${activeTab === id ? 'var(--border2)' : 'transparent'}`,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 150ms ease',
            }}>
              {info.name}
              {info.isFree && <span style={{ marginLeft: '4px', fontSize: '9px', color: 'var(--img)' }}>FREE</span>}
              {hasKey(id) && <span style={{ marginLeft: '4px', color: 'var(--ai)' }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
          {(() => {
            const info = MODEL_INFO[activeTab];
            const key = keys[activeTab];
            const testingThis = testing === activeTab;
            const result = testResult[activeTab];
            
            return (
              <div>
                <div style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '16px', marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{info.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      {info.provider}
                    </span>
                    {info.isFree && (
                      <span style={{
                        fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                        background: 'rgba(16,185,129,0.15)', color: 'var(--img)',
                        fontFamily: 'var(--font-mono)',
                      }}>FREE</span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
                    {info.description}
                  </p>
                  <a href={info.url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '12px', color: 'var(--ai)', textDecoration: 'none',
                  }}>
                    Get API Key <Icons.ChevronRight size={12} color="var(--ai)" />
                  </a>
                </div>

                {!info.isFree && (
                  <>
                    {key ? (
                      <div style={{
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                        borderRadius: '12px', padding: '16px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Saved Key</span>
                          <button onClick={() => deleteKey(activeTab)} style={{
                            background: 'none', border: 'none', color: '#f87171',
                            fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                          }}>
                            <Icons.Trash size={12} color="#f87171" /> Remove
                          </button>
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px',
                          fontFamily: 'var(--font-mono)', fontSize: '13px',
                        }}>
                          <span style={{ flex: 1, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {showKey[activeTab] ? key : '•'.repeat(24)}
                          </span>
                          <button onClick={() => setShowKey({ ...showKey, [activeTab]: !showKey[activeTab] })} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                          }}>
                            {showKey[activeTab] ? <Icons.Eye size={16} color="var(--muted)" /> : <Icons.EyeOff size={16} color="var(--muted)" />}
                          </button>
                        </div>
                        
                        {result && (
                          <div style={{
                            marginTop: '12px', padding: '10px', borderRadius: '8px',
                            background: result === 'valid' ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
                            border: `1px solid ${result === 'valid' ? 'rgba(16,185,129,0.3)' : 'rgba(248,113,113,0.3)'}`,
                          }}>
                            {result === 'valid' ? (
                              <span style={{ color: 'var(--img)', fontSize: '12px' }}>✓ Key is valid and working</span>
                            ) : result === 'testing' ? (
                              <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Testing key...</span>
                            ) : (
                              <span style={{ color: '#f87171', fontSize: '12px' }}>⚠ {result}</span>
                            )}
                          </div>
                        )}
                        
                        <button onClick={() => testKey(activeTab)} disabled={testingThis} style={{
                          width: '100%', marginTop: '12px', padding: '10px', borderRadius: '8px',
                          background: testingThis ? 'var(--surface)' : 'var(--surface2)',
                          color: testingThis ? 'var(--muted)' : 'var(--text)',
                          border: '1px solid var(--border)', fontSize: '12px', fontWeight: '600',
                          cursor: testingThis ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}>
                          {testingThis ? <Icons.Loader size={14} color="var(--muted)" /> : <Icons.Check size={14} color="currentColor" />}
                          Test Key
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          value={inputs[activeTab] || ''}
                          onChange={(e) => setInputs({ ...inputs, [activeTab]: e.target.value })}
                          placeholder={info.placeholder}
                          style={{
                            width: '100%', padding: '14px', borderRadius: '10px',
                            background: 'var(--surface2)', color: 'var(--text)',
                            border: '1px solid var(--border2)', fontSize: '13px',
                            fontFamily: 'var(--font-mono)', outline: 'none', marginBottom: '12px',
                          }}
                        />
                        <button onClick={() => saveKey(activeTab)} disabled={!inputs[activeTab]?.trim()} style={{
                          width: '100%', padding: '12px', borderRadius: '10px',
                          background: inputs[activeTab]?.trim() ? 'var(--ai)' : 'var(--surface2)',
                          color: inputs[activeTab]?.trim() ? '#fff' : 'var(--muted)',
                          border: 'none', fontSize: '13px', fontWeight: '700',
                          cursor: inputs[activeTab]?.trim() ? 'pointer' : 'not-allowed',
                        }}>
                          Save {info.name} Key
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                {info.isFree && (
                  <div style={{
                    padding: '20px', borderRadius: '12px', textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(99,102,241,0.1))',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}>
                    <Icons.Check size={32} color="var(--img)" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Groq is Free!</p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      No API key needed. Groq (Llama 3.3 70B) works out of the box.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--muted2)', fontFamily: 'var(--font-mono)' }}>
            Keys stored locally in browser
          </span>
          <button onClick={onClose} style={{
            padding: '8px 20px', borderRadius: '8px', background: 'var(--surface2)',
            color: 'var(--text)', border: '1px solid var(--border)', fontSize: '13px',
            fontWeight: '600', cursor: 'pointer',
          }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export function getApiKey(modelId) {
  const key = KEY_STORAGE_KEYS[modelId];
  return key ? localStorage.getItem(key) : null;
}

export function hasApiKey(modelId) {
  const key = KEY_STORAGE_KEYS[modelId];
  return key ? !!localStorage.getItem(key) : false;
}