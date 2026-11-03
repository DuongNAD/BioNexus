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
  /** Id loài trong DB nếu đã biết (chỉ để tạo link). Marker được nhận diện bằng scientificName */
  speciesId?: number;
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
  selectedScientificName?: string;
  onSelectSpecies?: (scientificName: string) => void;
  /** mini: chỉ vẽ loài đang chọn, không tooltip */
  variant?: 'full' | 'mini';
  interactive?: boolean;
  className?: string;
}
