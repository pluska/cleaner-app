import Image from 'next/image';

export type DesignIconName = 'crown' | 'hammer' | 'heart' | 'coins' | 'star' | 'calendar' | 'check' | 'users' | 'sparkles' | 'check-small';

/** Exact local SVG exports from the approved Figma screen. */
export function DesignIcon({ name, className = '' }: { name: DesignIconName; className?: string }) {
  const size = name === 'check-small' ? 16 : 24;
  return <span className={`design-icon ${className}`} aria-hidden="true"><Image src={`/brand/icons/${name}.svg`} alt="" width={size} height={size} loading="eager" unoptimized /></span>;
}
