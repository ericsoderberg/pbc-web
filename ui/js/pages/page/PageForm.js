"use strict";
import React, { Component, PropTypes } from 'react';
import Form from '../../components/Form';
import FormField from '../../components/FormField';
import FormEvents from '../../utils/FormEvents';

export default class PageForm extends Component {

  constructor (props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._onAddSection = this._onAddSection.bind(this);
    this.state = { page: props.item };
  }

  componentDidMount () {
    this.refs.name.focus();
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ page: nextProps.item });
  }

  _onSubmit () {
    this.props.onSubmit(this.state.page);
  }

  _onAddSection (type) {
  }

  render () {
    const { title, action, submitLabel, onRemove, error } = this.props;
    const { page } = this.state;
    const formEvents = new FormEvents(page, (page) => this.setState({ page: page}));

    return (
      <Form title={title} submitLabel={submitLabel} action={action}
        onSubmit={this._onSubmit} onRemove={onRemove} error={error}>
        <fieldset className="form__fields">
          <FormField name="name" label="Name">
            <input ref="name" name="name" value={page.name || ''}
              onChange={formEvents.change('name')}/>
          </FormField>
        </fieldset>
        <fieldset>
          <FormField label="Add section">
            <button onClick={this._onAddSection.bind(this, 'text')}>Text</button>
            <button onClick={this._onAddSection.bind(this, 'image')}>Image</button>
          </FormField>
        </fieldset>
      </Form>
    );
  }
};

PageForm.propTypes = {
  action: PropTypes.string,
  error: PropTypes.object,
  item: PropTypes.object.isRequired,
  onRemove: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

PageForm.contextTypes = {
  router: PropTypes.any
};
