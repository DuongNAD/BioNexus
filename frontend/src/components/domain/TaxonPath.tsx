import React from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import type { TaxonomyNodeDto } from '@/types/api';
import { cn } from '@/lib/cn';

export interface TaxonPathProps {
  breadcrumbs?: TaxonomyNodeDto[];
  currentNode?: TaxonomyNodeDto;
  className?: string;
  linkable?: boolean;
}

/**
 * Deduplicate breadcrumbs by id while preserving genealogical order
 */
export function normalizeBreadcrumbs(
  rawBreadcrumbs: TaxonomyNodeDto[] | undefined,
  currentNode: TaxonomyNodeDto | undefined
): TaxonomyNodeDto[] {
  const list = rawBreadcrumbs ? [...rawBreadcrumbs] : [];

  if (currentNode && !list.some((item) => item.id === currentNode.id)) {
    list.push(currentNode);
  }

  const seen = new Set<number>();
  const deduplicated: TaxonomyNodeDto[] = [];

  for (const node of list) {
    if (!seen.has(node.id)) {
      seen.add(node.id);
      deduplicated.push(node);
    }
  }

  return deduplicated;
}

export const TaxonPath: React.FC<TaxonPathProps> = ({
  breadcrumbs = [],
  currentNode,
  className = '',
  linkable = true,
}) => {
  const nodes = normalizeBreadcrumbs(breadcrumbs, currentNode);

  if (nodes.length === 0) return null;

  return (
    <nav aria-label="Đường dẫn phân loại" className={cn('flex flex-wrap items-center gap-1.5 text-xs', className)}>
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;
        const rank = node.rankLevel || node.rank;
        const isItalic = rank === 'GENUS';

        const content = (
          <span
            className={cn(
              isItalic ? 'font-serif italic' : 'font-sans',
              isLast ? 'text-accent font-semibold' : 'text-fg-3 hover:text-accent transition-colors'
            )}
          >
            {node.scientificName}
          </span>
        );

        return (
          <React.Fragment key={node.id}>
            {index > 0 && <ChevronRight className="size-3 text-fg-mute shrink-0" aria-hidden="true" />}
            {linkable && !isLast ? (
              <Link
                to={`/taxonomy/${node.id}`}
                className="hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
                title={`${rank || ''}: ${node.scientificName} (${node.commonName})`}
              >
                {content}
              </Link>
            ) : (
              content
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
