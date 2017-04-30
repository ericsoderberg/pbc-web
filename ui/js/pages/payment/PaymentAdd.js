
import React, { Component, PropTypes } from 'react';
import { getItem, postItem, putItem } from '../../actions';
import Loading from '../../components/Loading';
import Form from '../../components/Form';
import PaymentFormContents from './PaymentFormContents';

export default class PaymentAdd extends Component {

  constructor(props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this.state = { payment: {} };
  }

  componentDidMount() {
    this._load(this.props);
  }

  _load(props) {
    const { formId } = props;
    getItem('forms', formId)
    .then(form => this.setState({ form }))
    .catch(error => console.error('!!! PaymentAdd catch', error));
  }

  _onAdd(payment) {
    const { history, onDone } = this.props;
    const { form, error } = this.state;

    if (error) {
      this.setState({ error });
    } else {
      postItem('payments', payment)
      .then(() => {
        // link payment to form
        form.paymentIds.push(form._id);
        return putItem('forms', form);
      })
      .then(() => (onDone ? onDone() : history.goBack()))
      .catch(error2 => this.setState({ error: error2 }));
    }
  }

  _onCancel() {
    const { history, onCancel } = this.props;
    if (onCancel) {
      onCancel();
    } else {
      history.goBack();
    }
  }

  render() {
    const { formId, formTemplateId, inline } = this.props;
    const { form, error, payment } = this.state;

    let result;
    if (form) {
      const FormContents = PaymentFormContents;
        // inline ? PaymentFormContentsInline : PaymentFormContents;
      result = (
        <Form title="Payment" submitLabel="Submit" inline={inline}
          action="/api/payments"
          contentsProps={{ formId, formTemplateId }}
          FormContents={FormContents} item={payment}
          onSubmit={this._onAdd} error={error}
          onCancel={this._onCancel} />
      );
    } else {
      result = <Loading />;
    }
    return result;
  }
}

PaymentAdd.propTypes = {
  formId: PropTypes.string.isRequired,
  formTemplateId: PropTypes.string.isRequired,
  history: PropTypes.any.isRequired,
  inline: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
};

PaymentAdd.defaultProps = {
  inline: false,
};
