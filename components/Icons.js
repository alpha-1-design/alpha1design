// Professional SVG icon set for Alpha-1 Design
// All icons are custom-drawn, 24x24 viewBox

export const Icons = {
  // Brand / Nav
  Logo: ({ size = 32, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill={color} fillOpacity="0.1" />
      <path d="M8 24L16 8L24 24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5 19H21.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="8" r="2" fill={color}/>
    </svg>
  ),

  AI: ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M19 16L19.75 19L22 20L19.75 21L19 24L18.25 21L16 20L18.25 19L19 16Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  ),

  Image: ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="1.5"/>
      <circle cx="8.5" cy="8.5" r="2" stroke={color} strokeWidth="1.5"/>
      <path d="M3 16L8 11L12 15L16 12L21 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Palette: ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-.5c0-.55-.22-1.05-.59-1.41-.36-.36-.59-.86-.59-1.41 0-1.1.9-2 2-2h2.34c2.58 0 4.84-1.84 4.84-4.5C22 6.26 17.52 2 12 2Z" stroke={color} strokeWidth="1.5"/>
      <circle cx="7" cy="12" r="1.5" fill={color}/>
      <circle cx="9" cy="7.5" r="1.5" fill={color}/>
      <circle cx="15" cy="7.5" r="1.5" fill={color}/>
    </svg>
  ),

  Home: ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V10.5Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),

  // AI Writer icons
  Sparkle: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),

  Copy: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M5 15H4C2.9 15 2 14.1 2 13V4C2 2.9 2.9 2 4 2H13C14.1 2 15 2.9 15 4V5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  Check: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12L10 17L20 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Send: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),

  Trash: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 6H21" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 6V4H16V6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="5" y="6" width="14" height="15" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M10 11V17M14 11V17" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  // Image icons
  Upload: ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21 15V19C21 19.55 20.55 20 20 20H4C3.45 20 3 19.55 3 19V15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 8L12 3L7 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 3V15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  Download: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21 15V19C21 19.55 20.55 20 20 20H4C3.45 20 3 19.55 3 19V15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 10L12 15L17 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15V3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  Compress: ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 14H10V20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 10H14V4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 4L21 11" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 21L10 14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  // Color icons
  Refresh: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M23 4V10H17" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 20V14H7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  Lock: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  Unlock: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  Export: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 13V19C18 19.55 17.55 20 17 20H5C4.45 20 4 19.55 4 19V7C4 6.45 4.45 6 5 6H11" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 3H21V9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 14L21 3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  // Loader
  Loader: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="spin">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeOpacity="0.2"/>
      <path d="M12 2A10 10 0 0 1 22 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Install PWA
  Install: ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2" width="14" height="20" rx="3" stroke={color} strokeWidth="1.5"/>
      <path d="M9 13L12 16L15 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8V16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="19" r="1" fill={color}/>
    </svg>
  ),

  ChevronRight: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 18L15 12L9 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  X: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

export default Icons;
