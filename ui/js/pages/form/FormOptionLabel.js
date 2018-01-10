import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Markdown from 'markdown-to-jsx';

export default class FormOptionLabel extends Component {

  constructor() {
    super();
    this._toggleHelp = this._toggleHelp.bind(this);
    this.state = {};
  }

  componentWillUnmount() {
    if (this.state.helpActive) {
      document.removeEventListener('click', this._toggleHelp);
    }
  }

  _toggleHelp(event) {
    event.preventDefault();
    const helpActive = !this.state.helpActive;
    if (helpActive) {
      document.addEventListener('click', this._toggleHelp);
    } else {
      document.removeEventListener('click', this._toggleHelp);
    }
    this.setState({ helpActive });
  }

  render() {
    const {
      htmlFor, option, formTemplateField, remaining, selected,
    } = this.props;
    const { helpActive } = this.state;

    const labels = [<span key="name">{option.name}</span>];
    if (formTemplateField.monetary && option.value) {
      const classNames = ['form__field-option-amount'];
      if (selected) {
        classNames.push('primary');
      } else {
        classNames.push('tertiary');
      }
      labels.push((
        <span key="amount" className={classNames.join(' ')}>
          $ {option.value}
        </span>
      ));
    }

    let help = option.help || '';
    if (remaining !== undefined) {
      help += `${help ? ', ' : ''}${Math.max(0, remaining)} remaining`;
    }

    if (help) {
      if (help.length > 30) {
        const classNames = ['form-field__help'];
        if (helpActive) {
          classNames.push('form-field__help--active');
        }
        labels.push(
          <span key="help" className={classNames.join(' ')}>
            <button className="button-plain"
              type="button"
              onClick={this._toggleHelp}> ? </button>
            <div className="form-field__help-drop">
              <Markdown>{help}</Markdown>
            </div>
          </span>,
        );
      } else {
        labels.push(<span key="help" className="form-field__help">{help}</span>);
      }
    }

    return (
      <label htmlFor={htmlFor} className="form-option-label">
        {labels}
      </label>
    );
  }
}

FormOptionLabel.propTypes = {
  formTemplateField: PropTypes.object.isRequired,
  htmlFor: PropTypes.string.isRequired,
  option: PropTypes.object.isRequired,
  remaining: PropTypes.number,
  selected: PropTypes.bool,
};

FormOptionLabel.defaultProps = {
  remaining: undefined,
  selected: false,
};
