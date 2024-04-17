import * as z from "zod";

const toNumber = z.number().or(z.string()).pipe(z.coerce.number());
const PriceSchema = toNumber.refine(
  (value) => value == parseFloat(value.toFixed(2)) && value >= 0
);

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

export const RestaurantOverviewBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  affordability: z.number().nullable(),
  logoImage: z.string().nullable(),
  coverImage: z.string().nullable(),
});

export const MenuItemSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  image: z.string().min(1).nullable(),
  description: z.string().min(1).nullable(),
  ingredients: z.string().min(3),
  priceAmount: PriceSchema,
  priceCurrency: z.enum(["eur", "usd"]),
});

export const MenuSchema = z.array(
  z.object({
    categoryId: z.string().uuid(),
    categoryLabel: z.string().min(1),
    categoryItems: z.array(MenuItemSchema.omit({ categoryId: true })),
  })
);

// Restaurant Overview Schemas

export const RestaurantOverviewReqSchema = z.object({
  restaurantId: z.string().uuid(),
});

export const RestaurantOverviewResSchema = z.object({
  restaurant: RestaurantOverviewBaseSchema.extend({
    address: ExtendedAddressSchema,
    menu: MenuSchema,
  }),
});
