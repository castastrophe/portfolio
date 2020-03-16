// If we have a .env file respect the LOCALHOST setting
// If not default to localhost
require("dotenv").config();

module.exports = {
  host: process.env.LOCALHOST || "localhost",
  port: "auto",
  open: true,
  startPath: "/",
  verbose: false,
  routes: {
    "/": "./",
    "/examples": "./examples",
    "/favicon.ico": "./favicon.ico",
    "/": "./node_modules"
  },
  bs: {
    watchOptions: {
      ignoreInitial: true,
      ignored: ["node_modules", "_temp"]
    },
    middleware: [require("compression")()]
  }
};