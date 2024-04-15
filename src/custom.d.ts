import { z } from "zod";
import { EnvSchema } from "./schemas/env.js";
import { Waiter } from "./schemas/authTokens.ts";

declare global {
  namespace Express {
    interface Request {
      waiter: Waiter;
    }
  }
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof EnvSchema> {}
  }
}
