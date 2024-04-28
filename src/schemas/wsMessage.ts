import * as z from "zod";

export const WSMessageReqSchema = z.union([
  z.object({
    path: z.literal("/subscribe/restaurant"),
    payload: z.object({
      accessToken: z.string().min(1),
    }),
  }),
  z.object({
    path: z.literal("/subscribe/order"),
    payload: z.object({
      orderId: z.string().uuid(),
      accessToken: z.string().min(1),
    }),
  }),
]);
