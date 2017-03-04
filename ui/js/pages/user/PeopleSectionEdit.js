import React, { Component, PropTypes } from 'react';
import FormState from '../../utils/FormState';
import SectionMultiEdit from '../../components/SectionMultiEdit';
import PeopleItemEdit from './PeopleItemEdit';

export default class PeopleSectionEdit extends Component {

  constructor(props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentWillReceiveProps(nextProps) {
    const { section, onChange } = nextProps;
    this.setState({ formState: new FormState(section, onChange) });
  }

  render() {
    const { formState } = this.state;
    return (
      <SectionMultiEdit formState={formState} property="people" label="person"
        ItemEdit={PeopleItemEdit} />
    );
  }
}

PeopleSectionEdit.propTypes = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired,
};
