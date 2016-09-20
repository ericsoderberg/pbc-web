"use strict";
import mongoose, { Schema } from 'mongoose';
const { Types: { ObjectId } } = Schema;

const DATABASE = 'pbc';
const USER = 'pbc';
const PASSWORD = 'pbc'; /// !!! change to get from environment variable

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
  administrator: Boolean,
  administratorDomainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  avatar: image,
  created: Date,
  email: {type: String, required: true, unique: true},
  encryptedPassword: String,
  modified: Date,
  name: {type: String, required: true},
  path: String,
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
  formTemplateId: { type: Schema.Types.ObjectId, ref: 'FormTemplate' },   // form type
  full: Boolean,
  image: image,       // image type
  name: String,       // library type
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
  type: {
    type: String,
    enum: ['line', 'lines', 'choice', 'choices', 'count', 'instructions'],
    required: true
  },
  value: String // unused?
});

const formTemplateSectionSchema = Schema({
  dependsOnId: ObjectId,
  fields: [formTemplateFieldSchema],
  name: String
});

const formTemplateSchema = Schema({
  authenticate: Boolean,
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: {type: String, required: true, unique: true},
  sections: [formTemplateSectionSchema],
  submitLabel: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  version: Number
});

mongoose.model('FormTemplate', formTemplateSchema);

const formSchema = Schema({
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  fields: [{
    fieldId: { type: Schema.Types.ObjectId, required: true },
    optionId: ObjectId, // choice
    optionIds: [ObjectId], // choices
    value: String
  }],
  formTemplateId: { type: Schema.Types.ObjectId, ref: 'FormTemplate',
    required: true },
  modified: Date,
  name: String, // derived from appropriate field value
  paymentId: ObjectId,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
  library: { type: Schema.Types.ObjectId, ref: 'Library' },
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
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  library: String,
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
