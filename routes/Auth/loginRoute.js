const express = require("express");
const router = express.Router();
const User = require("../../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post("/", async (req, res) => {
  if (!req.body?.email || !req.body?.password) {
    return res.status(400).send({
      message: `Required parameters missing. Example request body: {
          email: "some@email.com",
          password: "some$password",
        }`,
    });
  }

  req.body.email = req.body.email.toLowerCase();

  try {
    let user = await User.findOne({ email: req.body.email });

    // Use the same message regardless of whether the email or password is incorrect
    if (!user) {
      return res.status(401).send({ message: "Email or password incorrect" });
    }

    // Verify the password using bcrypt
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    const hashedPassword = user.password;
    const plainPassword = req.body.password;
    bcrypt.compare(plainPassword, hashedPassword, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
      } else if (isMatch) {
        console.log("Password match!");
      } else {
        console.log("Password does not match.");
      }
    });

    if (isMatch) {
      const token = jwt.sign(
        {
          isAdmin: user.isAdmin,
          firstName: user.firstName,
          lastName: user.lastName,
          email: req.body.email,
          _id: user._id,
        },
        process.env.SECRET,
        { expiresIn: "24h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + 86400000), // 1 day
      });

      return res.send({
        message: "Login successful",
        data: {
          isAdmin: user.isAdmin,
          firstName: user.firstName,
          lastName: user.lastName,
          email: req.body.email,
          _id: user._id,
        },
      });
    } else {
      return res
        .status(401)
        .send({ message: "is Email or password incorrect" });
    }
  } catch (error) {
    console.error("Error getting data from MongoDB: ", error);
    return res.status(500).send("Server error, please try later");
  }
});

module.exports = router;
