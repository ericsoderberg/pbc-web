
import React from 'react';
import Show from '../../components/Show';

const PaymentContents = () => (
  <div>TBD</div>
);

export default class Payment extends Show {}

Payment.defaultProps = {
  category: 'payments',
  Contents: PaymentContents,
};
