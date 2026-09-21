/**
 * Category data model and associated payload types
 */

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
  isActive: boolean;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
  isActive?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
  color?: string;
  backgroundColor?: string;
  isActive?: boolean;
}

export interface CategoryDeleteValidation {
  canDelete: boolean;
  expenseCount: number;
  message?: string;
}

export interface ColorPreset {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
}
