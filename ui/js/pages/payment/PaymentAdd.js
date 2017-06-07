
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import Add from '../../components/Add';
import PaymentFormContents from './PaymentFormContents';
import { searchToObject } from '../../utils/Params';
import { loadItem, unloadItem } from '../../actions';

class PaymentAdd extends Component {

  componentDidMount() {
    const { dispatch, formId } = this.props;
    if (formId) {
      dispatch(loadItem('forms', formId, {
        full: true,
        populate: 'formTemplateId',
      }));
    }
  }

  componentWillUnmount() {
    const { dispatch, formId } = this.props;
    if (formId) {
      dispatch(unloadItem(formId));
    }
  }

  render() {
    const { form, history } = this.props;
    let defaultPayment;
    if (form) {
      defaultPayment = {
        amount: form.totalCost - form.paidAmount,
        formIds: [form],
        sent: form.modified,
        received: moment(),
        userId: form.userId,
      };
    }
    return (
      <Add category="payments"
        default={defaultPayment}
        history={history}
        FormContents={PaymentFormContents}
        title="Add Payment" />
    );
  }
}

PaymentAdd.propTypes = {
  dispatch: PropTypes.func.isRequired,
  form: PropTypes.object,
  formId: PropTypes.string,
  history: PropTypes.any.isRequired,
};

PaymentAdd.defaultProps = {
  form: undefined,
  formId: undefined,
};

const select = (state, props) => {
  const query = props.location ? searchToObject(props.location.search) : {};
  const formId = query.formId;
  const form = (formId ? state[formId] : undefined);
  return { form, formId };
};

export default connect(select)(PaymentAdd);
