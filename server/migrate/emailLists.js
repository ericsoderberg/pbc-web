import mongoose from 'mongoose';
import { execFile } from 'child_process';
import '../db';
import results from './results';

mongoose.Promise = global.Promise;

// EmailList

export default function () {
  const EmailList = mongoose.model('EmailList');
  return new Promise((resolve, reject) => {
    execFile('list_lists', ['-b'], (error, stdout) => {
      if (error) {
        return reject(error);
      }
      return resolve(stdout.split('\n'));
    });
  })
  .then((listNames) => {
    let emailListPromise = Promise.resolve();
    listNames.filter(listName => listName)
    .filter(listName => listName !== 'primetime_community')
    .forEach((listName) => {
      // process email lists sequentially
      emailListPromise = emailListPromise
      // get EmailList
      .then(() => EmailList.findOne({ name: listName }).exec())
      // create EmailList, if needed
      .then((emailList) => {
        if (emailList) {
          return results.skipped('EmailList', emailList);
        }
        const emailListData = new EmailList({ name: listName, path: listName });
        return emailListData.save()
        .then(emailListSaved => results.saved('EmailList', emailListSaved))
        .catch(error => results.errored('EmailList', emailList, error));
      })
      // populate addresses
      .then(emailList => new Promise((resolve, reject) => {
        execFile('list_members', [emailList.name], (error, stdout) => {
          if (error) {
            return reject(error);
          }
          emailList.addresses = stdout.split('\n')
          .filter(a => a).map(a => ({ address: a }));
          return resolve(emailList.save());
        });
      }));
    });
    return emailListPromise;
  })
  .then(() => console.log('!!! emailLists done'))
  .catch(error => console.error('!!! emailLists catch', error, error.stack));
}
