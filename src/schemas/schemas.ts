import * as z from "zod";

export const AddressSchema = z.object({
  address_line: z.string().min(1),
  city: z.string().min(1),
  postal_code: z.string().min(1),
  country_code: z.string().min(1),
});

export const ExtendedAddressSchema = AddressSchema.extend({
  latitude: z.string().min(1),
  longitude: z.string().min(1),
});

export const RestaurantSchema = z.object({
  id: z.string().uuid().min(1),
  businessId: z.string().min(1).uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  affordability: z.number().nullable(),
  logoImage: z.string().nullable(),
  coverImage: z.string().nullable(),
  listed: z.boolean(),
});

export const MenuItemSchema = z.object({
  id: z.string().min(1).uuid(),
  name: z.string().min(1),
  image: z.string().nullable(),
  description: z.string().min(1).nullable(),
  ingredients: z.string().min(1).nullable(),
  priceAmount: z.string().min(1),
  priceCurrency: z.string().min(1),
});

export const MenuSchema = z.array(
  z.object({
    categoryId: z.string().min(1).uuid(),
    categoryLabel: z.string().min(1),
    categoryItems: z.array(MenuItemSchema),
  })
);

// Restaurant Overview Schemas

export const RestaurantOverviewReqSchema = z.object({
  restaurantId: z.string().min(1).uuid(),
});

export const RestaurantOverviewResSchema = z.object({
  restaurant: RestaurantSchema.extend({
    address: ExtendedAddressSchema,
    menu: MenuSchema,
  }),
});
