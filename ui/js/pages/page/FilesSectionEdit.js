"use strict";
import React, { Component, PropTypes } from 'react';
import { postFile } from '../../actions';
import FormField from '../../components/FormField';
import Loading from '../../components/Loading';
import FormState from '../../utils/FormState';
import SectionMultiEdit from './SectionMultiEdit';

class FilesItemEdit extends Component {

  constructor (props) {
    super(props);
    const { onChange, item } = props;
    this.state = { formState: new FormState(item, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    const { onChange, item } = nextProps;
    this.setState({ formState: new FormState(item, onChange) });
  }

  _changeFile (index) {
    return (event) => {
      const { formState } = this.state;
      const files = event.target.files;
      formState.set({ name: files[0].name });
      let data = new FormData();
      data.append('file', files[0]);
      postFile(data)
      .then((file) => {
        const { formState } = this.state;
        console.log('!!! file upload completed', file);
        formState.set(file);
      })
      .catch(error => console.log('!!! File upload catch', error));
    };
  }

  render () {
    const { index } = this.props;
    const { formState } = this.state;
    const file = formState.object;

    let fileField;
    if (file._id) {
      fileField = (
        <FormField name={`file-${index}`} label="File">
          <div className="box--row">
            <span className="input">{file.name || file._id}</span>
          </div>
        </FormField>
      );
    } else if (file.name) {
      // uploading
      fileField = (
        <FormField name={`file-${index}`} label="File">
          <Loading small={true} />
        </FormField>
      );
    } else {
      fileField = (
        <FormField name={`file-${index}`} label="File">
          <input name={`file-${index}`} type="file"
            onChange={this._changeFile(index)}/>
        </FormField>
      );
    }

    return (
      <div>
        {fileField}
        <FormField label="Label">
          <input name={`label-${index}`} value={file.label || ''}
            onChange={formState.change('label')}/>
        </FormField>
      </div>
    );
  }

}

FilesItemEdit.propTypes = {
  index: PropTypes.number.isRequired,
  item: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default class FilesSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    const { section, onChange } = nextProps;
    this.setState({ formState: new FormState(section, onChange) });
  }

  render () {
    const { formState } = this.state;
    return (
      <SectionMultiEdit formState={formState} property='files' label='file'
        ItemEdit={FilesItemEdit} />
    );
  }
};

FilesSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
