export function Skeleton({ width, height, borderRadius = 8, style = {} }) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, var(--surface2) 0%, var(--border) 50%, var(--surface2) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
      ...style,
    }} />
  );
}

export function CardSkeleton() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Skeleton width={80} height={14} />
        <Skeleton width={40} height={14} />
      </div>
      <Skeleton width="100%" height={8} style={{ marginBottom: 8 }} />
      <Skeleton width="70%" height={8} />
    </div>
  );
}

export function TextSkeleton({ lines = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} height={12} />
      ))}
    </div>
  );
}

export function ImageSkeleton() {
  return (
    <div style={{ background: 'var(--surface2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
      <Skeleton width={100} height={100} borderRadius="50%" />
    </div>
  );
}

export function ButtonSkeleton({ width = 120 }) {
  return <Skeleton width={width} height={40} borderRadius={8} />;
}

export default Skeleton;