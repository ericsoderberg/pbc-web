"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import DateTime from '../../components/DateTime';

export default class MessageFormContents extends Component {

  constructor () {
    super();
    this.state = { series: [] };
  }

  componentDidMount () {
    this.refs.name.focus();
    getItems('messages', { query: { series: true } })
    .then(series => this.setState({ series: series }))
    .catch(error => console.log('!!! MessageFormContents catch', error));
  }

  render () {
    const { formState } = this.props;
    const message = formState.object;

    const textHelp = (
      <a href="http://daringfireball.net/projects/markdown/syntax"
        target="_blank">Markdown syntax</a>
    );

    const imageHelp = (
      <span>
        {"Don't forget to "}
        <a href="https://tinyjpg.com" target="_blank">optimize</a>!
      </span>
    );

    let imageField;
    if (message.image) {
      imageField = (
        <FormField name="image" label="Image">
          <img className="form-field__image"
            src={message.image.data} />
          <input name="imageRemove" type="checkbox"
            checked={message.image || false}
            onChange={() => formState.set('image', false)}/>
          <label htmlFor="imageRemove">Clear</label>
        </FormField>
      );
    } else {
      imageField = (
        <FormField name="image" label="Image" help={imageHelp}
          onDrop={formState.dropFile('image')}>
          <input name="image" type="file"
            onChange={formState.changeFile('image')}/>
        </FormField>
      );
    }

    const series = this.state.series.map(message => (
      <option key={message._id} label={message.name} value={message._id} />
    ));
    series.unshift(<option key={0} />);

    return (
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
        <FormField label="Video URL">
          <input name="videoUrl" value={message.videoUrl || ''}
            onChange={formState.change('videoUrl')}/>
        </FormField>
        {imageField}
        <FormField name="text" label="Text" help={textHelp}>
          <textarea ref="text" name="text" value={message.text || ''} rows={4}
            onChange={formState.change('text')}/>
        </FormField>
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
      </fieldset>
    );
  }
};

MessageFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
