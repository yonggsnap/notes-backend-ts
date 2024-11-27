import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
const { POSTGRESS_PASSWORD, POSTGRES_USER, POSTGRES_DB } = process.env;

const DATABASE_URL = `postgres://${POSTGRES_USER}:${POSTGRESS_PASSWORD}@localhost:5432/${POSTGRES_DB}`;

export const db = drizzle(DATABASE_URL!);
