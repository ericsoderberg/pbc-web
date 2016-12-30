"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem, postItem } from '../../actions';
import Loading from '../../components/Loading';
import Form from '../../components/Form';
import PaymentFormContents from './PaymentFormContents';

class PaymentFormContentsInline extends PaymentFormContents {};
PaymentFormContentsInline.defaultProps = { full: false };

export default class PaymentAdd extends Component {

  constructor (props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this.state = { payment: {} };
  }

  componentDidMount () {
    this._load(this.props);
  }

  _load (props) {
    const { formId } = props;
    getItem('forms', formId)
    .then(form => this.setState({ form }))
    .catch(error => console.log("!!! PaymentAdd catch", error));
  }

  _onAdd (payment) {
    const { onDone } = this.props;
    const { form, error } = this.state;

    if (error) {
      this.setState({ error: error });
    } else {
      postItem('payments', payment)
      .then(payment => {
        // link payment to form
        form.paymentIds.push(form._id);
        return putItem('forms', form);
      })
      .then(response => (onDone ? onDone() : this.context.router.goBack()))
      .catch(error => this.setState({ error: error }));
    }
  }

  _onCancel () {
    const { onCancel } = this.props;
    if (onCancel) {
      onCancel();
    } else {
      this.context.router.goBack();
    }
  }

  render () {
    const { formId, formTemplateId, inline } = this.props;
    const { form, error, payment } = this.state;

    let result;
    if (form) {

      const FormContents =
        inline ? PaymentFormContentsInline : PaymentFormContents;
      result = (
        <Form title="Payment" submitLabel="Submit" inline={inline}
          action={`/api/payments`}
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
};

PaymentAdd.propTypes = {
  formId: PropTypes.string.isRequired,
  formTemplateId: PropTypes.string.isRequired,
  inline: PropTypes.bool,
  onCancel: PropTypes.func,
  onDone: PropTypes.func
};

PaymentAdd.contextTypes = {
  router: PropTypes.any
};
