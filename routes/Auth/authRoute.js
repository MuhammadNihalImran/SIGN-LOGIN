const express = require("express");
const router = express.Router({ mergeParams: true });

const loginRoute = require("./loginRoute");
const logoutRoute = require("./logoutRoute");
const signupRoute = require("./signupRoute");
// const changePassword = require("./changePassword");

// LOGIN ROUTE
router.use("/login", loginRoute);

router.post("/helo", (req, res, next) => {
  console.log("id", req.body?.decoded?.firstName);
});

// log out
router.use("/logout", logoutRoute);

// SIGNUP ROUTE
router.use("/signup", signupRoute);

module.exports = router;
