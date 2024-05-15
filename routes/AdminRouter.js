const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../db/userModel");
const admin = require('../auth/firebaseAdmin'); // Import Firebase Admin SDK
const router = express.Router();

const JWT_SECRET = 'your-secret-key';
const SALT_ROUNDS = 10;

router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;

  try {
    const user = await User.findOne({ login_name });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ error: "Invalid login name or password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.send({ token, user: { _id: user._id, first_name: user.first_name } });
  } catch (err) {
    res.status(500).send({ error: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

  try {
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).send({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new User({
      login_name,
      password: hashedPassword,
      first_name,
      last_name,
      location,
      description,
      occupation
    });
    await newUser.save();

    res.status(201).send({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).send({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  res.send({ message: "Successfully logged out" });
});

// Xử lý đăng nhập qua Google và GitHub
router.post("/login-google-github", async (req, res) => {
  const { token, email, first_name, last_name, provider } = req.body;
  console.log(token);
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Decoded Token:", decodedToken); // Thêm log ở đây để kiểm tra

    let user = await User.findOne({ email: decodedToken.email });
    console.log("Existing User:", user); // Thêm log ở đây để kiểm tra

    if (!user) {
      // Tạo người dùng mới nếu không tồn tại
      user = new User({
        login_name: email,
        password: '123456', // Lưu giá trị mặc định
        first_name: decodedToken.name,
        last_name: last_name,
        location: '', // Thêm các thông tin khác nếu cần
        description: '',
        occupation: '',
        email: email,
        provider: provider
      });
      await user.save();
      console.log("New user created:", user); // Thêm log ở đây để kiểm tra
    } else {
      console.log("User already exists:", user); // Thêm log ở đây để kiểm tra
    }

    // Tạo JWT cho ứng dụng của bạn
    const jwtToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.send({ token: jwtToken, user });
  } catch (error) {
    console.error("Error verifying token or saving user:", error); // Thêm log lỗi ở đây
    res.status(401).send({ error: "Invalid token" });
  }
});

module.exports = router;
