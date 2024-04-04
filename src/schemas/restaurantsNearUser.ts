import * as z from "zod";

// export const RestaurantsNewarUser = z
//   .object({
//     id: z.string().uuid(),
//     name: z.string().min(1),
//     coverImage: z.string().nullable(),
//     logoImage: z.string().nullable(),
//     description: z.string().nullable(),
//     affordability: z.number().nullable(),
//     latitude: z.string().min(1),
//     longitude: z.string().min(1),
//     addressLine: z.string().min(1),
//     distanceKm: z.number().positive(),
//   })
//   .strict();

const RestaurantsNearUser = z.array(
  z
    .object({
      id: z.string().uuid(),
      name: z.string().min(1),
      coverImage: z.string().nullable(),
      logoImage: z.string().nullable(),
      description: z.string().nullable(),
      affordability: z.number().nullable(),
      latitude: z.string().min(1),
      longitude: z.string().min(1),
      addressLine: z.string().min(1),
      distanceKm: z.number().positive(),
    })
    .strict()
);

export default RestaurantsNearUser;