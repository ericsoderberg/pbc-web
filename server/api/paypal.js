import Paypal from 'paypal-nvp-api';
import { authorize } from './auth';
import { getPostData } from './utils';

const config = {
  mode: 'sandbox', // or 'live'
  username: 'eric_soderberg-facilitator_api1.pbc.org',
  password: '24WNG8MUBE9NE3LJ',
  signature: 'An5ns1Kso7MWUdW4ErQKJJJ4qi4-AELF3GvW.UZOsm3mRrFahluaGxI-',
};

const paypal = Paypal(config);

// /api/paypal

export default function (router) {
  // PayPal NVP API integration, until they get the REST API fixed :(
  router.post('/paypal', (req, res) => {
    authorize(req, res)
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
    .catch((error) => {
      console.error('!!! post paypal catch', error);
      res.status(400).json(error);
    });
  });
}
