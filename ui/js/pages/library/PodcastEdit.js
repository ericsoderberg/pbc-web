
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';
import ImageField from '../../components/ImageField';
import FormState from '../../utils/FormState';

export default class PodcastEdit extends Component {

  constructor(props) {
    super(props);
    const { podcast, onChange } = props;
    this.state = { formState: new FormState(podcast, onChange) };
  }

  componentWillReceiveProps(nextProps) {
    const { podcast, onChange } = nextProps;
    this.setState({ formState: new FormState(podcast, onChange) });
  }

  render() {
    const { formState } = this.state;
    const podcast = formState.object;

    return (
      <fieldset>
        <FormField label="Title">
          <input name="title"
            value={podcast.title || ''}
            onChange={formState.change('title')} />
        </FormField>
        <FormField label="Subtitle">
          <input name="subtitle"
            value={podcast.subtitle || ''}
            onChange={formState.change('subtitle')} />
        </FormField>
        <FormField label="Summary">
          <textarea name="summary"
            value={podcast.summary || ''}
            rows={4}
            onChange={formState.change('summary')} />
        </FormField>
        <FormField label="Description">
          <textarea name="description"
            value={podcast.description || ''}
            rows={4}
            onChange={formState.change('description')} />
        </FormField>
        <FormField label="Category">
          <input name="category"
            value={podcast.category || ''}
            onChange={formState.change('category')} />
        </FormField>
        <FormField label="Sub category">
          <input name="subCategory"
            value={podcast.subCategory || ''}
            onChange={formState.change('subCategory')} />
        </FormField>
        <ImageField label="Image"
          name="image"
          formState={formState}
          property="image" />
      </fieldset>
    );
  }
}

PodcastEdit.propTypes = {
  onChange: PropTypes.func.isRequired,
  podcast: PropTypes.object.isRequired,
};
