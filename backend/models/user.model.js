const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
    },
    country_code: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
      default: null,
    },
    location: {
      address: {
        type: String,
        default: null,
      },
      city: {
        type: String,
        default: null,
      },
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },
    date_of_birth: {
      type: Date,
      default: null,
    },
    lord_accepted: {
      type: String,
      default: `No "I still have Questions"`,
    },
    otp: {
      type: Number,
      default: null,
    },
    otp_expiry: {
      type: Date,
      default: null,
    },
    device_type: {
      type: String,
      enum: ["Android", "iOS", "android", "ios"],
      default: null,
    },
    device_token: {
      type: String,
      default: null,
    },
    fcm_token: {
      type: String,
      default: null,
    },
    social_token: {
      type: String,
      default: null,
    },
    social_type: {
      type: String,
      enum: ["google", "facebook", "apple", "email"],
      default: "email",
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    church_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChurchList",
      default: null,
    },
    app_language: {
      type: String,
      default: "en",
    },
    is_community_created: {
      type: Number,
      default: 0,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
    refresh_token: {
      type: String,
      default: null,
    },
    reset_password_token: {
      type: String,
      default: null,
    },
    reset_password_expiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for soft delete queries
userSchema.index({ deleted_at: 1 });
userSchema.index({ location: "2dsphere" });

// Hash the password before saving the user document
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
