import { useTheme, THEMES } from '../lib/ThemeContext';

const icons = {
  system:   '◎',
  dark:     '◑',
  midnight: '◉',
  light:    '○',
};

export default function ThemeSwitcher() {
  const { theme, applyTheme } = useTheme();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: 'var(--surface)',
      border: '1px solid var(--border2)',
      borderRadius: '8px',
      padding: '3px',
      gap: '2px',
    }}>
      {Object.values(THEMES).map((t) => (
        <button
          key={t.name}
          onClick={() => applyTheme(t.name)}
          title={t.label}
          style={{
            width: '28px', height: '28px', borderRadius: '6px',
            border: 'none', cursor: 'pointer',
            background: theme === t.name ? 'var(--border2)' : 'transparent',
            color: theme === t.name ? 'var(--text)' : 'var(--muted)',
            fontSize: '14px', lineHeight: 1,
            transition: 'all 150ms ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {icons[t.name]}
        </button>
      ))}
    </div>
  );
}
