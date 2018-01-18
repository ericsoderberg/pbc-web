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
    execFile(
      'newlist',
      ['-a', listName, MAILMAN_ADMIN, MAILMAN_ADMIN_PASSWORD],
      (error, stdout, stderr) => {
        if (error) {
          console.error('!!! new error', error, stderr);
          return reject(error);
        }
        return resolve();
      },
    );
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

const updateList = (listName, moderateSenders) => (
  new Promise((resolve, reject) => {
    execFile(
      'withlist',
      ['-r', 'set_mod', listName, (moderateSenders ? '-s' : '-u'), '-a'],
      (error, stdout, stderr) => {
        if (error) {
          console.error('!!! set moderation error', error, stderr);
          return reject(error);
        }
        return resolve();
      },
    );
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
  new Promise((resolve) => {
    execFile('list_members', ['-n', listName], (error, stdout, stderr) => {
      if (error) {
        console.error('!!! check error', error, stderr);
        return resolve([]);
      }
      return resolve(stdout.split('\n').filter(a => a));
    });
  })
);

const getModerators = listName => (
  new Promise((resolve) => {
    execFile('list_owners', ['-m', listName], (error, stdout, stderr) => {
      if (error) {
        console.error('!!! get moderators error', error, stderr);
        return resolve([]);
      }
      return resolve(stdout.split('\n').filter(a => a));
    });
  })
);

const getHeldMessages = listName => (
  new Promise((resolve) => {
    execFile('list_requests', [`--list=${listName}`, '--verbose'], (error, stdout, stderr) => {
      if (error) {
        console.error('!!! get held error', error, stderr);
        return resolve([]);
      }
      const heldMessages = [];
      let message;
      stdout.split('\n').forEach((line) => {
        let match = line.match(/^From: (\S+) on (.+)$/);
        if (match) {
          message = { from: match[1], date: match[2] };
          return;
        }
        match = line.match(/^Subject: (.+)$/);
        if (match) {
          message.subject = match[1];
          return;
        }
        match = line.match(/^Cause: (.+)$/);
        if (match) {
          message.cause = match[1];
          return;
        }
        if (message) {
          message.uri = `/api/email-lists/${listName}/${line.trim()}`;
          heldMessages.push(message);
          message = undefined;
        }
      });
      return resolve(heldMessages);
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
    ))
    .then(emailListPopulated => (
      // get moderators
      getModerators(emailListPopulated.name)
        .then((moderators) => {
          emailListPopulated.moderators = moderators;
          return emailListPopulated;
        })
    ))
    .then(emailListPopulated => (
      // get moderators
      getHeldMessages(emailListPopulated.name)
        .then((heldMessages) => {
          emailListPopulated.heldMessages = heldMessages;
          return emailListPopulated;
        })
    ));
};

export function subscribe(id, addresses) {
  const EmailList = mongoose.model('EmailList');
  return EmailList.findOne({ _id: id }).exec()
    .then((emailList) => {
      let updated = false;
      addresses.map(a => (typeof a === 'string' ? { address: a } : a))
        .forEach((address) => {
          if (!emailList.addresses.some(a =>
            a.address.toLowerCase() === address.address.toLowerCase())) {
            emailList.addresses.push({
              ...address,
              address: address.address.toLowerCase(),
            });
            updated = true;
          }
        });
      if (updated) {
        emailList.modified = new Date();
        return emailList.save()
          .then(() => addAddresses(emailList.name, addresses));
      }
      return emailList;
    });
}

export function unsubscribe(id, addresses) {
  const EmailList = mongoose.model('EmailList');
  return EmailList.findOne({ _id: id }).exec()
    .then((emailList) => {
      let updated = false;
      addresses.map(a => (typeof a === 'string' ? { address: a } : a))
        .forEach((address) => {
          if (emailList.addresses.some(a =>
            a.address.toLowerCase() === address.address.toLowerCase())) {
            emailList.addresses =
              emailList.addresses.filter(a =>
                a.address.toLowerCase() !== address.address.toLowerCase());
            updated = true;
          }
        });
      if (updated) {
        emailList.modified = new Date();
        return emailList.save()
          .then(() => removeAddresses(emailList.name, addresses));
      }
      return emailList;
    });
}

export default function (router) {
  router.get('/email-lists/:id.txt', (req, res) => {
    const EmailList = mongoose.model('EmailList');
    getSession(req)
      .then(requireSomeAdministrator)
      .then((session) => {
        const { params: { id } } = req;
        return EmailList.findOne({ _id: id, ...authorizedForDomain(session) })
          .exec()
          .then(emailList => ({ emailList, session }));
      })
      .then(({ emailList }) => {
        res.attachment(`${emailList.name}.txt`);
        res.end(emailList.addresses.map(a => a.address).join('\n'));
      })
      .catch(error => catcher(error, res));
  });

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
      transformOut: emailList => (
        updateList(emailList.name, emailList.membersCanSend === false)
          .then(() => emailList)
      ),
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
        const { params: { id } } = req;
        return subscribe(id, req.body);
      })
      .then(() => res.status(200).send())
      .catch(error => catcher(error, res));
  });

  router.post('/email-lists/:id/unsubscribe', (req, res) => {
    getSession(req)
      .then(requireSession)
      .then(() => {
        const { params: { id } } = req;
        return unsubscribe(id, req.body);
      })
      .then(() => res.status(200).send())
      .catch(error => catcher(error, res));
  });
}
