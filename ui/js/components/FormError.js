"use strict";
import React, { Component, PropTypes } from 'react';
import Markdown from 'markdown-to-jsx';

export default class FormError extends Component {

  render () {
    const { message, error } = this.props;
    let classes = ['form-error'];
    let text;
    if (message) {
      classes.push('form-error--active');
      text = message.error || message;
    }
    if (error && error.errmsg) {
      classes.push('form-error--active');
      text = error.errMsg;
    }
    return (
      <div className={classes.join(' ')}>
        <div className="form-error__message">
          <Markdown>{text || ''}</Markdown>
        </div>
      </div>
    );
  }
};

FormError.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  error: PropTypes.shape({
    error: PropTypes.shape({
      errMsg: PropTypes.string,
      errors: PropTypes.object
    })
  })
};
