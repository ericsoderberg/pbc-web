// import fs from 'fs';
import mongoose from 'mongoose';
import '../db';
import users from './users';
import messages from './messages';
import libraries from './libraries';
import events from './events';
import forms from './forms';
import pages from './pages';
import calendars from './calendars';
import domains from './domains';
import emailLists from './emailLists';
import results from './results';

mongoose.Promise = global.Promise;

Promise.resolve()
// .then(() => users())
// .then(() => messages())
// .then(() => libraries())
// .then(() => events())
// .then(() => forms())
// .then(() => pages())
// .then(() => calendars())
// .then(() => domains())
// .then(() => emailLists())
.then(() => console.log(results.log()))
.then(() => console.log(`Finished`))
.catch(error => console.log(error));
