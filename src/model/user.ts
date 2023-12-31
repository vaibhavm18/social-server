import { CallbackWithoutResultAndOptionalError, Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { IUser } from "../types/user.type.js";
import { ACCESS_TOKEN, ACCESS_TOKEN_EXP } from "../config/env.js";

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  ],

  notifications: [
    {
      type: Schema.Types.ObjectId,
      ref: "Notifications",
    },
  ],
  groups: [
    {
      type: Schema.Types.ObjectId,
      ref: "Groups",
    },
  ],
});

userSchema.pre(
  "save",
  async function (next: CallbackWithoutResultAndOptionalError) {
    const user = this as IUser;

    if (!user.password) {
      return next();
    }

    if (user.isModified("password")) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
    }

    return next();
  },
);

userSchema.methods.validatePassword = async function (
  userInput: string,
): Promise<boolean> {
  const user = this as IUser;
  if (!user.password) {
    return false;
  }
  return await bcrypt.compare(userInput, user.password);
};

userSchema.methods.getAccessToken = async function () {
  return jwt.sign(
    {
      id: this._id,
    },
    ACCESS_TOKEN,
    {
      expiresIn: ACCESS_TOKEN_EXP,
    },
  );
};

export const Users = model<IUser>("Users", userSchema);
