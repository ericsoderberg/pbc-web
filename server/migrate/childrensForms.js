import mongoose from 'mongoose';
import '../db';

mongoose.Promise = global.Promise;

// Migrate childrens ministry registration forms

const FormTemplate = mongoose.model('FormTemplate');
const Form = mongoose.model('Form');

Promise.resolve({})
.then(context => FormTemplate.find({ oldId: 161 }).exec()
  .then(parentFormTemplate => ({ ...context, parentFormTemplate })))
.then(context => FormTemplate.find({ oldId: 160 }).exec()
  .then(childFormTemplate => ({ ...context, childFormTemplate })))
.then(context => Form.find({ formTemplateId: context.parentFormTemplate._id })
  .exec().then(parentForms => ({ ...context, parentForms })))
.then(context => Form.find({ formTemplateId: context.childFormTemplate._id })
  .exec().then(childForms => ({ ...context, childForms })))
.then((context) => {
  const { childForms, parentForms } = context;
  console.log('!!! have', childForms.length, parentForms.length);
})
.then(() => console.log('!!! forms done'))
.catch(error => console.log('!!! forms catch', error, error.stack));
