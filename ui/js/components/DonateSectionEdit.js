import React, { Component, PropTypes } from 'react';
import FormField from './FormField';
import FormState from '../utils/FormState';
import SectionEdit from './SectionEdit';

export default class TextSectionEdit extends Component {

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

    return (
      <SectionEdit formState={formState}>
        <FormField>
          <span>No input is needed for this section.</span>
        </FormField>
      </SectionEdit>
    );
  }
}

TextSectionEdit.propTypes = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired,
};
