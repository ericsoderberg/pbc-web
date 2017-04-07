import mongoose from 'mongoose';
import { execFile, spawn } from 'child_process';
import {
  getSession, authorizedForDomain, requireSession,
  requireSomeAdministrator,
} from './auth';
import { unsetDomainIfNeeded } from './domains';
import register from './register';
import { catcher } from './utils';

mongoose.Promise = global.Promise;

// const MAILMAN_DIR = process.env.MAILMAN_DIR || '/usr/lib/mailman/bin';
const MAILMAN_ADMIN = process.env.MAILMAN_ADMIN || 'eric_soderberg@pbc.org';
const MAILMAN_ADMIN_PASSWORD = process.env.MAILMAN_ADMIN_PASSWORD || '12345678';

const addList = listName => (
  new Promise((resolve, reject) => {
    execFile('newlist',
      ['-a', listName, MAILMAN_ADMIN, MAILMAN_ADMIN_PASSWORD],
      (error, stdout, stderr) => {
        if (error) {
          console.error('!!! new error', error, stderr);
          return reject(error);
        }
        return resolve();
      });
  })
);

const removeList = name => (
  new Promise((resolve, reject) => {
    execFile('rmlist', ['-a', name], (error, stdout, stderr) => {
      if (error) {
        console.error('!!! rm error', error, stderr);
        return reject(error);
      }
      return resolve();
    });
  })
);

const addAddresses = (listName, addresses) => (
  new Promise((resolve, reject) => {
    const cmd = spawn('add_members', ['-r', '-', listName]);
    cmd.stdin.write(addresses.join('\n'));
    cmd.stdin.end();
    cmd.on('close', (code) => {
      if (code !== 0) {
        console.error('!!! add_members process exited with', code);
        return reject(code);
      }
      return resolve();
    });
  })
);

const removeAddresses = (listName, addresses) => (
  new Promise((resolve, reject) => {
    const cmd = spawn('remove_members', ['-f', '-', listName]);
    cmd.stdin.write(addresses.join('\n'));
    cmd.stdin.end();
    cmd.on('close', (code) => {
      if (code !== 0) {
        console.error('!!! remove_members process exited with', code);
        return reject(code);
      }
      return resolve();
    });
  })
);

const checkAddresses = listName => (
  new Promise((resolve, reject) => {
    execFile('list_members', ['-n', listName], (error, stdout, stderr) => {
      if (error) {
        console.error('!!! check error', error, stderr);
        return reject(error);
      }
      return resolve(stdout.split('\n').filter(a => a));
    });
  })
);

const prepareEmailList = (data) => {
  data = unsetDomainIfNeeded(data);
  if (!data.path) {
    delete data.path;
    if (!data.$unset) {
      data.$unset = {};
    }
    data.$unset.path = '';
  }
  return data;
};

// /api/email-lists

const populateEmailList = (emailList) => {
  const User = mongoose.model('User');

  const promises = [Promise.resolve(emailList)];
  emailList.addresses.forEach((address) => {
    promises.push(User.findOne({ email: address.address })
      .select('name').exec());
  });

  return Promise.all(promises)
  .then((docs) => {
    const emailListData = docs[0].toObject();
    emailListData.addresses.forEach((address, index) => {
      const user = docs[1 + index];
      if (user) {
        address.userId = { _id: user._id, name: user.name };
      }
    });
    emailListData.addresses.sort((a, b) => {
      const aa = a.address.toLowerCase();
      const ba = b.address.toLowerCase();
      return (aa < ba ? -1 : (aa > ba ? 1 : 0));
    });
    return emailListData;
  })
  .then(emailListPopulated => (
    // determine address state
    checkAddresses(emailListPopulated.name)
    .then((disabledAddresses) => {
      emailListPopulated.addresses = emailListPopulated.addresses.map(address => ({
        ...address,
        state: (disabledAddresses.indexOf(address.address) === -1 ?
          'ok' : 'disabled'),
      }));
      return emailListPopulated;
    })
  ));
};

export default function (router) {
  register(router, {
    category: 'email-lists',
    modelName: 'EmailList',
    index: {
      authorization: requireSomeAdministrator,
      filterAuthorized: authorizedForDomain,
    },
    get: {
      authorization: requireSomeAdministrator,
      populate: [
        { path: 'formTemplateId', select: 'name path' },
      ],
      transformOut: (emailList) => {
        if (emailList) {
          return populateEmailList(emailList);
        }
        return emailList;
      },
    },
    post: {
      authorization: requireSomeAdministrator,
      transformOut: emailList => (
        addList(emailList.name)
        .then(() => emailList)
      ),
    },
    put: {
      authorization: requireSomeAdministrator,
      transformIn: prepareEmailList,
    },
    delete: {
      authorization: requireSomeAdministrator,
      deleteRelated: emailList => (
        removeList(emailList.name)
        .then(() => emailList)
      ),
    },
  });

  router.post('/email-lists/:id/subscribe', (req, res) => {
    getSession(req)
    .then(requireSession)
    .then(() => {
      const id = req.params.id;
      const EmailList = mongoose.model('EmailList');
      return EmailList.findOne({ _id: id }).exec();
    })
    .then((doc) => {
      // normalize addresses
      const addresses = req.body.map(a => (
        typeof a === 'string' ? { address: a } : a
      ));
      addresses.forEach((address) => {
        if (!doc.addresses.some(a =>
          a.address.toLowerCase() === address.address.toLowerCase())) {
          doc.addresses.push({
            ...address,
            address: address.address.toLowerCase(),
          });
        }
      });
      doc.modified = new Date();
      return doc.save();
    })
    .then(doc => addAddresses(doc.name, req.body))
    .then(() => res.status(200).send())
    .catch(error => catcher(error, res));
  });

  router.post('/email-lists/:id/unsubscribe', (req, res) => {
    getSession(req)
    .then(requireSession)
    .then(() => {
      const id = req.params.id;
      const EmailList = mongoose.model('EmailList');
      return EmailList.findOne({ _id: id }).exec();
    })
    .then((doc) => {
      // normalize addresses
      const addresses = req.body.map(a => (
        typeof a === 'string' ? { address: a } : a
      ));
      addresses.forEach((address) => {
        doc.addresses =
          doc.addresses.filter(a =>
            a.address.toLowerCase() !== address.address.toLowerCase());
      });
      doc.modified = new Date();
      return doc.save();
    })
    .then(doc => removeAddresses(doc.name, req.body))
    .then(() => res.status(200).send())
    .catch(error => catcher(error, res));
  });
}
