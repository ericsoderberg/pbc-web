"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';

export default class NewsletterFormContents extends Component {

  componentDidMount () {
    this.refs.name.focus();
  }

  render () {
    const { formState } = this.props;
    const newsletter = formState.object;

    return (
      <fieldset className="form__fields">
        <FormField label="Name">
          <input ref="name" name="name" value={newsletter.name || ''}
            onChange={formState.change('name')}/>
        </FormField>
      </fieldset>
    );
  }
};

NewsletterFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
