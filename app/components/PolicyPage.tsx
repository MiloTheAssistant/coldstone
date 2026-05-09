import PageIntro from './PageIntro';

interface PolicySection {
  title: string;
  body: string;
}

interface PolicyPageProps {
  eyebrow: string;
  title: string;
  description: string;
  sections: PolicySection[];
}

export default function PolicyPage({ eyebrow, title, description, sections }: PolicyPageProps) {
  return (
    <div className="min-h-screen bg-midnight">
      <PageIntro eyebrow={eyebrow} title={title} description={description} />
      <main className="px-5 sm:px-6 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="border border-gold-500/15 bg-navy-900/60 p-5 sm:p-7">
              <h2 className="font-serif text-xl text-parchment-100 mb-3">{section.title}</h2>
              <p className="text-sm leading-relaxed text-parchment-400">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
