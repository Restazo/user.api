import { z } from "zod";

import { MenuSchema } from "../menu.js";

export type Menu = z.infer<typeof MenuSchema>;
