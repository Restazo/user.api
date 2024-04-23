import { z } from "zod";

import {
  AddressSchema,
  ExtendedAddressSchema,
  RestaurantOverviewBaseSchema,
  CoordsSchema,
} from "../restaurant.js";

import { MenuItemSchema, MenuSchema } from "../menu.js";

export type Menu = z.infer<typeof MenuSchema>;

export type MenuItem = z.infer<typeof MenuItemSchema>;

export type Address = z.infer<typeof AddressSchema>;
export type Coords = z.infer<typeof CoordsSchema>

export type Restaurant = z.infer<typeof RestaurantOverviewBaseSchema>;

export type ExtendedAddress = z.infer<typeof ExtendedAddressSchema>;
