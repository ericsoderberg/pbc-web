import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../../actions';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';

class CalendarSectionEdit extends Component {

  constructor(props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(loadCategory('calendars', { sort: 'name' }));
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange),
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCategory('calendars'));
  }

  render() {
    const { calendars } = this.props;
    const { formState } = this.state;
    const section = formState.object;

    const options = calendars.map(calendar => (
      <option key={calendar._id} label={calendar.name} value={calendar._id} />
    ));

    let value = '';
    if (section.calendarId) {
      if (typeof section.calendarId === 'string') {
        value = section.calendarId;
      } else {
        value = section.calendarId._id;
      }
    }

    return (
      <fieldset className="form__fields">
        <FormField label="Calendar">
          <select name="calendarId" value={value}
            onChange={formState.change('calendarId')}>
            {options}
          </select>
        </FormField>
        <FormField>
          <input name="omitRecurring" type="checkbox"
            checked={section.omitRecurring || false}
            onChange={formState.toggle('omitRecurring')} />
          <label htmlFor="omitRecurring">Omit recurring events</label>
        </FormField>
      </fieldset>
    );
  }
}

CalendarSectionEdit.propTypes = {
  calendars: PropTypes.array,
  dispatch: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired,
};

CalendarSectionEdit.defaultProps = {
  calendars: [],
};

const select = state => ({
  calendars: (state.calendars || {}).items || [],
});

export default connect(select)(CalendarSectionEdit);
