interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export default function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="px-5 sm:px-6 pt-32 pb-12 md:pt-40 md:pb-16 bg-midnight grain-overlay">
      <div className="max-w-6xl mx-auto">
        <p className="text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-gold-500 mb-4 uppercase">
          {eyebrow}
        </p>
        <h1 className="font-serif text-4xl md:text-6xl text-parchment-100 leading-tight max-w-4xl">
          {title}
        </h1>
        <div className="w-14 h-px bg-gold-500/60 my-6" />
        <p className="text-parchment-400 text-sm md:text-base leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>
    </section>
  );
}
