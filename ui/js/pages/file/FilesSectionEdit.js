
import React, { Component, PropTypes } from 'react';
import FormState from '../../utils/FormState';
import SectionMultiEdit from '../../components/SectionMultiEdit';
import FilesItemEdit from './FilesItemEdit';

export default class FilesSectionEdit extends Component {

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
      <SectionMultiEdit formState={formState} property="files" label="file"
        ItemEdit={FilesItemEdit} />
    );
  }
}

FilesSectionEdit.propTypes = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired,
};
