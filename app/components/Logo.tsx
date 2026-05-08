import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  variant: 'header' | 'footer' | 'mobile';
  scrolled?: boolean;
}

const lockupClasses = {
  header: 'h-[54px] min-w-[248px] lg:h-[60px] lg:min-w-[270px]',
  footer: 'h-[72px] min-w-[290px]',
};

export default function Logo({ variant, scrolled = false }: LogoProps) {
  if (variant === 'mobile') {
    return (
      <Link
        href="/"
        aria-label="Coldstone Soap Co. home"
        className="inline-flex h-14 w-14 items-center justify-center transition-opacity duration-300 hover:opacity-90"
      >
        <Image
          src="/brand/coldstone-s-badge.svg"
          alt="Coldstone Soap Co. S badge"
          width={56}
          height={56}
          priority
          className={`rounded-full ${scrolled ? 'drop-shadow-none' : 'drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]'}`}
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      aria-label="Coldstone Soap Co. home"
      className={`group inline-flex shrink-0 items-center gap-3 transition-opacity duration-300 hover:opacity-90 ${lockupClasses[variant]}`}
    >
      <Image
        src="/brand/coldstone-s-badge.svg"
        alt=""
        width={58}
        height={58}
        priority={variant === 'header'}
        className="h-11 w-11 rounded-full drop-shadow-[0_10px_22px_rgba(0,0,0,0.5)] lg:h-12 lg:w-12"
      />
      <span className="flex min-w-0 flex-1 flex-col items-center leading-none">
        <span className="font-serif text-[22px] font-bold tracking-[0.24em] text-parchment-100 drop-shadow-[0_2px_0_rgba(0,0,0,0.85)] lg:text-[25px]">COLDSTONE</span>
        <span className="mt-2 flex w-full items-center gap-2 text-center text-[8px] font-semibold tracking-[0.48em] text-stone-300">
          <span className="h-px flex-1 bg-stone-500/40" />
          <span>SOAP CO.</span>
          <span className="h-px flex-1 bg-stone-500/40" />
        </span>
      </span>
    </Link>
  );
}
