"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems, getItem } from '../../actions';
import Section from '../../components/Section';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import FormAdd from './FormAdd';
import FormEdit from './FormEdit';
import FormItem from './FormItem';

class FormSummary extends Component {

  constructor (props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._onDone = this._onDone.bind(this);
    this.state = { };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.formTemplateId !== this.props.formTemplateId) {
      this._load(nextProps);
    }
  }

  _load (props) {
    const { formTemplate, formTemplateId } = props;
    if (! formTemplate) {
      getItem('form-templates', formTemplateId, { select: 'name' })
      .then(formTemplate => this.setState({ formTemplate: formTemplate }))
      .catch(error => console.log('!!! FormSummary formTemplate catch', error));
    }
    this._loadForms(props);
  }

  _loadForms (props) {
    const { formTemplateId } = props;
    getItems('forms',
      { filter: { formTemplateId: formTemplateId },
        select: 'modified userId', populate: true })
    .then(forms => this.setState({ forms: forms }))
    .catch(error => console.log('!!! FormSummary forms catch', error));
  }

  _onAdd () {
    this.setState({ adding: true });
  }

  _edit (id) {
    return () => {
      this.setState({ editId: id });
    };
  }

  _onCancel () {
    this.setState({ adding: undefined, editId: undefined });
  }

  _onDone () {
    this.setState({ adding: undefined, editId: undefined });
    this._loadForms(this.props);
  }

  render () {
    const { color, full, plain, formTemplateId } = this.props;
    const { formTemplate, forms, adding, editId } = this.state;

    let contents;
    if (! forms || ! formTemplate) {
      contents = <Loading />;
    } else if (adding || forms.length === 0) {
      const onCancel = forms.length > 0 ? this._onCancel : undefined;
      contents = (
        <FormAdd formTemplateId={formTemplateId}
          onDone={this._onDone} onCancel={onCancel} />
      );
    } else if (editId) {
      contents = (
        <FormEdit id={editId}
          onDone={this._onDone} onCancel={this._onCancel} />
      );
    } else {
      const items = forms.map(form => (
        <li key={form._id}>
          <FormItem item={form} onClick={this._edit(form._id)} />
        </li>
      ));
      contents = (
        <div>
          <div className="form-summary">
            <h2>{formTemplate.name}</h2>
            <ul className="list">
              {items}
            </ul>
            <button type="button" className="button button--secondary"
              onClick={this._onAdd}>
              Add another
            </button>
          </div>
        </div>
      );
    }

    return (
      <Section color={color} full={full} plain={plain}>
        {contents}
      </Section>
    );
  }
};

FormSummary.propTypes = {
  formTemplate: PropTypes.object,
  formTemplateId: PropTypes.string.isRequired,
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string,
    userId: PropTypes.string
  }),
  ...Section.propTypes
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(FormSummary, select);
