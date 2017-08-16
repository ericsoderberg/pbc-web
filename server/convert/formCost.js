import mongoose from 'mongoose';
import '../db';
import { updateFormCosts } from '../api/forms';

mongoose.Promise = global.Promise;

updateFormCosts({})
  .then(() => console.log('Done'))
  .catch(error => console.error(error));
