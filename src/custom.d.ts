import { z } from "zod";
import { EnvSchema } from "./schemas/env.js";
import { WaiterRequestObj } from "./schemas/types/waiter.ts";
declare global {
  namespace Express {
    interface Request {
      waiter: WaiterRequestObj;
    }
  }
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof EnvSchema> {}
  }
}
