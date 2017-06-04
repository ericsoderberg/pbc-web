import React, { Component, PropTypes } from 'react';
import moment from 'moment-timezone';
import FormField from '../../components/FormField';
import SelectSearch from '../../components/SelectSearch';
import FormState from '../../utils/FormState';
import SectionEdit from '../../components/SectionEdit';

const Suggestion = props => (
  <div className="box--between">
    <span>{props.item.name}</span>
    <span className="secondary">
      {moment(props.item.start).format('MMM YYYY')}
    </span>
  </div>
);

Suggestion.propTypes = {
  item: PropTypes.shape({
    start: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    name: PropTypes.string,
  }).isRequired,
};

export default class EventSectionEdit extends Component {

  constructor(props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange),
    });
  }

  render() {
    const { formState } = this.state;
    const section = formState.object;

    return (
      <SectionEdit formState={formState} allowBackgroundImage={false}>
        <FormField label="Event">
          <SelectSearch category="events"
            options={{ select: 'name start', sort: '-start' }}
            Suggestion={Suggestion}
            value={(section.eventId || {}).name || ''}
            onChange={suggestion =>
              formState.change('eventId')({
                _id: suggestion._id, name: suggestion.name })} />
        </FormField>
        <FormField>
          <input name="includeMap" type="checkbox"
            checked={section.includeMap || false}
            onChange={formState.toggle('includeMap')} />
          <label htmlFor="includeMap">Map?</label>
        </FormField>
        <FormField>
          <input name="navigable" type="checkbox"
            checked={(section.navigable === false ? section.navigable : true)}
            onChange={formState.toggle('navigable')} />
          <label htmlFor="navigable">Navigable?</label>
        </FormField>
      </SectionEdit>
    );
  }
}

EventSectionEdit.propTypes = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired,
};
