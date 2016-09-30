"use strict";
// import fs from 'fs';
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import '../db';
import users from './users';
import messages from './messages';
import events from './events';

Promise.resolve()
.then(() => users())
.then(() => messages())
.then(() => events())
.then(() => console.log(`!!! Finished`))
.catch(error => console.log(error));
