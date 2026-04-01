import { FilterState } from "@/types/filters.types";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateFilters(filters: FilterState): ValidationError[] {
  const errors: ValidationError[] = [];

  if (filters.priceMin && filters.priceMax) {
    if (Number(filters.priceMin) >= Number(filters.priceMax)) {
      errors.push({
        field: "price",
        message: "priceMin must be less than priceMax",
      });
    }
  }

  if (filters.priceMin && Number(filters.priceMin) < 0) {
    errors.push({ field: "priceMin", message: "Price cannot be negative" });
  }

  if (Number(filters.page) < 1) {
    errors.push({ field: "page", message: "Page must be at least 1" });
  }

  return errors;
}