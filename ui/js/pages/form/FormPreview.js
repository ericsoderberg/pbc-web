"use strict";
import React, { Component, PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import FormAdd from './FormAdd';

export default class FormPreview extends Component {

  render () {
    const { item: formTemplate } = this.props;
    return (
      <main className="page-preview">
        <PageHeader />
        <FormAdd formTemplate={formTemplate} />
      </main>
    );
  }
};

FormPreview.propTypes = {
  item: PropTypes.object.isRequired
};
