"use strict";
// import fs from 'fs';
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import '../db';
import users from './users';
import messages from './messages';
import libraries from './libraries';
import events from './events';
import forms from './forms';
import results from './results';

Promise.resolve()
// .then(() => users())
.then(() => messages())
.then(() => libraries())
// .then(() => events())
// .then(() => forms())
.then(() => console.log(results.log()))
.then(() => console.log(`!!! Finished`))
.catch(error => console.log(error));
