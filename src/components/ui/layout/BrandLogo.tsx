import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
  href?: string;
}

/** The supplied wordmark is kept intact, with its original 2048:682 ratio. */
export function BrandLogo({ className = '', priority = false, href = '/' }: BrandLogoProps) {
  return (
    <Link href={href} className={`brand-logo ${className}`} aria-label="SparkClean">
      <Image src="/brand/sparkclean-logo.png" alt="SparkClean" width={2048} height={682} priority={priority} sizes="(max-width: 767px) 156px, 224px" />
    </Link>
  );
}
