import React from 'react';

import { FilterState } from "@/types/filters.types";

interface FilterBarProps {
  filters:    FilterState;
  onChange:   (changed: Partial<FilterState>) => void;
  isLoading:  boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  isLoading,
}) => {

  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, priceMin: Number(e.target.value) });
  };

  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, priceMax: Number(e.target.value) });
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="priceMin">Min Price</label>
        <input
          id="priceMin"
          type="number"
          placeholder="Min"
          value={filters.priceMin || ''}
          onChange={handlePriceMinChange}
          disabled={isLoading}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="priceMax">Max Price</label>
        <input
          id="priceMax"
          type="number"
          placeholder="Max"
          value={filters.priceMax || ''}
          onChange={handlePriceMaxChange}
          disabled={isLoading}
        />
      </div>

      {isLoading && <span className="loading">Loading...</span>}
    </div>
  );
};