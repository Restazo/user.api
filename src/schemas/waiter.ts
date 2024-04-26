import * as z from "zod";

export const waiterAuthTokensPayload = z.object({
  waiterId: z.string().uuid(),
  restaurantId: z.string().uuid(),
  waiterEmail: z.string().email(),
  waiterName: z.string().min(1),
});

export const fullWaiterData = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    pin: z.string(),
    restaurantId: z.string().uuid(),
    confirmationPin: z.string().nullable(),
    minutesDifference: z.number().nullable(),
  })
  .strict();

export const waiterLogInReq = z
  .object({
    email: z.string().email(),
    pin: z.string().length(5),
  })
  .strict();
