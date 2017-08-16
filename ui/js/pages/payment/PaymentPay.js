import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { postItem } from '../../actions';
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
      script.src = 'https://www.paypalobjects.com/api/checkout.js';
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
      const client = {};
      client[site.paypalEnv] = site.paypalClientId;
      paypal.Button.render({
        env: site.paypalEnv,
        client,
        commit: true,
        payment: this._paypalPayment,
        onAuthorize: this._onAuthorize,
        style: { size: 'medium', shape: 'rect' },
      }, '#paypalButton');
    }
  }

  // _paypalPayment(resolve, reject) { PayPal NVP
  _paypalPayment() {
    const { site } = this.props;
    const { formTemplateName } = this.props;
    const { formState } = this.state;
    const payment = formState.object;

    // PayPal NVP API integration
    // const payload = {
    //   amount: payment.amount,
    //   formTemplateName,
    //   cancelUrl: window.location.href,
    //   returnUrl: window.location.href,
    // };
    // // only set Authorization header
    // return paypal.request.post('/api/paypal', payload,
    //   { headers: { Authorization: getHeader('Authorization') } })
    // .then(data => resolve(data.token))
    // .catch(err => reject(err));

    // PayPal REST API integration
    const client = {};
    client[site.paypalEnv] = site.paypalClientId;
    return paypal.rest.payment.create(site.paypalEnv, client,
      {
        transactions: [{
          amount: { total: payment.amount, currency: 'USD' },
          description: formTemplateName,
        }],
      },
      { input_fields: { no_shipping: 1 }, flow_config: { user_action: 'commit' } });
  }

  // _onAuthorize(data) { PayPal NVP
  _onAuthorize(data, actions) {
    // const { formTemplateId, onDone } = this.props;
    const { formState } = this.state;
    const payment = formState.object;

    // PayPal NVP API integration
    // payment.formTemplateId = formTemplateId;
    // payment.payPalId = data.paymentToken;
    // return paypal.request.post('/api/payments', payment,
    //   { headers: { Authorization: getHeader('Authorization') } })
    // .then(() => onDone())
    // .catch(err => this.setState({ error: err }));

    // PayPal REST API integration
    return actions.payment.execute().then(() => {
      payment.payPalId = data.paymentID;
      payment.received = (new Date()).toISOString();
      this._onAdd(payment);
    });
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

  render() {
    const { payByCheckInstructions, session } = this.props;
    const { formState, error } = this.state;
    const payment = formState.object;

    let submitButton;
    let notification;
    if (payment.method !== 'paypal') {
      submitButton = (
        <Button type="submit" label="Submit" onClick={this._onSubmit} />
      );
    } else {
      // notification = (
      //   <div className="form__text paypal-notification">
      //     Unfortunately, our payment processing system is offline at the moment.
      //     While we have a record of your registration, we will not be able to
      //     accept payment at this time. We will notify you when we are able to
      //     accept payment, hopefully within a few days.
      //   </div>
      // );
      if (!this._paypalRendered) {
        submitButton = <Loading />;
      }
    }

    return (
      <form className="form" action="/api/payments" onSubmit={this._onSubmit}>
        <div className="form__text"><h2>Payment</h2></div>
        <FormError message={error} />
        <PaymentFormContents full={false}
          payByCheckInstructions={payByCheckInstructions}
          formState={formState}
          session={session} />
        {notification}
        <footer className="form__footer">
          <div id="paypalButton"
            style={{
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
  // formTemplateId: PropTypes.string.isRequired,
  formTemplateName: PropTypes.string.isRequired,
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

export default connect(select)(PaymentPay);
