"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import { execFile } from 'child_process';
import '../db';
import results from './results';

// EmailList

export default function () {
  const EmailList = mongoose.model('EmailList');
  return new Promise((resolve, reject) => {
    execFile('list_lists', [], (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      return resolve(stdout.split("\n"));
    });
  })
  .then(listNames => {
    let emailListPromise = Promise.resolve();
    listNames.filter(listName => listName).forEach((listName) => {
      // process email lists sequentially
      emailListPromise = emailListPromise
      // get EmailList
      .then(() => EmailList.findOne({ name: listName }).exec())
      // create EmailList, if needed
      .then(emailList => {
        if (emailList) {
          return results.skipped('EmailList', emailList);
        } else {
          const emailList = new EmailList({ name: listName });
          return emailList.save()
          .then(emailList => results.saved('EmailList', emailList))
          .catch(error => results.errored('EmailList', emailList, error));
        }
      })
      // populate addresses
      .then(emailList => new Promise((resolve, reject) => {
        execFile('list_members', [emailList.name], (error, stdout, stderr) => {
          if (error) {
            return reject(error);
          }
          emailList.addresses = stdout.split("\n")
          .filter(a => a).map(a => ({ address: a }));
          return resolve(emailList.save());
        });
      }));
    });
    return emailListPromise;
  })
  .then(() => console.log('!!! emailLists done'))
  .catch(error => console.log('!!! emailLists catch', error, error.stack));
}
