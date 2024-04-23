import { z } from "zod";
import { EnvSchema } from "./schemas/env.js";
import { WaiterRequestObj } from "./schemas/types/waiter.ts";
import { Table } from "./schemas/types/table.ts";
declare global {
  namespace Express {
    interface Request {
      waiter: WaiterRequestObj;
      table?: Table;
    }
  }
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof EnvSchema> {}
  }
}
