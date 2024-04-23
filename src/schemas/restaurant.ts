import * as z from "zod";

import { MenuSchema } from "./menu.js";

const toNumber = z.number().or(z.string()).pipe(z.coerce.number());
const latitude = toNumber.refine((value) => value >= -90 && value <= 90);
const longitude = toNumber.refine((value) => value >= -180 && value <= 180);

export const AddressSchema = z.object({
  addressLine: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  countryCode: z.string().min(1),
});

export const CoordsSchema = z.object({
  latitude: latitude,
  longitude: longitude,
});

export const ExtendedAddressSchema = AddressSchema.merge(CoordsSchema).extend({
  distanceKm: toNumber.transform((value) => parseFloat(value.toFixed(1))),
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
    user_lat: latitude.optional(),
    user_lon: longitude.optional(),
    range_km: toNumber.optional(),
  })
  .strict();

export const RestaurantsNearUser = z.array(
  RestaurantOverviewBaseSchema.merge(CoordsSchema)
    .extend({
      addressLine: z.string().min(1),
      distanceKm: toNumber.transform((value) => parseFloat(value.toFixed(1))),
    })
    .strict()
);

export const restaurantOverviewQueryParamsSchema = z
  .object({
    user_lat: latitude.optional(),
    user_lon: longitude.optional(),
  })
  .strict();
