
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Add from '../../components/Add';
import PaymentFormContents from './PaymentFormContents';
import { searchToObject } from '../../utils/Params';

const PaymentAdd = props => (
  <Add category="payments"
    history={props.history}
    contentsProps={{ formId: props.formId }}
    FormContents={PaymentFormContents}
    title="Add Payment" />
);

PaymentAdd.propTypes = {
  formId: PropTypes.string,
  history: PropTypes.any.isRequired,
};

PaymentAdd.defaultProps = {
  formId: undefined,
};

const select = (state, props) => {
  const query = props.location ? searchToObject(props.location.search) : {};
  const formId = query.formId;
  return { formId };
};

export default connect(select)(PaymentAdd);
