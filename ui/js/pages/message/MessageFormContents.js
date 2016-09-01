"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems, postFile, deleteFile } from '../../actions';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import ImageField from '../../components/ImageField';
import DateTime from '../../components/DateTime';
import SelectSearch from '../../components/SelectSearch';
import TrashIcon from '../../icons/Trash';

export default class MessageFormContents extends Component {

  constructor () {
    super();
    this._onAddFile = this._onAddFile.bind(this);
    this._renderFileField = this._renderFileField.bind(this);
    this.state = { domains: [] };
  }

  componentDidMount () {
    const { formState, session } = this.props;
    this.refs.name.focus();

    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.log('MessageFormContents catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
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
    let closeControl = (
      <button type="button" className="button-icon"
        onClick={this.props.formState.removeAt('files', index)}>
        <TrashIcon secondary={true} />
      </button>
    );

    let field;
    if (file._id) {
      field = (
        <FormField key={index} name={`file-${index}`} label="File"
          closeControl={closeControl}>
          <div className="box--row">
            <span className="input">{file.name || file._id}</span>
          </div>
        </FormField>
      );
    } else {
      field = (
        <FormField key={index} name={`file-${index}`} label="File"
          closeControl={closeControl}>
          <input name={`file-${index}`} type="file"
            onChange={this._changeFile(index)}/>
        </FormField>
      );
    }
    return field;
  }

  render () {
    const { formState, session } = this.props;
    const message = formState.object;

    const textHelp = (
      <a href="http://daringfireball.net/projects/markdown/syntax"
        target="_blank">Markdown syntax</a>
    );

    let files;
    if (message.files) {
      files = message.files.map(this._renderFileField);
    }

    let seriesField;
    if (! message.series) {
      seriesField = (
        <FormField name="seriesId" label="In Series">
          <SelectSearch category="messages"
            options={{filter: { series: true }}}
            value={(message.seriesId || {}).name || ''}
            onChange={(suggestion) =>
              formState.change('seriesId')({
                _id: suggestion._id, name: suggestion.name })} />
        </FormField>
      );
    }

    let nonSeriesField;
    if (! message.seriesId) {
      nonSeriesField = (
        <FormField>
          <input name="series" type="checkbox"
            checked={message.series || false}
            onChange={formState.toggle('series')}/>
          <label htmlFor="series">This is a series</label>
        </FormField>
      );
    }

    let administeredBy;
    if (session.administrator) {
      let domains = this.state.domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domains.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={message.domainId || ''}
            onChange={formState.change('domainId')}>
            {domains}
          </select>
        </FormField>
      );
    }

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
          <FormFieldAdd>
            <button type="button" className="button button--secondary"
              onClick={this._onAddFile}>
              Add file
            </button>
          </FormFieldAdd>
        </fieldset>
        <fieldset className="form__fields">
          {seriesField}
          {nonSeriesField}
          <FormField label="Library">
            <input name="library" value={message.library || ''}
              onChange={formState.change('library')}/>
          </FormField>
          <FormField name="path" label="Path" help="unique url name">
            <input name="path" value={message.path || ''}
              onChange={formState.change('path')}/>
          </FormField>
          {administeredBy}
        </fieldset>
      </div>
    );
  }
};

MessageFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
