export interface RestaurantNearUser {
  id: string;
  name: string;
  coverImage: string | null;
  logoImage: string | null;
  description: string | null;
  affordability: number | null;
  latitude: string;
  longitude: string;
  addressLine: string;
  distanceKm: number;
}

// Type that extends RestaurantNearUser but modifies distanceKm
export interface ProcessedRestaurantElement
  extends Omit<RestaurantNearUser, "distanceKm"> {
  distanceKm: string;
}
