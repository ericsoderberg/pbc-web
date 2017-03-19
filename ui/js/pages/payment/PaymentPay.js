import React, { Component, PropTypes } from 'react';
import { postItem } from '../../actions';
import Stored from '../../components/Stored';
import FormError from '../../components/FormError';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import FormState from '../../utils/FormState';
import PaymentFormContents from './PaymentFormContents';

let paypalLoaded = false;

class PaymentPay extends Component {

  constructor(props) {
    super(props);
    this._setItem = this._setItem.bind(this);
    this._paypalPayment = this._paypalPayment.bind(this);
    this._onAuthorize = this._onAuthorize.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onAdd = this._onAdd.bind(this);
    this._onCancel = this._onCancel.bind(this);

    const { amount, formIds, payByCheckInstructions } = props;
    const payment = { amount, formIds, payByCheckInstructions, method: 'paypal' };
    this.state = { formState: new FormState(payment, this._setItem) };
  }

  componentDidMount() {
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

  _setItem(item) {
    this.setState({ formState: new FormState(item, this._setItem) });
  }

  _onSubmit(event) {
    event.preventDefault();
    const { formState } = this.state;
    const payment = formState.object;
    if (payment.method !== 'paypal') {
      this._onAdd(payment);
    }
  }

  _onAdd(payment) {
    const { onDone } = this.props;
    const { error } = this.state;

    if (error) {
      this.setState({ error });
    } else {
      postItem('payments', payment)
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
    const { amount, formIds, payByCheckInstructions, session } = this.props;
    const { formState, error } = this.state;
    const payment = formState.object;

    let submitButton;
    let notification;
    if (payment.method !== 'paypal') {
      submitButton = (
        <Button type="submit" label="Submit" onClick={this._onSubmit} />
      );
    } else {
      notification = (
        <div className="form__text paypal-notification">
          Unfortunately, our payment processing system is offline at the moment.
          While we have a record of your registration, we will not be able to
          accept payment at this time. We will notify you when we are able to
          accept payment, hopefully within a few days.
        </div>
      );
      if (!this._paypalRendered) {
        submitButton = <Loading />;
      }
    }

    return (
      <form className="form" action="/api/payments" onSubmit={this._onSubmit}>
        <div className="form__text"><h2>Payment</h2></div>
        <FormError message={error} />
        <PaymentFormContents inline={true} full={false} amount={amount}
          payByCheckInstructions={payByCheckInstructions} formIds={formIds}
          formState={formState} session={session} />
        {notification}
        <footer className="form__footer">
          <div id="paypalButton" style={{
            display: (payment.method === 'paypal' ? 'block' : 'none') }} />
          {submitButton}
          <Button secondary={true} label="Cancel" onClick={this._onCancel} />
        </footer>
      </form>
    );
  }
}

PaymentPay.propTypes = {
  amount: PropTypes.number.isRequired,
  formIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCancel: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  payByCheckInstructions: PropTypes.string,
  session: PropTypes.object.isRequired,
  site: PropTypes.object.isRequired,
};

PaymentPay.defaultProps = {
  payByCheckInstructions: undefined,
};

const select = state => ({
  session: state.session,
  site: state.site,
});

export default Stored(PaymentPay, select);
