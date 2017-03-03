"use strict";
import React, { Component, PropTypes } from 'react';
import SectionFields from './SectionFields';

export default class SectionEdit extends Component {

  render () {
    const { children, formState } = this.props;

    return (
      <fieldset className="form__fields section-edit">
        {children}
        <SectionFields formState={formState} />
      </fieldset>
    );
  }
}

SectionEdit.propTypes = {
  formState: PropTypes.object.isRequired
};
