import * as z from "zod";

const MenuItemData = z
  .object({
    id: z.string().min(1).uuid(),
    name: z.string().min(1),
    categoryId: z.string().min(1).uuid(),
    image: z.string().min(1),
    description: z.string().min(1),
    ingredients: z.string().min(1),
    priceAmount: z.string().min(1),
    priceCurrency: z.string().min(1),
  })
  .strict();

export default MenuItemData;
