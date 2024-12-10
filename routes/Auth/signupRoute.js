const express = require("express");
const router = express.Router();

const User = require("../../models/UserModel");
// const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post("/", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).send({
      message: `Required parameters missing. Example request body: {
          firstName: "some firstName",
          lastName: "some lastName",
          email: "some@email.com",
          password: "some$password",
        }`,
    });
  }

  const normalizedEmail = email.toLowerCase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).send({ message: "Invalid email format" });
  }

  try {
    let existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).send({
        message: "User already exists with this email",
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      isAdmin: false,
      firstName,
      lastName,
      email: normalizedEmail,
      password: passwordHash,
      createdOn: new Date(),
    });

    const insertResponse = await newUser.save();

    return res.send({
      message: "Signup successful",
      data: {
        firstName: insertResponse.firstName,
        lastName: insertResponse.lastName,
        email: insertResponse.email,
        _id: insertResponse._id,
      },
    });
  } catch (error) {
    console.error("Error saving user to MongoDB: ", error);
    return res.status(500).send("Server error, please try later");
  }
});

module.exports = router;
