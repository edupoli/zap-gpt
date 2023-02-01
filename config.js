import dotenv from "dotenv";
dotenv.config();

export const {
  API_HOST,
  API_PORT,
  API_SESSION,
  API_SESSION_KEY,
  OPENAI_API_KEY,
} = process.env;
