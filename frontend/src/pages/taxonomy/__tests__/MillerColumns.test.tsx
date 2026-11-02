import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { TaxonColumn } from '../components/TaxonColumn';
import { TaxonRow } from '../components/TaxonRow';
import { SpeciesColumn } from '../components/SpeciesColumn';
import { normalizeBreadcrumbs } from '@/components/domain/TaxonPath';
import { SEED_TAXONOMY } from '@/mocks/data/taxonomy';
import { SEED_SPECIES } from '@/mocks/data/species';
import type { TaxonomyNodeDto } from '@/types/api';

describe('Miller Columns Hierarchy & Nomenclature', () => {
  it('UT-TAX-01: Cột gốc hiển thị chính xác 2 Giới gốc: Animalia và Plantae', () => {
    const rootKingdoms = SEED_TAXONOMY.filter((n) => n.parentId === null);
    expect(rootKingdoms).toHaveLength(2);
    expect(rootKingdoms.map((k) => k.scientificName)).toEqual(['Animalia', 'Plantae']);

    render(
      <MemoryRouter>
        <TaxonColumn
          rank="KINGDOM"
          title="Giới · KINGDOM"
          items={rootKingdoms}
          selectedId={1}
          onSelect={() => {}}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Animalia')).toBeInTheDocument();
    expect(screen.getByText('Plantae')).toBeInTheDocument();
  });

  it('UT-TAX-02: Chọn Giới Animalia (ID 1) có con là Chordata (Ngành Dây sống)', () => {
    const phyla = SEED_TAXONOMY.filter((n) => n.parentId === 1);
    expect(phyla).toHaveLength(1);
    expect(phyla[0]?.scientificName).toBe('Chordata');
  });

  it('UT-TAX-03: Duyệt tới Bộ Squamata (ID 8) chứa đúng 3 Họ: Pythonidae, Eublepharidae, Agamidae', () => {
    const squamataFamilies = SEED_TAXONOMY.filter((n) => n.parentId === 8);
    expect(squamataFamilies).toHaveLength(3);
    const familyNames = squamataFamilies.map((f) => f.scientificName);
    expect(familyNames).toContain('Pythonidae');
    expect(familyNames).toContain('Eublepharidae');
    expect(familyNames).toContain('Agamidae');
  });

  it('UT-TAX-04: Duyệt tiếp tới Chi Python (ID 20) hiển thị đúng 2 loài sinh vật: Python regius và Python bivittatus', () => {
    const pythonSpecies = SEED_SPECIES.filter((s) => s.nodeId === 20);
    expect(pythonSpecies).toHaveLength(2);
    expect(pythonSpecies.map((s) => s.scientificName)).toEqual(['Python regius', 'Python bivittatus']);

    render(
      <MemoryRouter>
        <SpeciesColumn
          genusName="Python"
          speciesList={pythonSpecies}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Python regius/i)).toBeInTheDocument();
    expect(screen.getByText(/Python bivittatus/i)).toBeInTheDocument();
  });

  it('UT-TAX-05: Kiểm tra quy tắc danh pháp sinh học (In nghiêng chỉ ở Chi và Loài)', () => {
    const genusNode = SEED_TAXONOMY.find((n) => n.rank === 'GENUS')!;
    const orderNode = SEED_TAXONOMY.find((n) => n.rank === 'ORDER')!;

    const { container: genusContainer } = render(
      <TaxonRow node={genusNode} isSelected={false} onSelect={() => {}} />
    );
    const genusNameEl = genusContainer.querySelector('p');
    expect(genusNameEl?.className).toContain('italic');

    const { container: orderContainer } = render(
      <TaxonRow node={orderNode} isSelected={false} onSelect={() => {}} />
    );
    const orderNameEl = orderContainer.querySelector('p');
    expect(orderNameEl?.className).not.toContain('italic');
  });

  it('UT-TAX-06: Thuật toán lọc trùng Breadcrumbs loại bỏ lặp nút hiện tại', () => {
    const pythonNode: TaxonomyNodeDto = {
      id: 20,
      parentId: 13,
      rank: 'GENUS',
      rankLevel: 'GENUS',
      scientificName: 'Python',
      commonName: 'Chi Trăn hoa',
    };

    const rawWithDuplicate: TaxonomyNodeDto[] = [
      { id: 1, parentId: null, rank: 'KINGDOM', rankLevel: 'KINGDOM', scientificName: 'Animalia', commonName: 'Giới Động vật' },
      { id: 20, parentId: 13, rank: 'GENUS', rankLevel: 'GENUS', scientificName: 'Python', commonName: 'Chi Trăn hoa' },
    ];

    const deduplicated = normalizeBreadcrumbs(rawWithDuplicate, pythonNode);
    expect(deduplicated).toHaveLength(2);
    expect(deduplicated[1]?.id).toBe(20);
  });
});
