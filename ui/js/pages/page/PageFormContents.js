
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';
import SectionsFormContents from '../../components/SectionsFormContents';
import PageDetailsFormContents from './PageDetailsFormContents';

const SECTION_TYPES = [
  'text', 'image', 'event', 'calendar', 'library',
  'people', 'pages', 'video', 'form', 'files',
];

const DONATE_REGEXP = /giving at PBC/i;

export default class PageFormContents extends Component {

  componentDidMount() {
    const { formState, session } = this.props;
    if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }
  }

  render() {
    const { className, errors, formState, session } = this.props;
    const page = formState.object;

    const types = [...SECTION_TYPES];
    if (page.name && page.name.match(DONATE_REGEXP)) {
      types.push('donate');
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField name="name" label="Name">
            <input name="name"
              value={page.name || ''}
              onChange={formState.change('name')} />
          </FormField>
        </fieldset>
        <SectionsFormContents formState={formState} types={types} />
        <PageDetailsFormContents formState={formState}
          session={session}
          errors={errors} />
      </div>
    );
  }
}

PageFormContents.propTypes = {
  className: PropTypes.string,
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

PageFormContents.defaultProps = {
  className: undefined,
  errors: undefined,
};
