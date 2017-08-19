import mongoose from 'mongoose';
import '../db';

mongoose.Promise = global.Promise;

const Payment = mongoose.model('Payment');
const Form = mongoose.model('Form');
Payment.find({})
  .populate({ path: 'userId', select: 'email name' })
  .exec()
  .then((payments) => {
    const promises = [];
    payments.forEach((payment) => {
      promises.push(Form.find({ paymentIds: payment._id })
        .exec()
        .then((forms) => {
          if (forms.length > 0) {
            const form = forms[0];
            let modified;
            if (form.domainId && !form.domainId.equals(payment.domainId)) {
              payment.domainId = form.domainId;
              modified = true;
            }
            if (form.formTemplateId &&
              !form.formTemplateId.equals(payment.formTemplateId)) {
              payment.formTemplateId = form.formTemplateId;
              modified = true;
            }
            if (modified) {
              console.log('!!!', payment._id, payment.formTemplateId);
              return payment.save();
            }
          }
          return Promise.resolve();
        }));
    });
    return Promise.all(promises);
  })
  .then(() => console.log('Done'))
  .catch(error => console.error(error));
