import { Coords } from "../schemas/types/restaurant.js";

// returns true if within range
export const compareDistance = (
  userCoords: Coords,
  restaurantCoords: Coords,
  validRange?: number
): boolean => {
  let range = 300; // in meters
  if (validRange) {
    range = validRange;
  }
  const R = 6371 * 1000;
  const dLat = degToRad(restaurantCoords.latitude - userCoords.latitude); // deg2rad below
  const dLon = degToRad(restaurantCoords.longitude - userCoords.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(userCoords.latitude)) *
      Math.cos(degToRad(restaurantCoords.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in m
  return distance <= range;
};

const degToRad = (deg: number) => {
  return deg * (Math.PI / 180);
};
