import { z } from "zod";
import { EnvSchema } from "./schemas/env.js";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof EnvSchema> {}
  }
}
