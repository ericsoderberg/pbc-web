import mongoose, { Schema } from 'mongoose';

mongoose.Promise = global.Promise;

const { Types: { ObjectId } } = Schema;

const DATABASE = process.env.DATABASE || 'pbc';
const USER = process.env.DATABASE_USER || 'pbc';
const PASSWORD = process.env.DATABASE_PASSWORD || 'pbc';

// Schemas

const PATH_TYPE = {
  type: String,
  unique: true,
  sparse: true,
  validate: {
    validator: v => (!v || /^[a-z0-9-]+$/.test(v)),
    message: 'a-z, 0-9, or -',
  },
};

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
  // administratorDomainId is deprecated
  administratorDomainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  domainIds: [{ type: Schema.Types.ObjectId, ref: 'Domain' }],
  image,
  created: Date,
  email: { type: String, required: true, unique: true },
  encryptedPassword: String,
  modified: Date,
  name: { type: String, required: true },
  oldId: Number,
  path: PATH_TYPE,
  phone: String,
  temporaryToken: String,
  text: String,
  verified: Boolean,
});

mongoose.model('User', userSchema);

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
  omitRecurring: Boolean,
};
const eventSectionDef = {
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  includeMap: Boolean,
  navigable: Boolean,
  summary: String,
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
    summary: String,
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
  path: PATH_TYPE,
  pathAlias: PATH_TYPE,
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

pageSchema.index({ modified: 1, name: 1 });
pageSchema.index(
  { name: 'text', 'sections.text': 'text' },
  { weights: { name: 5, 'sections.text': 1 } },
);

const Page = mongoose.model('Page', pageSchema);
Page.on('index', () => console.log('Page index ready'));

const calendarSchema = Schema({
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: { type: String, required: true },
  path: PATH_TYPE,
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
  ...librarySectionDef,
  ...videoSectionDef,
  ...formSectionDef,
  ...peopleSectionDef,
  ...filesSectionDef,
});

const eventSchema = Schema({
  address: String, // mappable
  align: String,
  allDay: Boolean,
  calendarId: { type: Schema.Types.ObjectId, ref: 'Calendar' },
  color: String,
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
  path: PATH_TYPE,
  // set in one-off cases
  primaryEventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  public: Boolean,
  resourceIds: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
  sections: [eventSectionSchema],
  // sections: [Schema(sectionDef, { discriminatorKey: 'type', _id: false })],
  setup: Number,
  start: Date,
  teardown: Number,
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

eventSchema.index(
  { name: 'text', 'sections.text': 'text' },
  { weights: { name: 5, 'sections.text': 1 } },
);

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
  required: Boolean,
  value: String,
});

const formTemplateFieldSchema = Schema({
  dependsOnId: ObjectId, // form field or field option
  discount: Boolean, // negates form field value
  help: String,
  limit: Number,
  linkedFieldId: ObjectId,
  max: Number, // for count
  min: Number, // for count
  monetary: Boolean,
  name: String,
  oldId: Number,
  options: [formTemplateOptionSchema],
  required: Boolean,
  linkToUserProperty: String,
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
  dependsOnId: ObjectId, // form field or field option
  fields: [formTemplateFieldSchema],
  name: String,
  oldId: Number,
});

const formTemplateSchema = Schema({
  acknowledge: Boolean,
  acknowledgeMessage: String,
  anotherLabel: String,
  authenticate: Boolean,
  created: Date,
  linkedFormTemplateId: { type: Schema.Types.ObjectId, ref: 'FormTemplate' },
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  emailListId: { type: Schema.Types.ObjectId, ref: 'EmailList' },
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
  formTemplateId: {
    type: Schema.Types.ObjectId,
    ref: 'FormTemplate',
  },
  name: String, // derived from user name at time of submittal
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
  cost: {
    balance: Number,
    paid: Number,
    received: Number,
    total: Number,
    unreceived: Number,
  },
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  fields: [{
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
  linkedFormId: { type: Schema.Types.ObjectId, ref: 'Form' },
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
  category: { type: String, required: true },
  description: { type: String, required: true },
  image,
  subCategory: String,
  subtitle: String,
  summary: String,
  title: { type: String, required: true },
});

const librarySchema = Schema({
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: { type: String, required: true },
  path: PATH_TYPE,
  podcast: podcastSchema,
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

librarySchema.index(
  { name: 'text', text: 'text' },
  { weights: { name: 5, text: 1 } },
);

const Library = mongoose.model('Library', librarySchema);
Library.on('index', () => console.log('Library index ready'));

const messageSchema = Schema({
  author: String,
  created: Date,
  color: String,
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
  path: PATH_TYPE,
  series: Boolean,
  seriesId: { type: Schema.Types.ObjectId, ref: 'Message' },
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  videoUrl: String,
  verses: String,
});

messageSchema.index(
  { author: 'text', name: 'text', text: 'text', verses: 'text' },
  { weights: { author: 15, name: 5, text: 1, verses: 10 } },
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
  timezone: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

mongoose.model('Site', siteSchema);

const newsletterSectionSchema = Schema({
  type: { type: String },
  ...sectionDef,
  ...textSectionDef,
  ...imageSectionDef,
  ...calendarSectionDef,
  ...eventSectionDef,
  ...librarySectionDef,
  ...pagesSectionDef,
  ...filesSectionDef,
});

const newsletterSchema = Schema({
  // address: String,
  // calendarId: { type: Schema.Types.ObjectId, ref: 'Calendar' },
  color: String,
  created: Date,
  date: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  // eventIds: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  // image,
  // libraryId: { type: Schema.Types.ObjectId, ref: 'Library' },
  modified: Date,
  name: { type: String, required: true },
  sections: [newsletterSectionSchema],
  // text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

mongoose.model('Newsletter', newsletterSchema);

const emailListSchema = Schema({
  addresses: [{
    address: String,
    state: {
      type: String,
      enum: ['pending', 'ok', 'disabled'],
    },
  }],
  created: Date,
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
  modified: Date,
  name: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: v => (!v || /^[a-z0-9-]+$/.test(v)),
      message: 'a-z, 0-9, or -',
    },
  },
  path: PATH_TYPE,
  public: Boolean,
  text: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

mongoose.model('EmailList', emailListSchema);

// Connection

const opts = { useMongoClient: true, authSource: 'admin' };
mongoose.connect(`mongodb://${USER}:${PASSWORD}@localhost/${DATABASE}`, opts, (error) => {
  if (error) {
    console.error('mongoose connect error', error);
  }
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongoose connection error:'));

// export default db;
