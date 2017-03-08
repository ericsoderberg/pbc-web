import React, { Component, PropTypes } from 'react';
import Markdown from 'markdown-to-jsx';

export default class FormOptionLabel extends Component {

  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { name, option, formTemplateField, selected } = this.props;
    const { helpActive } = this.state;

    const labels = [<span key="name">{option.name}</span>];
    if (formTemplateField.monetary && option.value) {
      const classNames = ['form__field-option-amount'];
      if (selected) {
        classNames.push('primary');
      } else {
        classNames.push('tertiary');
      }
      labels.push(
        <span key="amount" className={classNames.join(' ')}>
          $ {option.value}
        </span>,
      );
    }

    if (option.help) {
      const classNames = ['form-field__help'];
      if (helpActive) {
        classNames.push('form-field__help--active');
      }
      labels.push(
        <span key="help" className={classNames.join(' ')}>
          <button className="button-plain" type="button"
            onClick={() => this.setState({ helpActive: !helpActive })}>
            ?
          </button>
          <div className="form-field__help-drop">
            <Markdown>{option.help}</Markdown>
          </div>
        </span>,
      );
    }

    return (
      <label htmlFor={name} className="form-option-label">
        {labels}
      </label>
    );
  }
}

FormOptionLabel.propTypes = {
  formTemplateField: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  option: PropTypes.object.isRequired,
  selected: PropTypes.bool,
};

FormOptionLabel.defaultProps = {
  selected: false,
};
