"use strict";
import mongoose, { Schema } from 'mongoose';

const sessionSchema = Schema({
  email: String,
  lastLogin: Date
});
export const Session = mongoose.model('Session', sessionSchema);

const userSchema = Schema({
  administrator: Boolean,
  email: String,
  encryptedPassword: String,
  name: String
}); //, { strict: false });
export const User = mongoose.model('User', userSchema);
