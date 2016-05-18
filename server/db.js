"use strict";
import mongoose, { Schema } from 'mongoose';
const { Types: { ObjectId } } = Schema;

const DATABASE = 'pbc';
const USER = 'pbc';
const PASSWORD = 'pbc';

// Schemas

const image = {
  data: String,
  name: String,
  size: Number,
  type: { type: String }
};

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
  avatar: image,
  email: String,
  encryptedPassword: String,
  name: String,
  path: String,
  text: String
});

mongoose.model('User', userSchema);

const pageSectionSchema = Schema({
  type: { type: String,
    enum: ['text', 'image', 'event', 'library', 'form', 'user', 'pages', 'video']
  },
  color: String,
  full: Boolean,
  image: image,       // image type
  name: String,       // library type
  eventId: ObjectId,  // event type
  formId: ObjectId,   // form type
  pages: [{           // pages type
    id: ObjectId,
    image: image,
    text: String,
    tile: image
  }],
  text: String,       // text type
  url: String         // video type
});

const pageSchema = Schema({
  sections: [pageSectionSchema],
  name: String,
  path: String
});

mongoose.model('Page', pageSchema);

const eventSchema = Schema({
  address: String, // mappable
  calendar: String,
  dates: [Date],
  end: Date,
  primaryEventId: ObjectId, // set in one-off cases
  location: String, // room, house owner's name, etc.
  name: String,
  path: String,
  resourceIds: [ObjectId], // resources
  start: Date,
  text: String,
  times: [{
    end: Date,
    start: Date
  }]
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
  image: image,
  library: String,
  name: String,
  path: String,
  series: Boolean,
  seriesId: ObjectId,
  text: String,
  videoUrl: String,
  verses: String,
  files: [{
    _id: String,
    name: String,
    size: Number,
    type: { type: String }
  }]
});

mongoose.model('Message', messageSchema);

const siteSchema = Schema({
  address: String,
  copyright: String,
  email: String,
  homePageId: ObjectId,
  name: String,
  logo: image,
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

const emailListSchema = Schema({
  addresses: [String],
  name: String,
  text: String
});

mongoose.model('EmailList', emailListSchema);

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
