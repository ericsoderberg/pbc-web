import React, { Component, PropTypes } from 'react';
import Markdown from 'markdown-to-jsx';

export default class FormField extends Component {

  constructor() {
    super();
    this._onClick = this._onClick.bind(this);
    this._onDragEnter = this._onDragEnter.bind(this);
    this._onDragOver = this._onDragOver.bind(this);
    this._onDragLeave = this._onDragLeave.bind(this);
    this._onDrop = this._onDrop.bind(this);
    this.state = {};
  }

  _onClick() {
    // focus on contained input, of only one
    const inputs = this._componentRef.querySelectorAll('input, textarea');
    if (inputs.length === 1) {
      inputs[0].focus();
    }
  }

  _onDragOver(event) {
    event.preventDefault();
  }

  _onDragEnter(event) {
    event.preventDefault();
    this.setState({ dragging: true });
  }

  _onDragLeave(event) {
    event.preventDefault();
    this.setState({ dragging: false });
  }

  _onDrop(event) {
    event.preventDefault();
    this.props.onDrop(event);
    this.setState({ dragging: false });
  }

  render() {
    const { dragging, helpActive } = this.state;
    const classNames = ['form-field'];
    if (dragging) {
      classNames.push('form-field--dragging');
    }

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
      if (this.props.help.length > 30) {
        const helpClassNames = ['form-field__help'];
        if (helpActive) {
          helpClassNames.push('form-field__help--active');
        }
        help = (
          <span className={helpClassNames.join(' ')}>
            <button className="button-plain" type="button"
              onClick={() => this.setState({ helpActive: !helpActive })}>
              ?
            </button>
            <div className="form-field__help-drop">
              <Markdown>{this.props.help}</Markdown>
            </div>
          </span>
        );
      } else {
        help = <span className="form-field__help">{this.props.help}</span>;
      }
    }

    let error;
    if (this.props.error) {
      error = <span className="form-field__error">{this.props.error}</span>;
    }

    let close;
    if (this.props.closeControl) {
      classNames.push('form-field--closable');
      close = (
        <div className="form-field__close">{this.props.closeControl}</div>
      );
    }

    let labels;
    if (label || help || error) {
      labels = (
        <div className="form-field__labels">
          {label}
          <div className="form-field__annotations">
            {help}
            {error}
          </div>
        </div>
      );
    }

    let onDragEnter;
    let onDragOver;
    let onDragLeave;
    let onDrop;
    if (this.props.onDrop) {
      onDragEnter = this._onDragEnter;
      onDragOver = this.onDragOver;
      onDragLeave = this._onDragLeave;
      onDrop = this._onDrop;
    }

    return (
      <div ref={(ref) => { this._componentRef = ref; }}
        className={classNames.join(' ')}
        onClick={this._onClick}
        onDragEnter={onDragEnter} onDragOver={onDragOver}
        onDragLeave={onDragLeave} onDrop={onDrop} >
        {labels}
        {this.props.children}
        {close}
      </div>
    );
  }
}

FormField.propTypes = {
  children: PropTypes.any.isRequired,
  closeControl: PropTypes.node,
  error: PropTypes.string,
  help: PropTypes.node,
  label: PropTypes.string,
  name: PropTypes.string,
  onDrop: PropTypes.func,
};

FormField.defaultProps = {
  closeControl: undefined,
  error: undefined,
  help: undefined,
  label: undefined,
  name: undefined,
  onDrop: undefined,
};
