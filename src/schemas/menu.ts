import * as z from "zod";

const toNumber = z.number().or(z.string()).pipe(z.coerce.number());
const PriceSchema = toNumber.refine(
  (value) => value == parseFloat(value.toFixed(2)) && value >= 0
);

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

export const MenuItemReq = z
  .object({
    restaurantId: z.string().uuid(),
    itemId: z.string().uuid(),
  })
  .strict();
