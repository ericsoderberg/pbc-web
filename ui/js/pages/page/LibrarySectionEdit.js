"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';
import SectionFields from './SectionFields';

export default class LibrarySectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange), libraries: [] };
  }

  componentDidMount () {
    getItems('messages', { distinct: 'library' })
    .then(libraries => this.setState({ libraries: libraries }));
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ formState: new FormState(nextProps.section, nextProps.onChange) });
  }

  render () {
    const { formState } = this.state;
    const section = formState.object;

    const libraries = this.state.libraries.map(library => (
      <option key={library} label={library} value={library} />
    ));

    return (
      <fieldset className="form__fields">
        <FormField label="Library">
          <select name="library" value={section.name || ''}
            onChange={formState.change('name')}>
            {libraries}
          </select>
        </FormField>
        <SectionFields formState={formState} />
      </fieldset>
    );
  }
};

LibrarySectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
