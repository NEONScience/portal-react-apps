import { DataProduct, Site } from '../types/store';

export interface AvailableDateRange {
  start: string;
  end: string;
}

const computeDateRange = (data: Record<string, unknown>[]): AvailableDateRange => {
  const result: Array<string|null> = (data || [])
    .reduce((acc: Array<string|null>, datum: Record<string, unknown>): Array<string|null> => {
      const months = datum.availableMonths as string[];
      const first = months[0];
      const last = months[months.length - 1];
      if (acc[0] === null || acc[0] > first) { acc[0] = first; }
      if (acc[1] === null || acc[1] < last) { acc[1] = last; }
      return acc;
    }, [null, null]);
  return {
    start: result[0] || '',
    end: result[1] || '',
  };
};

export const computeAvailableDateRange = (product: DataProduct): AvailableDateRange => (
  computeDateRange(product.siteCodes)
);

export const computeAvailableDateRangeSite = (site: Site): AvailableDateRange => (
  computeDateRange(site.dataProducts)
);
