
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';
import SectionsFormContents from '../../components/SectionsFormContents';
import DateInput from '../../components/DateInput';
import DomainIdField from '../../components/DomainIdField';

const SECTION_TYPES = [
  'text', 'image', 'event', 'library', 'pages', 'files',
];

export default class NewsletterFormContents extends Component {

  constructor() {
    super();
    this._onAddEvent = this._onAddEvent.bind(this);
    this._changeEvent = this._changeEvent.bind(this);
    this._removeEvent = this._removeEvent.bind(this);
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
    const newsletter = formState.object;

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input name="name"
              value={newsletter.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField label="Date">
            <DateInput value={newsletter.date || ''}
              onChange={formState.change('date')} />
          </FormField>
        </fieldset>
        <SectionsFormContents formState={formState} types={SECTION_TYPES} />
        <fieldset className="form__fields">
          <DomainIdField formState={formState} session={session} />
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
