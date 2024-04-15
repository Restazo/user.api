import * as z from "zod";

export const authTokensPayload = z.object({
  waiter_id: z.string().uuid(),
  restaurant_id: z.string().uuid(),
  waiter_email: z.string().email(),
});

export type Waiter = z.infer<typeof authTokensPayload>;
