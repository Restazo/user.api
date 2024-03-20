import pool from "../db.js"

export const testFunction = async (req, res) => {
  try {
    res.status(200).json({ message: "Test function" })
  } catch (error) {}
}
