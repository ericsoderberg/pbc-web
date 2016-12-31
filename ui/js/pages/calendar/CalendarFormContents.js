"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';

export default class CalendarFormContents extends Component {

  constructor () {
    super();
    this.state = { domains: [] };
  }

  componentDidMount () {
    const { formState, session } = this.props;

    this.refs.name.focus();

    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.log('CalendarFormContents domains catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  render () {
    const { formState, session } = this.props;
    const calendar = formState.object;

    let administeredBy;
    if (session.administrator) {
      let domains = this.state.domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domains.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={calendar.domainId || ''}
            onChange={formState.change('domainId')}>
            {domains}
          </select>
        </FormField>
      );
    }

    return (
      <div>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input ref="name" name="name" value={calendar.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          <FormField name="path" label="Path" help="unique url name">
            <input name="path" value={calendar.path || ''}
              onChange={formState.change('path')}/>
          </FormField>
          <FormField>
            <input name="private" type="checkbox"
              checked={calendar.private || false}
              onChange={formState.toggle('private')}/>
            <label htmlFor="private">private</label>
          </FormField>
          {administeredBy}
        </fieldset>
      </div>
    );
  }
};

CalendarFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};