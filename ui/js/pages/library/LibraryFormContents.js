
import React from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';
import TextHelp from '../../components/TextHelp';
import DomainIdField from '../../components/DomainIdField';
import PodcastEdit from './PodcastEdit';

const LibraryFormContents = (props) => {
  const { className, errors, formState, session } = props;
  const library = formState.object;

  let podcast;
  if (library.podcast) {
    podcast = (
      <PodcastEdit podcast={library.podcast}
        onChange={formState.change('podcast')} />
    );
  }

  return (
    <div className={className}>
      <fieldset className="form__fields">
        <FormField label="Name" error={errors.name}>
          <input name="name"
            value={library.name || ''}
            onChange={formState.change('name')} />
        </FormField>
        <FormField name="text" label="Description" help={<TextHelp />}>
          <textarea name="text"
            value={library.text || ''}
            rows={4}
            onChange={formState.change('text')} />
        </FormField>
        <FormField name="path"
          label="Url ID"
          help="unique url name"
          error={errors.path}>
          <input name="path"
            value={library.path || ''}
            onChange={formState.change('path')} />
        </FormField>
        <DomainIdField formState={formState} session={session} />
        <FormField>
          <input name="podcast"
            type="checkbox"
            checked={library.podcast}
            onChange={() =>
              formState.set('podcast', library.podcast ? undefined : {})} />
          <label htmlFor="podcast">podcast</label>
        </FormField>
      </fieldset>
      {podcast}
    </div>
  );
};

LibraryFormContents.propTypes = {
  className: PropTypes.string,
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

LibraryFormContents.defaultProps = {
  className: undefined,
  errors: {},
};

export default LibraryFormContents;
