import type { ConservationStatus } from '@/types/api';

export interface GeoCoordinate {
  lat: number;
  lng: number;
  place: string;
}

export interface BreedingHub {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  shopName: string;
  shopStatus: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'BANNED';
  specialty: string;
}

export interface SpeciesBioMarker {
  speciesId: number;
  scientificName: string;
  commonName: string;
  displayName: string;
  conservationStatus: ConservationStatus;
  group: 'Bò sát' | 'Lưỡng cư' | 'Cây ăn thịt' | 'Khác';
  origin: GeoCoordinate;
  hubId: string;
  heroPhoto: string;
  hasActiveProduct: boolean;
}

export interface BioEarthProps {
  speciesList?: SpeciesBioMarker[];
  breedingHubs?: BreedingHub[];
  selectedSpeciesId?: number;
  onSelectSpecies?: (speciesId: number) => void;
  variant?: 'full' | 'mini';
  interactive?: boolean;
  className?: string;
}
