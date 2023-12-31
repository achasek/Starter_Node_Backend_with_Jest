require('dotenv').config();

const DB_URL = process.env.DB_URL;
const DB_TEST_URL = process.env.DB_TEST_URL;
const PORT = process.env.PORT;
const SECRET = process.env.SECRET;
const ENV = process.env.NODE_ENV;

// checks if we are in dev or production build and communicates with either
// test db or production db depending
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.DB_TEST_URL
  : process.env.DB_URL;

// const MONGODB_URI = process.env.DB_TEST_URL

module.exports = {
  DB_URL,
  DB_TEST_URL,
  MONGODB_URI,
  PORT,
  SECRET,
  ENV
};