import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Icons from '../../components/Icons';

const shortcuts = [
  { key: '⌘ K', desc: 'Open Command Palette', page: 'All Pages' },
  { key: '⌘ R', desc: 'Randomize color palette', page: 'Color Palette' },
  { key: '⌘ S', desc: 'Save current palette', page: 'Color Palette' },
  { key: '⌘ +', desc: 'Zoom in (image)', page: 'Image Tools' },
  { key: '⌘ -', desc: 'Zoom out (image)', page: 'Image Tools' },
  { key: '⌘ 0', desc: 'Reset zoom', page: 'Image Tools' },
  { key: 'Esc', desc: 'Close modal / Cancel action', page: 'All Pages' },
  { key: 'Enter', desc: 'Confirm / Submit', page: 'All Pages' },
];

export default function KeyboardShortcuts() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head><title>Keyboard Shortcuts — Alpha-1 Design</title></Head>
      <Header />
      <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--clr), transparent)' }} />

      <main style={{ flex: 1, maxWidth: '860px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--surface2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="12" rx="2" stroke="var(--clr)" strokeWidth="1.5"/>
                <path d="M6 10h2m-2 4h2M12 10h2m-2 4h2M18 10h2m-2 4h2" stroke="var(--clr)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="label" style={{ color: 'var(--clr)' }}>05 / KEYBOARD</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 52px)', letterSpacing: '0.04em', lineHeight: 1 }}>SHORTCUTS</h1>
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '6px' }}>
            Speed up your workflow with keyboard shortcuts · Press <kbd style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '4px', padding: '1px 5px', fontSize: '11px' }}>⌘K</kbd> anywhere to open the command palette
          </p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '14px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shortcut</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', borderBottom: '1px solid var(--border)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Page</th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map((item, i) => (
                <tr key={i} style={{ borderBottom: i < shortcuts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: '700' }}>
                    <kbd style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', display: 'inline-block' }}>{item.key}</kbd>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text)' }}>{item.desc}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{item.page}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: '24px', padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
          <span style={{ color: 'var(--text)', fontWeight: '600' }}>Tip:</span> On Windows, use <kbd style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '4px', padding: '1px 5px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>Ctrl</kbd> instead of <kbd style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '4px', padding: '1px 5px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>⌘</kbd> (Command).
        </p>
      </main>
      <Footer />
    </div>
  );
}