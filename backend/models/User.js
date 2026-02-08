import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator(value) {
          return validator.isStrongPassword(value);
        },
        message: 'Password is not strong enough',
      },
    },
  },
  { timestamps: true }
);


userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
});

userSchema.methods.isValidPassword = async function (providedPass) {
  return await bcrypt.compare(providedPass, this.password);
};

userSchema.methods.getJWT = async function () {
  return await jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export default mongoose.model('User', userSchema);
