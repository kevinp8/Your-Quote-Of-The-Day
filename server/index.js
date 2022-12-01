import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import User from "./models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs'

mongoose.connect(process.env.MONGO_URI);

const app = express();

app.use(cors());
app.use(express.json());

app.listen(process.env.PORT, () => console.log("server now running"));

app.post("/register", async (req, res) => {
  try {
    const newPassword = await bcrypt.hash(req.body.password, 5)
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: newPassword,
    });
    res.json({ status: "ok" });
  } catch (error) {
    res.json({ status: "error", error: "Duplicate email" });
  }
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if(!user) res.json({ status: "error", msg: 'no account associated with this email' });

  const valid = await bcrypt.compare(req.body.password, user.password)

  if (valid) {
    const token = jwt.sign(
      {
        email: user.email,
        name: user.name,
      },
      "secret123"
    );
    res.json({ status: "ok", user: token });
  } else res.json({ status: "error", msg: 'wrong password' });
});

app.get("/quote", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    const decoded = jwt.verify(token, "secret123");
    const email = decoded.email;
    const user = await User.findOne({ email: email });

    res.json({ status: "ok", quote: user.quote });
  } catch (err) {
    console.log(err);
    res.json({ status: "error", error: "invalid token" });
  }
});

app.post("/quote", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    const decoded = jwt.verify(token, "secret123");
    const email = decoded.email;
    const user = await User.findOneAndUpdate(
      { email: email },
      { $set: { quote: req.body.quote } }
    );

    res.json({ status: "ok", quote: user.quote, e:'frwerew' });
  } catch (err) {
    console.log(err);
    res.json({ status: "error", error: "invalid token" });
  }
});
