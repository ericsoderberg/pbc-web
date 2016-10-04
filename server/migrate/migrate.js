"use strict";
// import fs from 'fs';
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import '../db';
import users from './users';
import messages from './messages';
import events from './events';
import forms from './forms';

Promise.resolve()
// .then(() => users())
// .then(() => messages())
// .then(() => events())
.then(() => forms())
.then(() => console.log(`!!! Finished`))
.catch(error => console.log(error));
