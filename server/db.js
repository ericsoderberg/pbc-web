"use strict";
import mongoose, { Schema } from 'mongoose';

const DATABASE = 'pbc';
const USER = 'pbc';
const PASSWORD = 'pbc';

// Schemas

const sessionSchema = Schema({
  email: String,
  lastLogin: Date,
  name: String,
  token: String
});
export const Session = mongoose.model('Session', sessionSchema);

const userSchema = Schema({
  administrator: Boolean,
  avatar: {
    data: String,
    name: String,
    size: Number,
    mimeType: String // can't use 'type' since Mongoose reserves that
  },
  email: String,
  encryptedPassword: String,
  name: String
}, { strict: false });

mongoose.model('User', userSchema);

// Connection

const opts = { user: USER, pass: PASSWORD,  auth: { authdb: 'admin' } };
mongoose.connect(`mongodb://localhost/${DATABASE}`, opts, (error) => {
  if (error) {
    console.log('!!! connection error', error);
  }
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// export default db;
