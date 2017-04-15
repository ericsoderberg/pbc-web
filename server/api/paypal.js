import Paypal from 'paypal-nvp-api';
import { getSession, requireSession } from './auth';
import { catcher, getPostData } from './utils';

// NOTE: This file is deprecated in favor of the all-browser REST API integration

const config = {
  mode: 'sandbox', // or 'live'
  username: process.env.PAYPAL_USER,
  password: process.env.PAYPAL_PASSWORD,
  signature: process.env.PAYPAL_SIGNATURE,
};

const paypal = Paypal(config);

// /api/paypal

export default function (router) {
  // PayPal NVP API integration, until they get the REST API fixed :(
  router.post('/paypal', (req, res) => {
    getSession(req)
    .then(requireSession)
    .then(session => getPostData(req).then(data => ({ session, data })))
    .then((context) => {
      const { data, session } = context;
      const params = {
        AMT: data.amount,
        DESC: data.formTemplateName,
        EMAIL: session.userId.email,
        CURRENCYCODE: 'USD',
        PAYMENTACTION: 'Pay',
        NOSHIPPING: 1,
        cancelUrl: data.cancelUrl,
        returnUrl: data.returnUrl,
      };
      return paypal.request('SetExpressCheckout', params);
    })
    .then((result) => {
      if (result.ACK !== 'Success') {
        console.error(result);
        throw result.L_LONGMESSAGE0;
      }
      return { token: result.TOKEN };
    })
    .then(doc => res.status(200).send(doc))
    .catch(error => catcher(error, res));
  });
}
