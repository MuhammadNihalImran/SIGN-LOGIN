const express = require("express");
const router = express.Router();

router.post("/", async (req, res, next) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now() + 86400000),
  });

  res.clearCookie("token");
  res.send({ message: "logout successful" });
});

module.exports = router;
