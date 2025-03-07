export interface Sacrament {
  id: number;
  name: string;
  type: string;
  strain: string;
  description: string;
  num_storage: number;
  num_active: number;
  suggested_donation: number;
  low_inventory_threshold: number;
  total_inventory: number;
}

export interface SacramentFormData {
  name: string;
  type: string;
  strain: string;
  description: string;
  numStorage: number;
  suggestedDonation: number;
  lowInventoryThreshold: number;
}