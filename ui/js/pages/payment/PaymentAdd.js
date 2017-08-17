
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
    const { form, history, session } = this.props;
    let defaultPayment;
    if (form) {
      defaultPayment = {
        amount: form.balance,
        domainId: form.domainId,
        formIds: [form],
        sent: form.modified,
        received: moment(),
        userId: form.userId,
      };
    } else if (session && !session.userId.administrator) {
      defaultPayment = {
        domainId: session.userId.domainIds[0],
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
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      domainIds: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
};

PaymentAdd.defaultProps = {
  form: undefined,
  formId: undefined,
  session: undefined,
};

const select = (state, props) => {
  const query = props.location ? searchToObject(props.location.search) : {};
  const formId = query.formId;
  const form = (formId ? state[formId] : undefined);
  return { form, formId, session: state.session };
};

export default connect(select)(PaymentAdd);
