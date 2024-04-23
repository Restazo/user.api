import * as z from "zod";
import { JwtPayload } from "jsonwebtoken";

import { TableSchema } from "../table.js";

export type Table = z.infer<typeof TableSchema>;

export type TableSessionJwtPayload = JwtPayload & Table;
