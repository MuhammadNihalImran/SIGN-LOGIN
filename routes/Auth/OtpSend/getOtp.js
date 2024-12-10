const { customAlphabet } = require("nanoid");
const userModel = require("../../../models/UserModel");

router.post("/forget-password", async (req, res) => {
  try {
    let body = req.body;
    body.email = body.email.toLowerCase();

    if (!body.email) {
      // null check - undefined, "", 0 , false, null , NaN
      res.status(400).send(
        `required fields missing, request example: 
                {
                    "email": "abc@abc.com",
                }`
      );
      return;
    }

    // check if user exist
    const user = await userModel
      .findOne({ email: body.email }, "firstName lastName email")
      .exec();

    if (!user) throw new Error("User not found");

    const nanoid = customAlphabet("1234567890", 5);
    const OTP = nanoid();
    const otpHash = await bcrypt.hash(OTP);

    console.log("OTP: ", OTP);
    console.log("otpHash: ", otpHash);

    otpModel.create({
      otp: otpHash,
      email: body.email, // malik@sysborg.com
    });

    // TODO: send otp via email // postMark sendGrid twilio
    const emailResp = await postMarkClient.sendEmail({
      From: "info@sysborg.com",
      To: user.email,
      Subject: "SysBorg: One Time Password",
      HtmlBody: `
            <div>
                <p>Hi ${user.firstName} ${user.lastName}, you requested for forget password, here is your otp, it is only valid for 5 minutes: </p>
                <h1>${OTP}</h1>
            </div>`,
      MessageStream: "outbound",
    });
    console.log("emailResp: ", emailResp);

    // const twilioResp = await twilioClient.messages.create({
    //     body: `Hi ${user.firstName} ${user.lastName}, you requested for forget password, here is your otp, it is only valid for 5 minutes: ${OTP}`,
    //     messagingServiceSid: 'MG5d595874c297d11b3349828df8d134be',
    //     to: '+923022004480'
    // })
    // console.log("twilioResp: ", twilioResp);

    res.send({
      message: "OTP sent success",
    });
    return;
  } catch (error) {
    console.log("error: ", error);
    res.status(500).send({
      message: error.message,
    });
  }
});
router.post("/forget-password-2", async (req, res) => {
  try {
    let body = req.body;
    body.email = body.email.toLowerCase();

    if (!body.email || !body.otp || !body.newPassword) {
      // null check - undefined, "", 0 , false, null , NaN

      res.status(400).send(
        `required fields missing, request example: 
                {
                    "email": "abc@abc.com",
                    "otp": "12345",
                    "newPassword": "someSecretString",
                }`
      );
      return;
    }

    // check if otp exist
    const otpRecord = await otpModel
      .findOne({
        email: body.email,
      })
      .sort({ _id: -1 })
      .exec();

    if (!otpRecord) throw new Error("Invalid Opt");
    if (otpRecord.isUsed) throw new Error("Invalid Otp");

    await otpRecord.update({ isUsed: true }).exec();

    console.log("otpRecord: ", otpRecord);
    console.log("otpRecord: ", moment(otpRecord.createdOn));

    const now = moment();
    const optCreatedTime = moment(otpRecord.createdOn);
    const diffInMinutes = now.diff(optCreatedTime, "minutes");

    console.log("diffInMinutes: ", diffInMinutes);
    if (diffInMinutes >= 5) throw new Error("Invalid Otp");

    const isMatched = await varifyHash(body.otp, otpRecord.otp);
    if (!isMatched) throw new Error("Invalid OTP");

    const newHash = await stringToHash(body.newPassword);

    await userModel
      .updateOne({ email: body.email }, { password: newHash })
      .exec();

    // success
    res.send({
      message: "password updated success",
    });
    return;
  } catch (error) {
    console.log("error: ", error);
    res.status(500).send({
      message: error.message,
    });
  }
});
