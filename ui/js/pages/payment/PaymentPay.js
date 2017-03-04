import React, { Component, PropTypes } from 'react';
import { getItem, postItem, putItem } from '../../actions';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import FormError from '../../components/FormError';
import Button from '../../components/Button';
import FormState from '../../utils/FormState';
import PaymentFormContents from './PaymentFormContents';

let paypalLoaded = false;

class PaymentPay extends Component {

  constructor(props) {
    super(props);
    this._setItem = this._setItem.bind(this);
    this._paypalPayment = this._paypalPayment.bind(this);
    this._onAuthorize = this._onAuthorize.bind(this);
    this._onAdd = this._onAdd.bind(this);
    this._onCancel = this._onCancel.bind(this);
    const payment = { method: 'paypal' };
    this.state = { formState: new FormState(payment, this._setItem) };
  }

  componentDidMount() {
    this._load(this.props);

    // add paypal
    if (!paypalLoaded) {
      paypalLoaded = true;
      const script = document.createElement('script');
      script.src = '//www.paypalobjects.com/api/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      // wait for paypal to be ready
      this._paypalWait = setInterval(() => {
        if (window.paypal) {
          clearInterval(this._paypalWait);
          this._renderPaypal();
        }
      }, 1000);
    } else {
      this._renderPaypal();
    }
  }

  componentWillUnmount() {
    clearInterval(this._paypalWait);
  }

  _renderPaypal() {
    const { site } = this.props;
    if (!this._paypalRendered) {
      this._paypalRendered = true;
      paypal.Button.render({
        env: 'sandbox',
        client: { sandbox: site.paypalClientId },
        commit: true,
        payment: this._paypalPayment,
        onAuthorize: this._onAuthorize,
        style: { size: 'medium', shape: 'rect' },
      }, '#paypalButton');
    }
  }

  _load(props) {
    const { formId } = props;
    getItem('forms', formId)
    .then((form) => {
      const { formState } = this.state;
      const payment = formState.object;
      payment.amount = form.unpaidTotal;
      this.setState({ form, formState: new FormState(payment, this._setItem) });
    })
    .catch(error => console.error('!!! PaymentPay catch', error));
  }

  _setItem(item) {
    this.setState({ formState: new FormState(item, this._setItem) });
  }

  _onSubmit(event) {
    const { formState } = this.state;
    const payment = formState.object;
    event.preventDefault();
    if (payment.method !== 'paypal') {
      this._onAdd(payment);
    }
  }

  _onAdd(payment) {
    const { onDone } = this.props;
    const { form, error } = this.state;

    if (error) {
      this.setState({ error });
    } else {
      postItem('payments', payment)
      .then((paymentResponse) => {
        // link payment to form
        form.paymentIds.push(paymentResponse._id);
        return putItem('forms', form);
      })
      .then(() => onDone())
      .catch(error2 => this.setState({ error: error2 }));
    }
  }

  _onCancel() {
    const { onCancel } = this.props;
    onCancel(this.state.formState.object);
  }

  _paypalPayment() {
    const { site } = this.props;
    const { formState } = this.state;
    const payment = formState.object;
    return paypal.rest.payment.create('sandbox',
      { sandbox: site.paypalClientId },
      { transactions: [
        { amount: { total: payment.amount, currency: 'USD' } },
      ] },
    );
  }

  _onAuthorize(data, actions) {
    const { formState } = this.state;
    const payment = formState.object;
    return actions.payment.execute().then(() => {
      payment.payPalId = data.paymentID;
      payment.received = (new Date()).toISOString();
      this._onAdd(payment);
    });
  }

  render() {
    const { formId, formTemplateId, session } = this.props;
    const { form, formState, error } = this.state;
    const payment = formState.object;

    let result;
    if (form && session) {
      let submitButton;
      if (payment.method !== 'paypal') {
        submitButton = (
          <Button type="submit" label="Submit" onClick={this._onSubmit} />
        );
      }
      result = (
        <form className="form" action="/api/payments" onSubmit={this._onSubmit}>
          <div className="form__text"><h2>Payment</h2></div>
          <FormError message={error} />
          <PaymentFormContents inline={true} full={false}
            formTemplateId={formTemplateId} formId={formId}
            formState={formState} session={session} />
          <footer className="form__footer">
            <div id="paypalButton" style={{
              display: (payment.method === 'paypal' ? 'block' : 'none') }} />
            {submitButton}
            <Button secondary={true} label="Cancel" onClick={this._onCancel} />
          </footer>
        </form>
      );
    } else {
      result = <Loading />;
    }
    return result;
  }
}

PaymentPay.propTypes = {
  formId: PropTypes.string.isRequired,
  formTemplateId: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  session: PropTypes.object.isRequired,
  site: PropTypes.object.isRequired,
};

const select = state => ({
  session: state.session,
  site: state.site,
});

export default Stored(PaymentPay, select);
