import { z } from "zod";

import {
  AddressSchema,
  ExtendedAddressSchema,
  RestaurantOverviewBaseSchema,
} from "../restaurant.js";

export type Address = z.infer<typeof AddressSchema>;

export type Restaurant = z.infer<typeof RestaurantOverviewBaseSchema>;

export type ExtendedAddress = z.infer<typeof ExtendedAddressSchema>;
