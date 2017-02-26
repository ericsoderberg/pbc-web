"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import DateInput from '../../components/DateInput';
import FormState from '../../utils/FormState';

export default class ChildEdit extends Component {

  constructor (props) {
    super(props);
    this._onToggle = this._onToggle.bind(this);
    const { child, defaultActive, onChange } = props;
    this.state = {
      active: defaultActive, formState: new FormState(child, onChange)
    };
  }

  componentWillReceiveProps (nextProps) {
    const { child, onChange } = nextProps;
    this.setState({ formState: new FormState(child, onChange) });
  }

  _onToggle () {
    this.setState({ active: ! this.state.active });
  }

  render () {
    const { onRemove } = this.props;
    const { active, formState } = this.state;
    const child = formState.object;

    let contents;
    if (active) {
      contents = (
        <fieldset className="form__fields">
          <FormField label="Name">
            <input name="name" value={child.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          <FormField label="Birthday">
            <DateInput value={child.birthday || ''}
              onChange={formState.change('birthday')} />
          </FormField>
          <FormField label="Grade">
            <input name="grade" value={child.grade || ''}
              onChange={formState.change('grade')}/>
          </FormField>
          <FormField label="Notes">
            <textarea name="notes" value={child.notes || ''} rows={4}
              onChange={formState.change('notes')}/>
          </FormField>
        </fieldset>
      );
    }

    return (
      <div>
        <div type="button" className="form-item">
          <button type="button" className="button-plain form-item-control"
            onClick={this._onToggle}>
            <h3>{child.name}</h3>
          </button>
          <div className="box--row box--static">
            <button type="button" className="button-plain" onClick={onRemove}>
              remove
            </button>
          </div>
        </div>
        {contents}
      </div>
    );
  }
}

ChildEdit.defaultProps = {
  child: PropTypes.object.isRequired,
  defaultActive: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired
};
