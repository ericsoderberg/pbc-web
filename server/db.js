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
  avatar: image,
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
  color: String,
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },  // event type
  formTemplateId: { type: Schema.Types.ObjectId, ref: 'FormTemplate' }, // form type
  full: Boolean,
  image: image,       // image type
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library' }, // library type
  navigable: Boolean, // event type
  pages: [{           // pages type
    id: { type: Schema.Types.ObjectId, ref: 'Page' },
    image: image
  }],
  text: String,       // text type
  type: { type: String,
    enum: ['text', 'image', 'event', 'library', 'form', 'person', 'pages', 'video']
  },
  url: String,        // video type
  userId: { type: Schema.Types.ObjectId, ref: 'User' }    // person type
});

const pageSchema = Schema({
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: String,
  oldId: Number,
  path: String,
  sections: [pageSectionSchema],
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Page', pageSchema);

const eventSchema = Schema({
  address: String, // mappable
  calendar: String,
  created: Date,
  dates: [Date],
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  end: Date,
  location: String, // room, house owner's name, etc.
  modified: Date,
  name: String,
  oldId: Number,
  path: String,
  primaryEventId: { type: Schema.Types.ObjectId, ref: 'Event' }, // set in one-off cases
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
  help: String,
  limit: Number,
  monetary: Boolean,
  name: String,
  oldId: Number,
  options: [formTemplateOptionSchema],
  required: Boolean,
  scholarship: Boolean, // negates form field value
  type: {
    type: String,
    enum: ['line', 'lines', 'choice', 'choices', 'count', 'instructions'],
    required: true
  },
  value: String // for monetary + type='count'
});

const formTemplateSectionSchema = Schema({
  dependsOnId: ObjectId,
  fields: [formTemplateFieldSchema],
  name: String,
  oldId: Number
});

const formTemplateSchema = Schema({
  authenticate: Boolean,
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: {type: String, required: true, unique: true},
  oldId: Number,
  payable: Boolean,
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
  method: String,
  modified: Date,
  oldId: Number,
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
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
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

mongoose.model('Message', messageSchema);

const oldFileSchema = Schema({
  oldId: {type: String, required: true, unique: true},
  name: String,
  size: Number,
  type: { type: String }
});

mongoose.model('OldFile', oldFileSchema);

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
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library' },
  modified: Date,
  name: {type: String, required: true, unique: true},
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
