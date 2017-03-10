import mongoose, { Schema } from 'mongoose';

mongoose.Promise = global.Promise;

const { Types: { ObjectId } } = Schema;

const DATABASE = process.env.DATABASE || 'pbc';
const USER = process.env.DATABASE_USER || 'pbc';
const PASSWORD = process.env.DATABASE_PASSWORD || 'pbc';

// Schemas

const image = {
  dark: Boolean,
  data: String,
  name: String,
  size: Number,
  type: { type: String },
};

const sessionSchema = Schema({
  loginAt: Date,
  token: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});
export const Session = mongoose.model('Session', sessionSchema);

const userSchema = Schema({
  address: String,
  administrator: Boolean,
  administratorDomainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  image,
  created: Date,
  email: { type: String, required: true, unique: true },
  encryptedPassword: String,
  modified: Date,
  name: { type: String, required: true },
  oldId: Number,
  path: { type: String, unique: true, sparse: true },
  phone: String,
  temporaryToken: String,
  text: String,
  verified: Boolean,
});

mongoose.model('User', userSchema);

const familySchema = Schema({
  adults: [{
    relation: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    verified: Boolean,
  }],
  children: [{
    birthday: Date,
    grade: String,
    name: String,
    notes: String,
  }],
  mediaConsent: Boolean,
  dismissalConsent: Boolean,
  liabilityRelease: Boolean,
  signature: String,
  signed: Date,
  created: Date,
  modified: Date,
});

mongoose.model('Family', familySchema);

const domainSchema = Schema({
  created: Date,
  modified: Date,
  name: { type: String, required: true },
});

mongoose.model('Domain', domainSchema);

// page sections

const sectionDef = {
  backgroundImage: image,
  color: String,
  full: Boolean,
};

const textSectionDef = { text: String };
const imageSectionDef = { image };
const videoSectionDef = { url: String };
const calendarSectionDef = {
  calendarId: { type: Schema.Types.ObjectId, ref: 'Calendar' },
};
const eventSectionDef = {
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  includeMap: Boolean,
  navigable: Boolean,
};
const librarySectionDef = {
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library' },
};
const formSectionDef = {
  formTemplateId: { type: Schema.Types.ObjectId, ref: 'FormTemplate' },
};
const peopleSectionDef = {
  people: [{
    id: { type: Schema.Types.ObjectId, ref: 'User' },
    image,
    text: String,
  }],
};
const pagesSectionDef = {
  pages: [{
    id: { type: Schema.Types.ObjectId, ref: 'Page' },
    image,
  }],
};
const filesSectionDef = {
  files: [{
    _id: String,
    label: String,
    name: String,
    size: Number,
    type: { type: String },
  }],
};
const mapSectionDef = {
  address: String,
};

const pageSectionSchema = Schema({
  type: { type: String },
  ...sectionDef,
  ...textSectionDef,
  ...imageSectionDef,
  ...videoSectionDef,
  ...calendarSectionDef,
  ...eventSectionDef,
  ...librarySectionDef,
  ...formSectionDef,
  ...peopleSectionDef,
  ...pagesSectionDef,
  ...filesSectionDef,
});

const pageSchema = Schema({
  align: String,
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: String,
  oldId: Number,
  path: { type: String, unique: true, sparse: true },
  public: Boolean,
  sections: [pageSectionSchema],
  // sections: [Schema(sectionDef, {
  //   discriminatorKey: 'type', _id: false, toObject: { retainKeyOrder: true }
  // })],
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

// var pageSections = pageSchema.path('sections');
//
// pageSections.discriminator('text',
//   Schema(textSectionDef), { toObject: { retainKeyOrder: true } });
// pageSections.discriminator('image', Schema(imageSectionDef, { _id: false }));
// pageSections.discriminator('video', Schema(videoSectionDef, { _id: false }));
// pageSections.discriminator('calendar',
//   Schema(calendarSectionDef, { _id: false }));
// pageSections.discriminator('event', Schema(eventSectionDef, { _id: false }));
// pageSections.discriminator('library',
//   Schema(librarySectionDef, { _id: false }));
// pageSections.discriminator('form', Schema(formSectionDef, { _id: false }));
// pageSections.discriminator('people',
//   Schema(peopleSectionDef, { _id: false }));
// pageSections.discriminator('pages', Schema(pagesSectionDef, { _id: false }));
// pageSections.discriminator('files', Schema(filesSectionDef, { _id: false }));

pageSchema.index({ name: 1 });
pageSchema.index({ name: 'text', 'sections.text': 'text' },
  { weights: { name: 5, 'sections.text': 1 } });

const Page = mongoose.model('Page', pageSchema);
Page.on('index', () => console.log('Page index ready'));

const calendarSchema = Schema({
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: { type: String, required: true },
  path: { type: String, unique: true, sparse: true },
  public: Boolean,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

mongoose.model('Calendar', calendarSchema);

const eventSectionSchema = Schema({
  type: { type: String },
  ...sectionDef,
  ...textSectionDef,
  ...mapSectionDef,
  ...imageSectionDef,
  ...videoSectionDef,
  ...formSectionDef,
  ...peopleSectionDef,
  ...filesSectionDef,
});

const eventSchema = Schema({
  address: String, // mappable
  calendarId: { type: Schema.Types.ObjectId, ref: 'Calendar' },
  created: Date,
  dates: [Date],
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  end: Date,
  // formTemplateId: { type: Schema.Types.ObjectId, ref: 'FormTemplate' },
  image,
  location: String, // room, house owner's name, etc.
  modified: Date,
  name: String,
  oldId: Number,
  path: { type: String, unique: true, sparse: true },
  // set in one-off cases
  primaryEventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  public: Boolean,
  resourceIds: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
  sections: [eventSectionSchema],
  // sections: [Schema(sectionDef, { discriminatorKey: 'type', _id: false })],
  start: Date,
  text: String, // deprecated but leave for now while upgrading to sections
  times: [{
    end: Date,
    start: Date,
  }],
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

// var eventSections = eventSchema.path('sections');
//
// eventSections.discriminator('text', Schema(textSectionDef, { _id: false }));
// eventSections.discriminator('image',
//   Schema(imageSectionDef, { _id: false }));
// eventSections.discriminator('video',
//   Schema(videoSectionDef, { _id: false }));
// eventSections.discriminator('form', Schema(formSectionDef, { _id: false }));
// eventSections.discriminator('people',
//   Schema(peopleSectionDef, { _id: false }));
// eventSections.discriminator('files',
//   Schema(filesSectionDef, { _id: false }));

eventSchema.index({ name: 'text', text: 'text' },
  { weights: { name: 5, text: 1 } });

const Event = mongoose.model('Event', eventSchema);
Event.on('index', () => console.log('Event index ready'));

const resourceSchema = Schema({
  created: Date,
  modified: Date,
  name: { type: String, required: true, unique: true },
  oldId: Number,
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

mongoose.model('Resource', resourceSchema);

const formTemplateOptionSchema = Schema({
  disabled: Boolean,
  help: String,
  limit: Number,
  name: String,
  oldId: Number,
  value: String,
});

const formTemplateFieldSchema = Schema({
  dependsOnId: ObjectId,
  discount: Boolean, // negates form field value
  help: String,
  limit: Number,
  linkedFieldId: ObjectId, // for depends
  max: Number, // for count
  min: Number, // for count
  monetary: Boolean,
  name: String,
  oldId: Number,
  options: [formTemplateOptionSchema],
  required: Boolean,
  sessionEmail: Boolean,
  sessionName: Boolean,
  type: {
    type: String,
    enum: [
      'line', 'lines', 'choice', 'choices', 'count', 'instructions',
      'date', 'number',
    ],
    required: true,
  },
  value: String, // for monetary + type='count'
});

const formTemplateSectionSchema = Schema({
  administrative: Boolean,
  child: Boolean,
  dependsOnId: ObjectId,
  fields: [formTemplateFieldSchema],
  name: String,
  oldId: Number,
});

const formTemplateSchema = Schema({
  acknowledge: Boolean,
  authenticate: Boolean,
  created: Date,
  dependsOnId: { type: Schema.Types.ObjectId, ref: 'FormTemplate' },
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  family: Boolean, // REMOVE
  modified: Date,
  name: { type: String, required: true, unique: true },
  notify: String,
  oldId: Number,
  payable: Boolean,
  payByCheckInstructions: String,
  postSubmitMessage: String,
  sections: [formTemplateSectionSchema],
  submitLabel: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  version: Number,
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
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

mongoose.model('Payment', paymentSchema);

const formSchema = Schema({
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  familyId: { type: Schema.Types.ObjectId, ref: 'Family' },
  fields: [{
    childId: { type: Schema.Types.ObjectId }, // for family based forms, REMOVE
    oldId: Number,
    optionId: ObjectId, // choice, formTemplateFieldOption
    optionIds: [ObjectId], // choices, formTemplateFieldOption
    templateFieldId: { type: Schema.Types.ObjectId, required: true },
    value: String,
  }],
  formTemplateId: {
    type: Schema.Types.ObjectId,
    ref: 'FormTemplate',
    required: true,
  },
  linkedFormId: { type: Schema.Types.ObjectId, ref: 'Form' }, // for depends
  modified: Date,
  name: String, // derived from appropriate field value
  oldId: Number,
  // This is an array in case the form is modified to increase the amount
  // and needs a subsequent payment.
  paymentIds: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  version: Number,
});

mongoose.model('Form', formSchema);

const podcastSchema = Schema({
  category: String,
  description: String,
  image,
  subCategory: String,
  subtitle: String,
  summary: String,
  title: String,
});

const librarySchema = Schema({
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: { type: String, required: true },
  path: { type: String, unique: true, sparse: true },
  podcast: podcastSchema,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

librarySchema.index({ name: 'text' });

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
    type: { type: String },
  }],
  image,
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library' },
  modified: Date,
  name: String,
  oldId: Number,
  path: { type: String, unique: true, sparse: true },
  series: Boolean,
  seriesId: { type: Schema.Types.ObjectId, ref: 'Message' },
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  videoUrl: String,
  verses: String,
});

messageSchema.index(
  { author: 'text', name: 'text', text: 'text', verses: 'text' },
  { weights: { author: 3, name: 5, text: 1, verses: 8 } },
);

const Message = mongoose.model('Message', messageSchema);
Message.on('index', () => console.log('Message index ready'));


const oldFileSchema = Schema({
  oldId: { type: String, required: true, unique: true },
  label: String,
  name: String,
  size: Number,
  type: { type: String },
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
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

mongoose.model('Site', siteSchema);

const newsletterSchema = Schema({
  address: String,
  // calendarId: { type: Schema.Types.ObjectId, ref: 'Calendar' },
  created: Date,
  date: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  eventIds: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  image,
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library' },
  modified: Date,
  name: { type: String, required: true },
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

mongoose.model('Newsletter', newsletterSchema);

const emailListSchema = Schema({
  addresses: [{
    address: String,
    state: { type: String,
      enum: ['pending', 'ok', 'disabled'],
    },
  }],
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: { type: String, required: true, unique: true },
  path: { type: String, unique: true, sparse: true },
  public: Boolean,
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

mongoose.model('EmailList', emailListSchema);

// Connection

const opts = { user: USER, pass: PASSWORD, auth: { authdb: 'admin' } };
mongoose.connect(`mongodb://localhost/${DATABASE}`, opts, (error) => {
  if (error) {
    console.error('mongoose connect error', error);
  }
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongoose connection error:'));

// export default db;
