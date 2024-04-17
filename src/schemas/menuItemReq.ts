import * as z from "zod";

const MenuItemReq = z
  .object({
    restaurantId: z.string().uuid(),
    itemId: z.string().uuid(),
  })
  .strict();
export default MenuItemReq;
