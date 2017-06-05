import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormField from './FormField';
import FormState from '../utils/FormState';
import SectionEdit from './SectionEdit';

export default class VideoSectionEdit extends Component {

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
      <SectionEdit formState={formState}>
        <FormField label="Url" help="Vimeo or YouTube only">
          <input type="text"
            name="url"
            value={section.url || ''}
            onChange={formState.change('url')} />
        </FormField>
      </SectionEdit>
    );
  }
}

VideoSectionEdit.propTypes = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired,
};
