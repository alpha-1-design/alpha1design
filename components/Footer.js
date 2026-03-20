import Icons from './Icons';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '32px 24px',
      marginTop: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icons.Logo size={20} color="var(--muted)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>
          Alpha-1 Design &copy; {new Date().getFullYear()}
        </span>
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted2)', letterSpacing: '0.08em' }}>
        PWA — OFFLINE READY
      </span>
    </footer>
  );
}
