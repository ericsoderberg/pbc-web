"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import SectionsFormContents from '../../components/SectionsFormContents';
import PageDetailsFormContents from './PageDetailsFormContents';

const SECTION_TYPES = [
  'text', 'image', 'event', 'calendar', 'library',
  'people', 'pages', 'video', 'form', 'files'
];

export default class PageFormContents extends Component {

  componentDidMount () {
    const { formState, session } = this.props;
    if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  render () {
    const { className, formState, session } = this.props;
    const page = formState.object;

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField name="name" label="Name">
            <input name="name" value={page.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
        </fieldset>
        <SectionsFormContents formState={formState} types={SECTION_TYPES} />
        <PageDetailsFormContents formState={formState} session={session} />
      </div>
    );
  }
};

PageFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
