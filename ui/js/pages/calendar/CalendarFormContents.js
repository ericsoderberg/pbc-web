
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';

export default class CalendarFormContents extends Component {

  constructor() {
    super();
    this.state = { domains: [] };
  }

  componentDidMount() {
    const { formState, session } = this.props;

    if (session.userId.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.error('CalendarFormContents domains catch', error));
    } else if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }
  }

  render() {
    const { className, errors, formState, session } = this.props;
    const calendar = formState.object;

    let administeredBy;
    if (session.userId.administrator) {
      const domains = this.state.domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domains.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by" error={errors.domainId}>
          <select name="domainId" value={calendar.domainId || ''}
            onChange={formState.change('domainId')}>
            {domains}
          </select>
        </FormField>
      );
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Name" error={errors.name}>
            <input name="name" value={calendar.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField name="path" label="Url ID" help="unique url name"
            error={errors.path}>
            <input name="path" value={calendar.path || ''}
              onChange={formState.change('path')} />
          </FormField>
          <FormField>
            <input name="public" type="checkbox"
              checked={calendar.public || false}
              onChange={formState.toggle('public')} />
            <label htmlFor="public">public</label>
          </FormField>
          {administeredBy}
        </fieldset>
      </div>
    );
  }
}

CalendarFormContents.propTypes = {
  className: PropTypes.string,
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

CalendarFormContents.defaultProps = {
  className: undefined,
  errors: {},
};
