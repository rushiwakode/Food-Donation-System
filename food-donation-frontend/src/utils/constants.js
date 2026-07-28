export const DONATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  CLAIMED: 'CLAIMED',
  PICKED_UP: 'PICKED_UP',
  DELIVERED: 'DELIVERED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
};

export const STATUS_COLORS = {
  PENDING: 'warning',
  APPROVED: 'info',
  CLAIMED: 'purple',
  PICKED_UP: 'purple',
  DELIVERED: 'success',
  EXPIRED: 'neutral',
  CANCELLED: 'neutral',
  REJECTED: 'danger',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  DONOR: 'DONOR',
  NGO: 'NGO',
  DELIVERY_AGENT: 'DELIVERY_AGENT',
};

export const FOOD_TYPES = ['VEG', 'NON_VEG', 'VEGAN', 'MIXED'];
export const QUANTITY_UNITS = ['SERVINGS', 'KG', 'PACKETS', 'BOXES', 'LITERS'];
export const DONOR_TYPES = ['RESTAURANT', 'HOTEL', 'SUPERMARKET', 'CATERER', 'EVENT_ORGANIZER', 'INDIVIDUAL', 'OTHER'];
export const VEHICLE_TYPES = ['BIKE', 'CAR', 'VAN', 'CYCLE', 'WALK'];
