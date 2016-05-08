"use strict";
import mongoose, { Schema } from 'mongoose';
const { Types: { ObjectId } } = Schema;

const DATABASE = 'pbc';
const USER = 'pbc';
const PASSWORD = 'pbc';

// Schemas

const imageSchema = Schema({
  data: String,
  name: String,
  size: Number,
  type: { type: String }
});

const sessionSchema = Schema({
  administrator: Boolean,
  email: String,
  loginAt: Date,
  name: String,
  token: String
});
export const Session = mongoose.model('Session', sessionSchema);

const userSchema = Schema({
  administrator: Boolean,
  avatar: imageSchema,
  email: String,
  encryptedPassword: String,
  name: String,
  text: String
});

mongoose.model('User', userSchema);

const pageSectionSchema = Schema({
  type: { type: String,
    enum: ['text', 'image', 'event', 'library', 'form']
  },
  color: String,
  full: Boolean,
  image: imageSchema, // image type
  name: String,       // library type
  objectId: ObjectId, // event, form types
  text: String        // text type
});

const pageSchema = Schema({
  sections: [pageSectionSchema],
  name: String,
  url: String
});

mongoose.model('Page', pageSchema);

const datesSchema = Schema({
  start: Date,
  stop: Date
});

const eventSchema = Schema({
  calendar: String,
  location: String,
  name: String,
  recurrence: [datesSchema],
  start: Date,
  stop: Date,
  text: String
});

mongoose.model('Event', eventSchema);

const resourceSchema = Schema({
  name: String,
  text: String
});

mongoose.model('Resource', resourceSchema);

const formTemplateOptionSchema = Schema({
  name: String,
  value: String
});

const formTemplateFieldSchema = Schema({
  dependsOnId: ObjectId,
  help: String,
  limit: Number,
  monetary: Boolean,
  name: String,
  options: [formTemplateOptionSchema],
  required: Boolean,
  value: String
});

const formTemplateSectionSchema = Schema({
  dependsOnId: ObjectId,
  fields: [formTemplateFieldSchema],
  name: String
});

const formTemplateSchema = Schema({
  name: String,
  sections: [formTemplateSectionSchema],
  version: Number
});

mongoose.model('FormTemplate', formTemplateSchema);

const formFieldSchema = Schema({
  fieldId: ObjectId,
  value: String
});

const formSchema = Schema({
  fields: [formFieldSchema],
  paymentId: ObjectId,
  templateId: ObjectId,
  userId: ObjectId,
  version: Number
});

mongoose.model('Form', formSchema);

const paymentSchema = Schema({
  amount: Number,
  method: String,
  received: Date,
  sent: Date,
  userId: ObjectId
});

mongoose.model('Payment', paymentSchema);

const messageSchema = Schema({
  author: String,
  date: Date,
  image: {
    data: String,
    name: String,
    size: Number,
    mimeType: String // can't use 'type' since Mongoose reserves that
  },
  library: String,
  name: String,
  series: Boolean,
  seriesId: ObjectId,
  text: String,
  verses: String,
  files: [String] // TODO: GridFS
});

mongoose.model('Message', messageSchema);

const siteSchema = Schema({
  address: String,
  copyright: String,
  email: String,
  homePageId: ObjectId,
  name: String,
  logo: imageSchema,
  phone: String
});

mongoose.model('Site', siteSchema);

const newsletterSchema = Schema({
  addresses: String,
  date: Date,
  name: String,
  // TODO: references to events, pages, etc.
  text: String
});

mongoose.model('Newsletter', newsletterSchema);

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
