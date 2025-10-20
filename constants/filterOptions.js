// Filter options for property search

export const UNIT_TYPES = [
  'Apartments',
  'Attached Villa',
  'Cabins',
  'Chalet',
  'Chalets',
  'Duplex',
  'Duplex Penthouse',
  'Duplex Villa',
  'Fractional Duplex',
  'Fractional Loft',
  'Full Floor',
  'Half Floor',
  'Hotel Apartments',
  'Loft',
  'Mansion',
  'Mansions',
  'Penthouse',
  'Penthouse Loft',
  'Pent Suite Villa',
  'Plot',
  'Plots',
  'Semi-Detached',
  'Sky Duplex',
  'Sky Mansion',
  'Sky Palace',
  'Sky Villa',
  'Suite',
  'Townhouse',
  'Triplex',
  'Villa',
  'Villas',
];

export const UNIT_BEDROOMS = [
  '1 bedroom',
  '2 bedroom',
  '3 bedroom',
  '4 bedroom',
  '5 bedroom',
  '6 bedroom',
  '7 bedroom',
  '8 bedroom',
  '9 bedroom',
  '10 bedroom',
];

export const STATUS_OPTIONS = [
  'Completed',
  'Presale',
  'Under construction',
];

export const SALE_STATUS_OPTIONS = [
  'Presale(EOI)',
  'On sale',
  'Out of stock',
  'Announced',
  'Start of sales',
];

export const PRICE_RANGES = [
  { label: 'Any Price', min: null, max: null },
  { label: 'Under 500K', min: null, max: 500000 },
  { label: '500K - 1M', min: 500000, max: 1000000 },
  { label: '1M - 2M', min: 1000000, max: 2000000 },
  { label: '2M - 3M', min: 2000000, max: 3000000 },
  { label: '3M - 5M', min: 3000000, max: 5000000 },
  { label: '5M - 10M', min: 5000000, max: 10000000 },
  { label: 'Above 10M', min: 10000000, max: null },
];

export const AREA_RANGES = [
  { label: 'Any Area', min: null, max: null },
  { label: 'Under 500 sqft', min: null, max: 500 },
  { label: '500 - 700 sqft', min: 500, max: 700 },
  { label: '700 - 1000 sqft', min: 700, max: 1000 },
  { label: '1000 - 1500 sqft', min: 1000, max: 1500 },
  { label: '1500 - 2000 sqft', min: 1500, max: 2000 },
  { label: '2000 - 3000 sqft', min: 2000, max: 3000 },
  { label: 'Above 3000 sqft', min: 3000, max: null },
];
