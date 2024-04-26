import * as z from "zod";

export const DeviceIdSchema = z.string().uuid();
