import * as z from "zod";

export const waiterAuthTokensPayload = z.object({
  waiter_id: z.string().uuid(),
  restaurant_id: z.string().uuid(),
  waiter_email: z.string().email(),
  waiter_name: z.string().min(1),
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
