import mongoose from 'mongoose';
import '../db';

mongoose.Promise = global.Promise;

const Payment = mongoose.model('Payment');
Payment.find({})
.populate({ path: 'userId', select: 'email name' })
.exec()
.then((payments) => {
  payments.forEach((payment) => {
    if (payment.userId && !payment.name) {
      if (payment.userId.name && payment.userId.name !== '?') {
        payment.name = payment.userId.name;
      } else {
        payment.name = payment.userId.email;
      }
      payment.save();
    }
  });
})
.catch(error => console.error(error));
