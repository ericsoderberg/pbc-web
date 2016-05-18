"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems, postFile, deleteFile } from '../../actions';
import FormField from '../../components/FormField';
import ImageField from '../../components/ImageField';
import DateTime from '../../components/DateTime';
import ConfirmRemove from '../../components/ConfirmRemove';

export default class MessageFormContents extends Component {

  constructor () {
    super();
    this._onAddFile = this._onAddFile.bind(this);
    this._renderFileField = this._renderFileField.bind(this);
    this.state = { series: [] };
  }

  componentDidMount () {
    this.refs.name.focus();
    getItems('messages', { filter: { series: true } })
    .then(series => this.setState({ series: series }))
    .catch(error => console.log('!!! MessageFormContents catch', error));
  }

  _onAddFile () {
    const message = this.props.formState.object;
    let files = (message.files || []).slice(0);
    files.push({});
    this.props.formState.set('files', files);
  }

  _removeFile (index) {
    return (event) => {
      const message = this.props.formState.object;
      let files = (message.files || []).slice(0);
      const file = files[index];
      deleteFile(file._id);
      files.splice(index, 1);
      this.props.formState.set('files', files);
    };
  }

  _changeFile (index) {
    return (event) => {
      const message = this.props.formState.object;
      const files = event.target.files;
      console.log('!!! _onChangeFile', files[0]);
      let data = new FormData();
      data.append('file', files[0]);
      postFile(data)
      .then((file) => {
        let files = (message.files || []).slice(0);
        files[index] = file;
        console.log('!!! file upload completed', file);
        this.props.formState.set('files', files);
      })
      .catch(error => console.log('!!! File upload catch', error));
    };
  }

  _renderFileField (file, index) {
    let field;
    if (file._id) {
      field = (
        <FormField key={index} name={`file-${index}`} label="File">
          <div className="box--row">
            <span>{file.name || file._id}</span>
            <ConfirmRemove onConfirm={this._removeFile(index)} />
          </div>
        </FormField>
      );
    } else {
      field = (
        <FormField key={index} name={`file-${index}`} label="File">
          <input name={`file-${index}`} type="file"
            onChange={this._changeFile(index)}/>
        </FormField>
      );
    }
    return field;
  }

  render () {
    const { formState } = this.props;
    const message = formState.object;

    const textHelp = (
      <a href="http://daringfireball.net/projects/markdown/syntax"
        target="_blank">Markdown syntax</a>
    );

    let files;
    if (message.files) {
      files = message.files.map(this._renderFileField);
    }

    const series = this.state.series.map(message => (
      <option key={message._id} label={message.name} value={message._id} />
    ));
    series.unshift(<option key={0} />);

    return (
      <div>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input ref="name" name="name" value={message.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          <FormField label="Author">
            <input name="author" value={message.author || ''}
              onChange={formState.change('author')}/>
          </FormField>
          <FormField label="Date">
            <DateTime format="M/D/YYYY" name="date"
              value={message.date || ''}
              onChange={formState.change('date')} />
          </FormField>
          <FormField label="Verses">
            <input name="verses" value={message.verses || ''}
              onChange={formState.change('verses')}/>
          </FormField>
        </fieldset>
        <fieldset className="form__fields">
          <ImageField label="Image" name="image"
            formState={formState} property="image" />
          <FormField name="text" label="Text" help={textHelp}>
            <textarea ref="text" name="text" value={message.text || ''} rows={4}
              onChange={formState.change('text')}/>
          </FormField>
          <FormField label="Video URL">
            <input name="videoUrl" value={message.videoUrl || ''}
              onChange={formState.change('videoUrl')}/>
          </FormField>
          {files}
          <button type="button" onClick={this._onAddFile}>Add file</button>
        </fieldset>
        <fieldset className="form__fields">
          <FormField name="seriesId" label="In Series">
            <select name="seriesId" value={message.seriesId || ''}
              onChange={formState.change('seriesId')}>
              {series}
            </select>
          </FormField>
          <FormField>
            <input name="series" type="checkbox"
              checked={message.series || false}
              onChange={formState.toggle('series')}/>
            <label htmlFor="series">Series?</label>
          </FormField>
          <FormField label="Library">
            <input name="library" value={message.library || ''}
              onChange={formState.change('library')}/>
          </FormField>
          <FormField name="path" label="Path">
            <input name="path" value={message.path || ''}
              onChange={formState.change('path')}/>
          </FormField>
        </fieldset>
      </div>
    );
  }
};

MessageFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
