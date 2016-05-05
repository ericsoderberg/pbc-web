"use strict";
import React, { Component, PropTypes } from 'react';

export default class FormError extends Component {

  render () {
    const { message } = this.props;
    let classes = ['form-error'];
    let text;
    if (message) {
      classes.push('form-error--active');
      text = message.error || message;
    }
    return (
      <div className={classes.join(' ')}>
        <div className="form-error__message">
          {text}
        </div>
      </div>
    );
  }
};

FormError.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};
