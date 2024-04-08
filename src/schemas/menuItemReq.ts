import * as z from "zod";

const MenuItemReq = z
  .object({
    restaurantId: z.string().min(1).uuid(),
    itemId: z.string().min(1).uuid(),
  })
  .strict();
export default MenuItemReq;
