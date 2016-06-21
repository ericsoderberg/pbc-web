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
  token: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});
export const Session = mongoose.model('Session', sessionSchema);

const userSchema = Schema({
  administrator: Boolean,
  avatar: image,
  created: Date,
  email: {type: String, required: true, unique: true},
  encryptedPassword: {type: String, required: true},
  modified: Date,
  name: {type: String, required: true},
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
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },  // event type
  formTemplateId: { type: Schema.Types.ObjectId, ref: 'FormTemplate' },   // form type
  navigable: Boolean, // event type
  pages: [{           // pages type
    id: { type: Schema.Types.ObjectId, ref: 'Page' },
    image: image
  }],
  text: String,       // text type
  url: String,        // video type
  userId: { type: Schema.Types.ObjectId, ref: 'User' }    // user type
});

const pageSchema = Schema({
  created: Date,
  sections: [pageSectionSchema],
  modified: Date,
  name: String,
  path: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Page', pageSchema);

const eventSchema = Schema({
  address: String, // mappable
  calendar: String,
  created: Date,
  dates: [Date],
  end: Date,
  primaryEventId: { type: Schema.Types.ObjectId, ref: 'Event' }, // set in one-off cases
  location: String, // room, house owner's name, etc.
  modified: Date,
  name: String,
  path: String,
  resourceIds: [{ type: Schema.Types.ObjectId, ref: 'Resource' }], // resources
  start: Date,
  text: String,
  times: [{
    end: Date,
    start: Date
  }],
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Event', eventSchema);

const resourceSchema = Schema({
  created: Date,
  modified: Date,
  name: String,
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
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
  type: { type: String,
    enum: ['line', 'lines', 'choice', 'choices', 'count', 'instructions']
  },
  value: String // unused?
});

const formTemplateSectionSchema = Schema({
  dependsOnId: ObjectId,
  fields: [formTemplateFieldSchema],
  name: String
});

const formTemplateSchema = Schema({
  created: Date,
  modified: Date,
  name: String,
  path: String,
  sections: [formTemplateSectionSchema],
  submitLabel: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  version: Number
});

mongoose.model('FormTemplate', formTemplateSchema);

const formSchema = Schema({
  created: Date,
  fields: [{
    fieldId: ObjectId,
    optionId: ObjectId, // choice
    optionIds: [ObjectId], // choices
    value: String
  }],
  formTemplateId: { type: Schema.Types.ObjectId, ref: 'FormTemplate' },
  modified: Date,
  paymentId: ObjectId,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  version: Number
});

mongoose.model('Form', formSchema);

const paymentSchema = Schema({
  amount: Number,
  created: Date,
  method: String,
  modified: Date,
  received: Date,
  sent: Date,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Payment', paymentSchema);

const messageSchema = Schema({
  author: String,
  created: Date,
  date: Date,
  files: [{
    _id: String,
    name: String,
    size: Number,
    type: { type: String }
  }],
  image: image,
  library: String,
  modified: Date,
  name: String,
  path: String,
  series: Boolean,
  seriesId: { type: Schema.Types.ObjectId, ref: 'Message' },
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  videoUrl: String,
  verses: String
});

mongoose.model('Message', messageSchema);

const siteSchema = Schema({
  address: String,
  copyright: String,
  email: String,
  homePageId: { type: Schema.Types.ObjectId, ref: 'Page' },
  name: String,
  logo: image,
  phone: String,
  socialUrls: [String],
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Site', siteSchema);

const newsletterSchema = Schema({
  address: String,
  calendar: String,
  created: Date,
  date: Date,
  library: String,
  modified: Date,
  name: String,
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Newsletter', newsletterSchema);

const emailListSchema = Schema({
  addresses: [String],
  created: Date,
  modified: Date,
  name: {type: String, required: true, unique: true},
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
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
