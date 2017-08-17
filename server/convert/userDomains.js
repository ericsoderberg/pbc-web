import mongoose from 'mongoose';
import '../db';

mongoose.Promise = global.Promise;

const User = mongoose.model('User');
User.find({ administratorDomainId: { $exists: true } })
  .exec()
  .then((users) => {
    const promises = [];
    users.forEach((user) => {
      user.domainIds = [user.administratorDomainId];
      user.administratorDomainId = undefined;
      // user.$unset = { administratorDomainId: '' };
      console.log('!!!', user.name, user.domainIds);
      promises.push(user.save());
    });
    return Promise.all(promises);
  })
  .then(() => console.log('Done'))
  .catch(error => console.error(error));
