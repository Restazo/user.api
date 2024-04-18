import * as z from "zod";

import { MenuSchema } from "./menu.js";

export const AddressSchema = z.object({
  addressLine: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  countryCode: z.string().min(1),
});

export const ExtendedAddressSchema = AddressSchema.extend({
  latitude: z.string().min(1),
  longitude: z.string().min(1),
  distanceKm: z.string().min(1),
});

export const RawExtendedAddressSchema = AddressSchema.extend({
  latitude: z.string().min(1),
  longitude: z.string().min(1),
  distanceKm: z.number().min(0),
});

// Restaurant Overview Schemas

export const RestaurantOverviewBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  affordability: z.number(),
  logoImage: z.string().nullable(),
  coverImage: z.string().nullable(),
});

export const RestaurantOverviewReqSchema = z.object({
  restaurantId: z.string().uuid(),
});

export const RestaurantOverviewResSchema = z.object({
  restaurant: RestaurantOverviewBaseSchema.extend({
    address: ExtendedAddressSchema,
    menu: MenuSchema,
  }),
});

export const restaurantsNearYouReq = z
  .object({
    user_lat: z.string().optional(),
    user_lon: z.string().optional(),
    range_km: z.string().optional(),
  })
  .strict();

export const RestaurantsNearUser = z.array(
  z
    .object({
      id: z.string().uuid(),
      name: z.string().min(1),
      coverImage: z.string().nullable(),
      logoImage: z.string().nullable(),
      description: z.string().nullable(),
      affordability: z.number(),
      latitude: z.string().min(1),
      longitude: z.string().min(1),
      addressLine: z.string().min(1),
      distanceKm: z.number().min(0),
    })
    .strict()
);

export const restaurantOverviewQueryParamsSchema = z
  .object({
    user_lat: z.string().optional(),
    user_lon: z.string().optional(),
  })
  .strict();
