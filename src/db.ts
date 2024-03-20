import pg from "pg"

const pool = new pg.Pool({
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  port: 3000,
})

pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connection to database", err.stack)    
  }
  console.log("Database connection succesful")
  release()
})

export default pool
