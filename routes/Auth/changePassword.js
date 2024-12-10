const express = require("express");
const router = express.Router({ mergeParams: true });
const userModel = require("../../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post("/change-password", async (req, res) => {
  console.log("id", "", req.body.decoded._id);

  try {
    const body = req.body;
    const currentPassword = body.currentPassword;
    const newPassword = body.password;
    const _id = req.body.decoded._id;

    // check if user exist
    const user = await userModel.findOne({ _id: _id }, "password").exec();

    if (!user) throw new Error("User not found");

    const isMatched = await bcrypt.compare(currentPassword, user.password);
    if (!isMatched) throw new Error("password mismatch");

    const newHash = await bcrypt.hash(newPassword, 12);

    await userModel.updateOne({ _id: _id }, { password: newHash }).exec();

    // success
    res.send({
      message: "password changed success",
    });
    return;
  } catch (error) {
    console.log("error: ", error);
    res.status(500).send();
  }
});

module.exports = router;
