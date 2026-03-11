import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail, sendResetPasswordEmail } from "../services/email.service.js";

// register user: /api/user/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all the fields", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      name,
      email,
      password: hashedPassword,
      verifyToken,
    });
    await user.save();

    // Send verification email in the background
    sendVerificationEmail(user.email, user.name, verifyToken).catch(err =>
      console.error("Delayed error in background registration email:", err)
    );

    res.status(201).json({
      message: "Registration successful! Please verify your email to log in.",
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// login user: /api/user/login

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all the fields", success: false });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User does not exist", success: false });
    }

    if (!user.isVerified) {
      // Regenerate token
      const verifyToken = crypto.randomBytes(32).toString("hex");
      user.verifyToken = verifyToken;
      await user.save();

      // Resend email
      // Resend email in the background
      sendVerificationEmail(user.email, user.name, verifyToken).catch(err =>
        console.error("Delayed error in background login email resend:", err)
      );

      return res
        .status(400)
        .json({ message: "Account not verified. A new verification email has been sent.", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "Logged in successfull",
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// check auth : /api/user/is-auth
export const checkAuth = async (req, res) => {
  try {
    const userId = req.user;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// logout user: /api/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
    });
    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// verify email : /api/user/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verifyToken: token });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
        success: false,
      });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully! You can now log in.",
      success: true,
    });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Forgot Password: /api/user/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Generate reset token (random 6 digits or secure string)
    // Using a secure hex string for the link
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresMinutes = 5;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + expiresMinutes * 60 * 1000;
    await user.save();

    // Send reset email in the background
    sendResetPasswordEmail(user.email, user.name, resetToken, expiresMinutes).catch(err =>
      console.error("Delayed error in background forgot password email:", err)
    );

    res.status(200).json({
      message: "Password reset link sent to your email. It will expire in 5 minutes.",
      success: true
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset Password: /api/user/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required", success: false });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token", success: false });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "Password reset successful! You can now log in with your new password.",
      success: true
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
