import * as z from "zod";

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
