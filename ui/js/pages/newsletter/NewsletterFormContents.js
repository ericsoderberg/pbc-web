
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import SectionsFormContents from '../../components/SectionsFormContents';
import DateInput from '../../components/DateInput';

const SECTION_TYPES = [
  'text', 'image', 'event', 'library', 'pages', 'files',
];

export default class NewsletterFormContents extends Component {

  constructor() {
    super();
    this._onAddEvent = this._onAddEvent.bind(this);
    this._changeEvent = this._changeEvent.bind(this);
    this._removeEvent = this._removeEvent.bind(this);
    this.state = { domains: [] };
  }

  componentDidMount() {
    const { formState, session } = this.props;

    if (session.userId.administrator) {
      getItems('domains', { sort: 'name' })
      .then(domains => this.setState({ domains }))
      .catch(error => console.error('NewsletterFormContents domains catch',
        error));
    } else if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }
  }

  _onAddEvent() {
    const newsletter = this.props.formState.object;
    const eventIds = (newsletter.eventIds || []).slice(0);
    eventIds.push({});
    this.props.formState.set('eventIds', eventIds);
  }

  _changeEvent(index) {
    return (suggestion) => {
      const newsletter = this.props.formState.object;
      const eventIds = (newsletter.eventIds || []).slice(0);
      eventIds[index] = { _id: suggestion._id, name: suggestion.name };
      this.props.formState.set('eventIds', eventIds);
    };
  }

  _removeEvent(index) {
    return () => {
      const newsletter = this.props.formState.object;
      const eventIds = (newsletter.eventIds || []).slice(0);
      eventIds.splice(index, 1);
      this.props.formState.set('eventIds', eventIds);
    };
  }

  render() {
    const { className, formState, session } = this.props;
    const { domains } = this.state;
    const newsletter = formState.object;

    let administeredBy;
    if (session.userId.administrator) {
      const domainOptions = domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domainOptions.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={newsletter.domainId || ''}
            onChange={formState.change('domainId')}>
            {domainOptions}
          </select>
        </FormField>
      );
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input name="name" value={newsletter.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField label="Date">
            <DateInput value={newsletter.date || ''}
              onChange={formState.change('date')} />
          </FormField>
        </fieldset>
        <SectionsFormContents formState={formState} types={SECTION_TYPES} />
        <fieldset className="form__fields">
          {administeredBy}
        </fieldset>
      </div>
    );
  }
}

NewsletterFormContents.propTypes = {
  className: PropTypes.string,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

NewsletterFormContents.defaultProps = {
  className: undefined,
};
