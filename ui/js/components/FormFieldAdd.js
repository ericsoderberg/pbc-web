import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import AddIcon from '../icons/Add';

export default class FormField extends Component {

  constructor() {
    super();
    this._onClick = this._onClick.bind(this);
    this.state = { active: false };
  }

  _onClick() {
    this.setState({ active: !this.state.active });
  }

  render() {
    const { active } = this.state;
    const classNames = ['form-field-add'];
    if (active) {
      classNames.push('form-field-add--active');
    }

    let control;
    if (Children.count(this.props.children) > 1) {
      control = (
        <Button className="form-field-add__control"
          icon={<AddIcon />}
          onClick={this._onClick} />
      );
    }

    let children;
    if (active || Children.count(this.props.children) <= 1) {
      children = this.props.children;
    }

    return (
      <div className={classNames.join(' ')}
        onClick={active ? this._onClick : undefined}>
        {control}
        {children}
      </div>
    );
  }
}

FormField.propTypes = {
  children: PropTypes.any.isRequired,
};
