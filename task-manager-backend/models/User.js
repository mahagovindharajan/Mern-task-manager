// models/User.js
// This defines the shape of our User document in MongoDB.
// Mongoose Schema acts like a blueprint for the data.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"], // Custom error message
      trim: true, // Removes extra whitespace
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // No two users can have the same email
      lowercase: true, // Automatically converts to lowercase
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // ⚠️ IMPORTANT: Password won't be returned in queries by default
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// ─────────────────────────────────────────────
// PRE-SAVE HOOK — Hash password before saving
// This runs automatically before every .save() call
// ─────────────────────────────────────────────
UserSchema.pre("save", async function () {
  // Only hash the password if it's new or has been modified
  // This prevents re-hashing an already hashed password on profile updates
  if (!this.isModified("password")) {
    return ;
  }

  // Generate a salt (random data added to password before hashing)
  // Salt rounds = 12 means it hashes 2^12 = 4096 times — very secure
  const salt = await bcrypt.genSalt(12);

  // Replace plain text password with hashed version
  this.password = await bcrypt.hash(this.password, salt);
   // Continue saving the document
});

// ─────────────────────────────────────────────
// INSTANCE METHOD — Compare entered password with hashed password
// We'll use this in the login controller
// ─────────────────────────────────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // bcrypt.compare() returns true if passwords match, false otherwise
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);