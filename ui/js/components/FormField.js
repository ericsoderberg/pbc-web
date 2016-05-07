"use strict";
import React, { Component, PropTypes, Children } from 'react';

export default class FormField extends Component {

  render () {
    let label;
    if (this.props.label) {
      label = (
        <label className="form-field__label" htmlFor={this.props.name}>
          {this.props.label}
        </label>
      );
    }

    let help;
    if (this.props.help) {
      help = <span className="form-field__help">{this.props.help}</span>;
    }

    let error;
    if (this.props.error) {
      error = <span className="form-field__error">{this.props.error}</span>;
    }

    let children = Children.map(this.props.children, child => {
      let result = child;
      if (child) {
        const classes = [child.props.className, 'form-field__input'];
        result = React.cloneElement(child, { className: classes.join(' ') });
      }
      return result;
    });

    return (
      <div className="form-field">
        <div className="form-field__labels">
          {label}
          <div>
            {help}
            {error}
          </div>
        </div>
        {children}
      </div>
    );
  }
};

FormField.propTypes = {
  error: PropTypes.string,
  help: PropTypes.node,
  label: PropTypes.string,
  name: PropTypes.string
};
