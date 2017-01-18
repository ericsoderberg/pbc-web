"use strict";
import mongoose, { Schema } from 'mongoose';
const { Types: { ObjectId } } = Schema;

const DATABASE = process.env.DATABASE || 'pbc';
const USER = process.env.DATABASE_USER || 'pbc';
const PASSWORD = process.env.DATABASE_PASSWORD || 'pbc';

// Schemas

const image = {
  data: String,
  name: String,
  size: Number,
  type: { type: String }
};

const sessionSchema = Schema({
  administrator: Boolean,
  administratorDomainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  email: String,
  loginAt: Date,
  name: String,
  token: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});
export const Session = mongoose.model('Session', sessionSchema);

const userSchema = Schema({
  address: String,
  administrator: Boolean,
  administratorDomainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  image: image,
  created: Date,
  email: {type: String, required: true, unique: true},
  encryptedPassword: String,
  modified: Date,
  name: {type: String, required: true},
  oldId: Number,
  path: String,
  phone: String,
  relations: [{
    birthday: Date,
    grade: String,
    name: String,
    notes: String,
    relationship: String
  }],
  temporaryToken: String,
  text: String,
  verified: Boolean
});

mongoose.model('User', userSchema);

const domainSchema = Schema({
  created: Date,
  modified: Date,
  name: {type: String, required: true}
});

mongoose.model('Domain', domainSchema);

const pageSectionSchema = Schema({
  backgroundImage: image,
  // calendar type
  calendarId: { type: Schema.Types.ObjectId, ref: 'Calendar' },
  color: String,
  // event type
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  // files type
  files: [{
    _id: String,
    label: String,
    name: String,
    size: Number,
    type: { type: String }
  }],
  // form type
  formTemplateId: { type: Schema.Types.ObjectId, ref: 'FormTemplate' },
  full: Boolean,
  // image type
  image: image,
  // library type
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library' },
  // event type
  navigable: Boolean,
  // pages type
  pages: [{
    id: { type: Schema.Types.ObjectId, ref: 'Page' },
    image: image
  }],
  // people type
  people: [{
    id: { type: Schema.Types.ObjectId, ref: 'User' },
    image: image,
    text: String
  }],
  // text type
  text: String,
  type: { type: String,
    enum: [
      'calendar', 'event', 'files', 'form', 'image', 'library',
      'people', 'pages', 'text', 'video'
    ]
  },
  // video type
  url: String
});

const pageSchema = Schema({
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: String,
  oldId: Number,
  path: String,
  public: Boolean,
  sections: [pageSectionSchema],
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

pageSchema.index({ name: 'text', 'sections.text': 'text' },
  { weights: { name: 5, 'sections.text': 1 } });

const Page = mongoose.model('Page', pageSchema);
Page.on('index', (error) => console.log('Page index ready'));

const calendarSchema = Schema({
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: {type: String, required: true},
  path: String,
  private: Boolean,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Calendar', calendarSchema);

const eventSchema = Schema({
  address: String, // mappable
  calendarId: { type: Schema.Types.ObjectId, ref: 'Calendar' },
  created: Date,
  dates: [Date],
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  end: Date,
  image: image,
  location: String, // room, house owner's name, etc.
  modified: Date,
  name: String,
  oldId: Number,
  path: String,
  // set in one-off cases
  primaryEventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  private: Boolean,
  resourceIds: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
  start: Date,
  text: String,
  times: [{
    end: Date,
    start: Date
  }],
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

eventSchema.index({ name: 'text', text: 'text' },
  { weights: { name: 5, text: 1 } });

const Event = mongoose.model('Event', eventSchema);
Event.on('index', (error) => console.log('Event index ready'));

const resourceSchema = Schema({
  created: Date,
  modified: Date,
  name: {type: String, required: true, unique: true},
  oldId: Number,
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Resource', resourceSchema);

const formTemplateOptionSchema = Schema({
  disabled: Boolean,
  limit: Number,
  name: String,
  oldId: Number,
  value: String
});

const formTemplateFieldSchema = Schema({
  dependsOnId: ObjectId,
  discount: Boolean, // negates form field value
  help: String,
  limit: Number,
  max: Number, // for count
  min: Number, // for count
  monetary: Boolean,
  name: String,
  oldId: Number,
  options: [formTemplateOptionSchema],
  required: Boolean,
  type: {
    type: String,
    enum: ['line', 'lines', 'choice', 'choices', 'count', 'instructions'],
    required: true
  },
  value: String // for monetary + type='count'
});

const formTemplateSectionSchema = Schema({
  administrative: Boolean,
  dependsOnId: ObjectId,
  fields: [formTemplateFieldSchema],
  name: String,
  oldId: Number
});

const formTemplateSchema = Schema({
  acknowledge: Boolean,
  authenticate: Boolean,
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: {type: String, required: true, unique: true},
  notify: String,
  oldId: Number,
  payable: Boolean,
  payByCheckInstructions: String,
  sections: [formTemplateSectionSchema],
  submitLabel: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  version: Number
});

mongoose.model('FormTemplate', formTemplateSchema);

const paymentSchema = Schema({
  amount: Number,
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  notes: String,
  method: String, // check | paypal
  modified: Date,
  oldId: Number,
  payPalId: String,
  received: Date,
  sent: Date,
  temporaryToken: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Payment', paymentSchema);

const formSchema = Schema({
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  fields: [{
    oldId: Number,
    optionId: ObjectId, // choice, formTemplateFieldOption
    optionIds: [ObjectId], // choices, formTemplateFieldOption
    templateFieldId: { type: Schema.Types.ObjectId, required: true },
    value: String
  }],
  formTemplateId: { type: Schema.Types.ObjectId, ref: 'FormTemplate',
    required: true },
  modified: Date,
  name: String, // derived from appropriate field value
  oldId: Number,
  // This is an array in case the form is modified to increase the amount
  // and needs a subsequent payment.
  paymentIds: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  version: Number
});

mongoose.model('Form', formSchema);

const podcastSchema = Schema({
  category: String,
  description: String,
  image: image,
  subCategory: String,
  subtitle: String,
  summary: String,
  title: String
});

const librarySchema = Schema({
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: {type: String, required: true},
  path: String,
  podcast: podcastSchema,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Library', librarySchema);

const messageSchema = Schema({
  author: String,
  created: Date,
  date: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  dpId: String,
  files: [{
    _id: String,
    label: String,
    name: String,
    size: Number,
    type: { type: String }
  }],
  image: image,
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library' },
  modified: Date,
  name: String,
  oldId: Number,
  path: String,
  series: Boolean,
  seriesId: { type: Schema.Types.ObjectId, ref: 'Message' },
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  videoUrl: String,
  verses: String
});

messageSchema.index({
  author: 'text', name: 'text', text: 'text', verses: 'text'
},
  { weights: { verses: 8, name: 5, author: 3, text: 1 } });

const Message = mongoose.model('Message', messageSchema);
Message.on('index', (error) => console.log('Message index ready'));


const oldFileSchema = Schema({
  oldId: {type: String, required: true, unique: true},
  label: String,
  name: String,
  size: Number,
  type: { type: String }
});

mongoose.model('OldFile', oldFileSchema);

const siteSchema = Schema({
  address: String,
  color: String,
  copyright: String,
  email: String,
  homePageId: { type: Schema.Types.ObjectId, ref: 'Page' },
  mobileIcon: image,
  name: String,
  logo: image,
  phone: String,
  shortcutIcon: image,
  slogan: String,
  socialUrls: [String],
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Site', siteSchema);

const newsletterSchema = Schema({
  address: String,
  // calendarId: { type: Schema.Types.ObjectId, ref: 'Calendar' },
  created: Date,
  date: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  eventIds: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  image: image,
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library' },
  modified: Date,
  name: {type: String, required: true},
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Newsletter', newsletterSchema);

const emailListSchema = Schema({
  addresses: [{
    address: String,
    state: { type: String,
      enum: ['pending', 'ok', 'bouncing', 'disabled']
    }
  }],
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: {type: String, required: true, unique: true},
  public: Boolean,
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('EmailList', emailListSchema);

// Connection

const opts = { user: USER, pass: PASSWORD,  auth: { authdb: 'admin' } };
mongoose.connect(`mongodb://localhost/${DATABASE}`, opts, (error) => {
  if (error) {
    console.log('mongoose connect error', error);
  }
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongoose connection error:'));

// export default db;
