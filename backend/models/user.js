const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true
    },

    password: {
      type: String,
      required: true,
      select: false 
    },

    role: {
      type: String,
      enum: ["ADMIN"],
      default: "ADMIN"
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    //   required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    lastLoginAt: {
      type: Date
    }
  },
  { timestamps: true }
);

//hashPassword
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

module.exports = mongoose.model("User", userSchema);
