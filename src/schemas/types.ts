import * as z from "zod";

import {
  MenuSchema,
  ExtendedAddressSchema,
  AddressSchema,
  RestaurantOverviewBaseSchema,
} from "./schemas.js";

export type Menu = z.infer<typeof MenuSchema>;

export type Address = z.infer<typeof AddressSchema>;

export type Restaurant = z.infer<typeof RestaurantOverviewBaseSchema>;

export type ExtendedAddress = z.infer<typeof ExtendedAddressSchema>;
