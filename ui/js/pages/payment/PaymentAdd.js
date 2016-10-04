"use strict";
import Add from '../../components/Add';
import PaymentFormContents from './PaymentFormContents';

export default class PaymentAdd extends Add {};

PaymentAdd.defaultProps = {
  category: 'payments',
  FormContents: PaymentFormContents,
  title: 'Add Payment'
};
