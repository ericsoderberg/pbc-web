"use strict";
import express from 'express';
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import './db';
import nodemailer from 'nodemailer';
import { markdown } from 'nodemailer-markdown';

const TRANSPORT_OPTIONS = {
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT || 25,
  tls: { rejectUnauthorized: false }
};
if (process.env.SMTP_USER) {
  TRANSPORT_OPTIONS.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  };
}
const transporter = nodemailer.createTransport(TRANSPORT_OPTIONS);
transporter.use('compile', markdown());

const router = express.Router();

import sessions from './api/sessions';
sessions(router);
import site from './api/site';
site(router);
import users from './api/users';
users(router, transporter);
import domains from './api/domains';
domains(router);
import resources from './api/resources';
resources(router);
import formTemplates from './api/formTemplates';
formTemplates(router);
import forms from './api/forms';
forms(router);
import payments from './api/payments';
payments(router);
import emailLists from './api/emailLists';
emailLists(router);
import libraries from './api/libraries';
libraries(router);
import messages from './api/messages';
messages(router);
import events from './api/events';
events(router);
import calendar from './api/calendar';
calendar(router);
import newsletters from './api/newsletters';
newsletters(router, transporter);
import files from './api/files';
files(router);
import search from './api/search';
search(router);
import pages from './api/pages';
pages(router);

module.exports = router;
