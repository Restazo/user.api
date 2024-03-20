import pool from "../db.js"
import { Request, Response } from "express"

export const testFunction = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: "Test function" })
  } catch (error) {}
}
