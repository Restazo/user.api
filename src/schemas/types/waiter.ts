import { z } from "zod";

import { fullWaiterData, waiterAuthTokensPayload } from "../waiter.js";

export type WaiterRequestObj = z.infer<typeof waiterAuthTokensPayload>;

export type FullWaiter = z.infer<typeof fullWaiterData>;
