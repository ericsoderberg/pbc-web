
import React, { Component, PropTypes } from 'react';
import { getItems, postFile, deleteFile } from '../../actions';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import ImageField from '../../components/ImageField';
import DateInput from '../../components/DateInput';
import SelectSearch from '../../components/SelectSearch';
import TextHelp from '../../components/TextHelp';
import TrashIcon from '../../icons/Trash';

export default class MessageFormContents extends Component {

  constructor() {
    super();
    this._onAddFile = this._onAddFile.bind(this);
    this._renderFile = this._renderFile.bind(this);
    this._changeFileProperty = this._changeFileProperty.bind(this);
    this._onChangeSeries = this._onChangeSeries.bind(this);
    this.state = { domains: [], libraries: [] };
  }

  componentDidMount() {
    const { formState, session } = this.props;

    if (session.userId.administrator) {
      getItems('domains', { sort: 'name' })
      .then(domains => this.setState({ domains }))
      .catch(error => console.error('MessageFormContents domains catch', error));
    } else if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }

    getItems('libraries', { sort: 'name' })
    .then(libraries => this.setState({ libraries }))
    .catch(error => console.error('MessageFormContents libraries catch', error));
  }

  _onAddFile() {
    const message = this.props.formState.object;
    const files = (message.files || []).slice(0);
    files.push({});
    this.props.formState.set('files', files);
  }

  _removeFile(index) {
    return () => {
      const message = this.props.formState.object;
      const files = (message.files || []).slice(0);
      const file = files[index];
      deleteFile(file._id);
      files.splice(index, 1);
      this.props.formState.set('files', files);
    };
  }

  _changeFile(index) {
    return (event) => {
      const message = this.props.formState.object;
      const files = event.target.files;
      const data = new FormData();
      data.append('file', files[0]);
      postFile(data)
      .then((file) => {
        const nextFiles = (message.files || []).slice(0);
        nextFiles[index] = file;
        // console.log('!!! file upload completed', file);
        this.props.formState.set('files', nextFiles);
      })
      .catch(error => console.error('!!! File upload catch', error));
    };
  }

  _changeFileProperty(index, property) {
    return (event) => {
      const message = this.props.formState.object;
      const files = (message.files || []).slice(0);
      const file = files[index];
      file[property] = event.target.value;
      this.props.formState.set('files', files);
    };
  }

  _onChangeSeries(suggestion) {
    const { formState } = this.props;
    let value;
    if (suggestion) {
      value = { _id: suggestion._id, name: suggestion.name };
    } else {
      value = undefined;
    }
    formState.set('seriesId', value);
  }

  _renderFile(file, index) {
    const closeControl = (
      <button type="button" className="button-icon"
        onClick={this._removeFile(index)}>
        <TrashIcon secondary={true} />
      </button>
    );

    let fileField;
    if (file._id) {
      fileField = (
        <FormField name={`file-${index}`} label="File"
          closeControl={closeControl}>
          <div className="box--row">
            <span className="input">{file.name || file._id}</span>
          </div>
        </FormField>
      );
    } else {
      fileField = (
        <FormField name={`file-${index}`} label="File"
          closeControl={closeControl}>
          <input name={`file-${index}`} type="file"
            onChange={this._changeFile(index)} />
        </FormField>
      );
    }

    return (
      <div key={index}>
        {fileField}
        <FormField label="Label">
          <input name={`label-${index}`} value={file.label || ''}
            onChange={this._changeFileProperty(index, 'label')} />
        </FormField>
      </div>
    );
  }

  render() {
    const { className, errors, formState, session } = this.props;
    const { domains, libraries } = this.state;
    const message = formState.object;

    let files;
    if (message.files) {
      files = message.files.map(this._renderFile);
    }

    let nonSeriesTop;
    let nonSeriesBottom;
    let seriesFields;
    if (!message.series) {
      nonSeriesTop = (
        <fieldset className="form__fields">
          <FormField label="Author" error={errors.author}>
            <input name="author" value={message.author || ''}
              onChange={formState.change('author')} />
          </FormField>
          <FormField label="Date" error={errors.date}>
            <DateInput value={message.date || ''}
              onChange={formState.change('date')} />
          </FormField>
          <FormField label="Verses" help="don't abbreviate"
            error={errors.verses}>
            <input name="verses" value={message.verses || ''}
              onChange={formState.change('verses')} />
          </FormField>
          <FormField name="seriesId" label="In Series" error={errors.seriesId}>
            <SelectSearch category="messages" clearable={true}
              options={{ filter: { series: true } }}
              value={(message.seriesId || {}).name || ''}
              onChange={this._onChangeSeries} />
          </FormField>
        </fieldset>
      );

      nonSeriesBottom = (
        <fieldset className="form__fields">
          <FormField label="Video URL" error={errors.videoUrl}>
            <input name="videoUrl" value={message.videoUrl || ''}
              onChange={formState.change('videoUrl')} />
          </FormField>
          {files}
          <FormFieldAdd>
            <button type="button" className="button button--secondary"
              onClick={this._onAddFile}>
              Add file
            </button>
          </FormFieldAdd>
        </fieldset>
      );
    } else {
      seriesFields = (
        <FormField label="Background color">
          <input name="color" value={message.color || ''}
            onChange={formState.change('color')} />
        </FormField>
      );
    }

    let administeredBy;
    if (session.userId.administrator) {
      const domainOptions = domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domainOptions.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by" error={errors.domainId}>
          <select name="domainId" value={message.domainId || ''}
            onChange={formState.change('domainId')}>
            {domainOptions}
          </select>
        </FormField>
      );
    }

    const libraryOptions = libraries.map(library => (
      <option key={library._id} label={library.name} value={library._id} />
    ));
    libraryOptions.unshift(<option key={0} />);
    const libraryId =
      (message.libraryId && typeof message.libraryId === 'object' ?
        message.libraryId._id : message.libraryId);

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Name" error={errors.name}>
            <input name="name" value={message.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField>
            <input name="series" type="checkbox"
              checked={message.series || false}
              onChange={formState.toggle('series')} />
            <label htmlFor="series">This is a series</label>
          </FormField>
        </fieldset>

        {nonSeriesTop}

        <fieldset className="form__fields">
          <ImageField label="Image" name="image"
            formState={formState} property="image" />
          {seriesFields}
          <FormField name="text" label="Text" help={<TextHelp />}
            error={errors.text}>
            <textarea name="text" value={message.text || ''} rows={4}
              onChange={formState.change('text')} />
          </FormField>
        </fieldset>

        {nonSeriesBottom}

        <fieldset className="form__fields">
          <FormField label="Library" error={errors.libraryId}>
            <select name="libraryId" value={libraryId || ''}
              onChange={formState.change('libraryId')}>
              {libraryOptions}
            </select>
          </FormField>
          <FormField name="path" label="Url ID" help="unique url name"
            error={errors.path}>
            <input name="path" value={message.path || ''}
              onChange={formState.change('path')} />
          </FormField>
          {administeredBy}
        </fieldset>
      </div>
    );
  }
}

MessageFormContents.propTypes = {
  className: PropTypes.string,
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

MessageFormContents.defaultProps = {
  className: undefined,
  errors: {},
};
