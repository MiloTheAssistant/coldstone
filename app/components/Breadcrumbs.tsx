import Link from 'next/link';
import type { BreadcrumbItem } from '../lib/seo';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-[10px] uppercase tracking-[0.24em] text-parchment-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.path}-${item.name}`} className="flex items-center gap-2">
              {index > 0 ? <span className="text-gold-500/40">/</span> : null}
              {isLast ? (
                <span className="text-parchment-300">{item.name}</span>
              ) : (
                <Link href={item.path} className="hover:text-gold-300">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
