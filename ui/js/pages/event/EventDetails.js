
import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import Button from '../../components/Button';
import DateTimeInput from '../../components/DateTimeInput';
import SelectSearch from '../../components/SelectSearch';
import TrashIcon from '../../icons/Trash';
import { getLocationParams } from '../../utils/Params';

const Suggestion = props => (
  <div className="box--between">
    <span>{props.item.name}</span>
    <span className="secondary">
      {moment(props.item.start).format('MMM Do YYYY')}
    </span>
  </div>
);

Suggestion.propTypes = {
  item: PropTypes.shape({
    start: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    name: PropTypes.string,
  }).isRequired,
};

export default class EventDetails extends Component {

  constructor() {
    super();
    this._onToggle = this._onToggle.bind(this);
    this._otherTimeChange = this._otherTimeChange.bind(this);
    this._onChangePrimaryEvent = this._onChangePrimaryEvent.bind(this);
    this.state = { active: false, domains: [], calendars: [] };
  }

  componentDidMount() {
    const { formState, session } = this.props;
    const params = getLocationParams();
    if (params.calendarId) {
      formState.change('calendarId')(params.calendarId);
    }
    if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }
  }

  _get() {
    const { session } = this.props;

    if (session.userId.administrator) {
      getItems('domains', { sort: 'name' })
      .then(domains => this.setState({ domains }))
      .catch(error => console.error('EventDetails catch', error));
    }

    getItems('calendars', { sort: 'name' })
    .then(calendars => this.setState({ calendars }))
    .catch(error => console.error('EventDetails calendars catch', error));
  }

  _onToggle() {
    const { calendars } = this.state;
    const active = !this.state.active;
    if (active && calendars.length === 0) {
      this._get();
    }
    this.setState({ active: !this.state.active });
  }

  _otherTimeChange(field, index) {
    return (value) => {
      const { formState } = this.props;
      const event = formState.object;
      const times = event.times.splice(0);
      times[index][field] = value;
      formState.set('times', times);
    };
  }

  _onChangePrimaryEvent(suggestion) {
    const { formState } = this.props;
    let value;
    if (suggestion) {
      value = { _id: suggestion._id, name: suggestion.name };
    } else {
      value = undefined;
    }
    formState.set('primaryEventId', value);
  }

  render() {
    const { errors, formState, session } = this.props;
    const { active, calendars, domains } = this.state;
    const event = formState.object;

    let contents;
    if (active) {
      let primaryEvent;
      if (!event.dates || event.dates.length === 0) {
        primaryEvent = (
          <FormField label="Primary event" help="For recurring event one-offs"
            error={errors.primaryEventId}>
            <SelectSearch category="events"
              options={{ select: 'name start', sort: '-start' }}
              Suggestion={Suggestion} clearable={true}
              value={(event.primaryEventId || {}).name || ''}
              onChange={this._onChangePrimaryEvent} />
          </FormField>
        );
      }

      let otherTimes;
      if (event.times && event.times.length > 0) {
        otherTimes = event.times.map((time, index) => [
          <FormField key={`start-${time._id}`} label="Also starts"
            closeControl={
              <button type="button" className="button-icon"
                onClick={formState.removeAt('times', index)}>
                <TrashIcon secondary={true} />
              </button>
            }>
            <DateTimeInput value={time.start || ''}
              onChange={this._otherTimeChange('start', index)} />
          </FormField>,
          <FormField key={`end-${time._id}`} label="Also ends">
            <DateTimeInput value={time.end || ''}
              onChange={this._otherTimeChange('end', index)} />
          </FormField>,
        ]);
      }

      let administeredBy;
      if (session.userId.administrator) {
        const domainOptions = domains.map(domain => (
          <option key={domain._id} label={domain.name} value={domain._id} />
        ));
        domainOptions.unshift(<option key={0} />);
        administeredBy = (
          <FormField label="Administered by" error={errors.domainId}>
            <select name="domainId" value={event.domainId || ''}
              onChange={formState.change('domainId')}>
              {domainOptions}
            </select>
          </FormField>
        );
      }

      const calendarOptions = calendars.map(calendar => (
        <option key={calendar._id} label={calendar.name} value={calendar._id} />
      ));
      calendarOptions.unshift(<option key={0} />);

      contents = (
        <fieldset className="form__fields">
          <FormField label="Calendar" error={errors.calendarId}>
            <select name="calendarId"
              value={(event.calendarId || {})._id || event.calendarId || ''}
              onChange={formState.change('calendarId')}>
              {calendarOptions}
            </select>
          </FormField>
          <FormField label="Path" help="unique url name" error={errors.path}>
            <input name="path" value={event.path || ''}
              onChange={formState.change('path')} />
          </FormField>
          <FormField>
            <input name="public" type="checkbox"
              checked={event.public || false}
              onChange={formState.toggle('public')} />
            <label htmlFor="public">public</label>
          </FormField>
          <FormField key="align">
            <input name="align" type="checkbox"
              checked={event.align !== 'start'}
              onChange={() => formState.set('align',
                event.align === 'start' ? 'center' : 'start')} />
            <label htmlFor="align">center</label>
          </FormField>
          {administeredBy}
          {primaryEvent}
          {otherTimes}
          <FormFieldAdd>
            <Button label="Add another time" secondary={true}
              onClick={formState.addTo('times',
                { start: event.start, end: event.end })} />
          </FormFieldAdd>
        </fieldset>
      );
    }

    return (
      <div>
        <div type="button" className="form-item">
          <Button secondary={true} label="Details"
            onClick={this._onToggle} />
        </div>
        {contents}
      </div>
    );
  }
}

EventDetails.propTypes = {
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

EventDetails.defaultProps = {
  errors: {},
};
