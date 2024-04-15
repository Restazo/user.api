import * as z from "zod";

const waiterLogInReq = z
  .object({
    email: z.string().email(),
    pin: z.string().length(5),
  })
  .strict();

export default waiterLogInReq;
