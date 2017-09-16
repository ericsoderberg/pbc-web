import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { markdown } from 'nodemailer-markdown';

import './db';
import auditLog from './api/auditLog';
import calendars from './api/calendars';
import domains from './api/domains';
import email from './api/email';
import emailLists from './api/emailLists';
import events from './api/events';
import files from './api/files';
import forms from './api/forms';
import formTemplates from './api/formTemplates';
import libraries from './api/libraries';
import messages from './api/messages';
import newsletters from './api/newsletters';
import pages from './api/pages';
import payments from './api/payments';
import paypal from './api/paypal';
import resources from './api/resources';
import search from './api/search';
import sessions from './api/sessions';
import site from './api/site';
import users from './api/users';

mongoose.Promise = global.Promise;

const TRANSPORT_OPTIONS = {
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT || 25,
  tls: { rejectUnauthorized: false },
  // logger: true,
  // debug: true
};
if (process.env.SMTP_USER) {
  TRANSPORT_OPTIONS.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  };
}
const transporter = nodemailer.createTransport(TRANSPORT_OPTIONS);
transporter.use('compile', markdown());

transporter.verify()
  .then(() => console.log('Email is sendable'))
  .catch(error => console.error('!!! Email verification error', error));

const router = express.Router();

sessions(router);
site(router);
users(router, transporter);
domains(router);
resources(router);
formTemplates(router, transporter);
forms(router, transporter);
payments(router);
paypal(router);
emailLists(router);
email(router);
libraries(router);
messages(router);
events(router);
calendars(router);
newsletters(router, transporter);
files(router);
auditLog(router);
search(router);
pages(router);

module.exports = router;
