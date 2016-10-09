"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import DateTime from '../../components/DateTime';
import SelectSearch from '../../components/SelectSearch';
import Stored from '../../components/Stored';

const UserSuggestion = (props) => (
  <div className="box--between">
    <span>{props.item.name}</span>
    <span className="secondary">{props.item.email}</span>
  </div>
);

class PaymentFormContents extends Component {

  constructor () {
    super();
    this.state = { domains: [] };
  }

  componentDidMount () {
    const { formState, session } = this.props;
    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.log('PaymentFormContents catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  render () {
    const { formState, session } = this.props;
    const payment = formState.object;

    const formFilter = { 'paymentId': payment._id };
    const formFilterLabel = `Payment`;
    const formsPath = `/forms?` +
      `filter=${encodeURIComponent(JSON.stringify(formFilter))}` +
      `&filter-name=${encodeURIComponent(formFilterLabel)}`;

    let administeredBy;
    if (session.administrator) {
      let domains = this.state.domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domains.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={payment.domainId || ''}
            onChange={formState.change('domainId')}>
            {domains}
          </select>
        </FormField>
      );
    }

    let user;
    if (session && (session.administrator || (payment.domainId &&
      session.administratorDomainId === payment.domainId))) {
      user = (
        <fieldset className="form__fields">
          <FormField label="Person" help="the person to submit this form for">
            <SelectSearch category="users"
              options={{select: 'name email', sort: 'name'}}
              Suggestion={UserSuggestion}
              value={(payment.userId || session).name || ''}
              onChange={(suggestion) => {
                payment.userId = suggestion;
                this.props.onChange(payment);
              }} />
          </FormField>
        </fieldset>
      );
    }

    return (
      <div>
        <div className="form-item">
          <Link to={formsPath}>Forms</Link>
        </div>
        <fieldset className="form__fields">
          <FormField label="Name">
            <div className="box--row">
              <span className="prefix">$</span>
              <input name="amount" type="text" value={payment.amount || ''}
                onChange={formState.change('amount')}/>
            </div>
          </FormField>
          <FormField label="Sent date">
            <DateTime format="M/D/YYYY" name="sent"
              value={payment.sent || ''}
              onChange={formState.change('sent')} />
          </FormField>
          <FormField label="Sent date">
            <div>
              <input id="check" name="method" type="radio" value="check"
                checked={'check' === payment.method}
                onChange={formState.change('method')} />
              <label htmlFor="check">check</label>
            </div>
            <div>
              <input id="paypal" name="method" type="radio" value="paypal"
                checked={'paypal' === payment.method}
                onChange={formState.change('method')} />
              <label htmlFor="paypal">paypal</label>
            </div>
          </FormField>
          <FormField label="Notes">
            <textarea name="notes" value={payment.notes || ''} rows={4}
              onChange={formState.change('notes')}/>
          </FormField>
        </fieldset>
        <fieldset className="form__fields">
          <FormField label="Received date">
            <DateTime format="M/D/YYYY" name="received"
              value={payment.received || ''}
              onChange={formState.change('received')} />
          </FormField>
          {administeredBy}
        </fieldset>
        {user}
      </div>
    );
  }
};

PaymentFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string,
    name: PropTypes.string
  })
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(PaymentFormContents, select);
