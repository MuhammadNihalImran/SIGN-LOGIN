if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
var cors = require("cors");

const authRouter = require("./routes/Auth/authRoute.js");
const ChangePassword = require("./routes/Auth/changePassword.js");
// const unAuthProfileRouter = require("./routes/UnAuthRoute/Authroute.js");

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

app.use(
  cors({
    origin: ["http://localhost:5173"], // Allow the frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Define allowed HTTP methods
    credentials: true, // Allow credentials to be sent
  })
);

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

main()
  .then(() => {
    console.log("connection is done");
  })
  .catch((err) => console.log(err));

async function main() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/authPractice");
    console.log("server connection is successful");
  } catch (err) {
    console.log("server connection is failed", err);
  }
}
app.get("/", (req, res) => {
  res.send("hello worl");
});

app.use("/api/v1", authRouter);

app.use("/api/v1", (req, res, next) => {
  // JWT
  // console.log("cookies: ", req.cookies.token);
  // console.log("secret", process.env.SECRET);

  const token = req.cookies.token;
  // const decoded = jwt.verify(token, process.env.SECRET);
  // console.log("decoded: ", decoded);
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    // console.log("decodedtry: ", decoded);

    req.body.decoded = {
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
      _id: decoded._id,
    };

    next();
  } catch (err) {
    // unAuthProfileRouter(req, res);
    return;
  }
});
console.log("past barrier");

app.use("/api/v1", ChangePassword); // Secure api

app.use("/api/v1/ping", (req, res) => {
  res.send("ok");
});

const PORT = process?.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
