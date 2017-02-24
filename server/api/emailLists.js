"use strict";
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
import { execFile, spawn } from 'child_process';
import { authorize, authorizedForDomain } from './auth';
import { unsetDomainIfNeeded } from './domains';
import register from './register';

// const MAILMAN_DIR = process.env.MAILMAN_DIR || '/usr/lib/mailman/bin';
const MAILMAN_ADMIN = process.env.MAILMAN_ADMIN || 'eric_soderberg@pbc.org';
const MAILMAN_ADMIN_PASSWORD = process.env.MAILMAN_ADMIN_PASSWORD || '12345678';

const addList = (listName) => {
  return new Promise((resolve, reject) => {
    execFile('newlist', ['-a', listName, MAILMAN_ADMIN, MAILMAN_ADMIN_PASSWORD],
      (error, stdout, stderr) => {
        if (error) {
          console.log('!!! new error', error);
          return reject(error);
        }
        return resolve();
      });
  });
};

const removeList = (name) => {
  return new Promise((resolve, reject) => {
    execFile('rmlist', ['-a', name], (error, stdout, stderr) => {
      if (error) {
        console.log('!!! rm error', error);
        return reject(error);
      }
      return resolve();
    });
  });
};

const addAddresses = (listName, addresses) => {
  return new Promise((resolve, reject) => {
    const cmd = spawn('add_members', ['-r', '-', listName]);
    cmd.stdin.write(addresses.join("\n"));
    cmd.stdin.end();
    cmd.on('close', (code) => {
      if (code !== 0) {
        console.log('!!! add_members process exited with', code);
        return reject(code);
      }
      return resolve();
    });
  });
};

const removeAddresses = (listName, addresses) => {
  return new Promise((resolve, reject) => {
    const cmd = spawn('remove_members', ['-f', '-', listName]);
    cmd.stdin.write(addresses.join("\n"));
    cmd.stdin.end();
    cmd.on('close', (code) => {
      if (code !== 0) {
        console.log('!!! remove_members process exited with', code);
        return reject(code);
      }
      return resolve();
    });
  });
};

const checkAddresses = (listName) => {
  return new Promise((resolve, reject) => {
    execFile('list_members', ['-n', listName], (error, stdout, stderr) => {
      if (error) {
        console.log('!!! check error', error);
        return reject(error);
      }
      return resolve(stdout.split("\n").filter(a => a));
    });
  });
};

// /api/email-lists

const populateEmailList = (emailList) => {
  const User = mongoose.model('User');

  let promises = [Promise.resolve(emailList)];
  emailList.addresses.forEach(address => {
    promises.push(User.findOne({ email: address.address })
      .select('name').exec());
  });

  return Promise.all(promises)
  .then(docs => {
    let emailListData = docs[0].toObject();
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
  .then(emailList => {
    // determine address state
    return checkAddresses(emailList.name)
    .then(disabledAddresses => {
      emailList.addresses = emailList.addresses.map(address => ({
        ...address,
        state: (disabledAddresses.indexOf(address.address) === -1 ?
          'ok' : 'disabled')
      }));
      return emailList;
    });
  });
};

export default function (router) {
  register(router, {
    category: 'email-lists',
    modelName: 'EmailList',
    index: {
      authorize: authorizedForDomain
    },
    get: {
      populate: [
        { path: 'formTemplateId', select: 'name path' }
      ],
      transformOut: (emailList, req) => {
        if (emailList) {
          return populateEmailList(emailList);
        }
        return emailList;
      }
    },
    post: {
      transformOut: (emailList, req) => {
        return addList(emailList.name)
        .then(() => emailList);
      }
    },
    put: {
      transformIn: unsetDomainIfNeeded
    },
    delete: {
      deleteRelated: (emailList, req) => {
        return removeList(emailList.name)
        .then(() => emailList);
      }
    }
  });

  router.post('/email-lists/:id/subscribe', (req, res) => {
    authorize(req, res)
    .then(session => {
      const id = req.params.id;
      const EmailList = mongoose.model('EmailList');
      return EmailList.findOne({ _id: id }).exec();
    })
    .then(doc => {
      // normalize addresses
      const addresses = req.body.map(a => (
        typeof a === 'string' ? { address: a } : a
      ));
      addresses.forEach(address => {
        if (! doc.addresses.some(a => a.address === address.address)) {
          doc.addresses.push(address);
        }
      });
      doc.modified = new Date();
      return doc.save();
    })
    .then(doc => addAddresses(doc.name, req.body))
    .then(doc => res.status(200).send())
    .catch(error => res.status(400).json(error));
  });

  router.post('/email-lists/:id/unsubscribe', (req, res) => {
    authorize(req, res)
    .then(session => {
      const id = req.params.id;
      const EmailList = mongoose.model('EmailList');
      return EmailList.findOne({ _id: id }).exec();
    })
    .then(doc => {
      // normalize addresses
      const addresses = req.body.map(a => (
        typeof a === 'string' ? { address: a } : a
      ));
      addresses.forEach(address => {
        doc.addresses =
          doc.addresses.filter(a => a.address !== address.address);
      });
      doc.modified = new Date();
      return doc.save();
    })
    .then(doc => removeAddresses(doc.name, req.body))
    .then(doc => res.status(200).send())
    .catch(error => res.status(400).json(error));
  });
}
