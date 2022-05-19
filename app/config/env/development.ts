import 'dotenv/config';

export default {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY_DURATION: process.env.JWT_EXPIRY_DURATION
};
