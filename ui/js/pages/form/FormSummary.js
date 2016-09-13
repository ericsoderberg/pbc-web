"use strict";
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router';
import moment from 'moment';
import { getItems, getItem } from '../../actions';
import Section from '../../components/Section';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import Button from '../../components/Button';
import AddIcon from '../../icons/Add';
import FormAdd from './FormAdd';
import FormEdit from './FormEdit';

const LABEL = {
  'Register': 'registered',
  'Sign Up': 'signed up',
  'Submit': 'submitted',
  'Subscribe': 'subscribed'
};

const FormItem = (props) => {
  const { className, distinguish, item: form, onClick, verb } = props;
  const classNames = ['item__container', className];
  const timestamp = moment(form.modified).format('MMM Do YYYY');
  let message;
  if (distinguish) {
    message = `You ${verb} for ${form.name} on ${timestamp}`;
  } else {
    message = `You ${verb} on ${timestamp}`;
  }

  return (
    <div className={classNames.join(' ')}>
      <div className="item item--full">
        <span>{message}</span>
        <Button label="Change" plain={true} onClick={onClick} />
      </div>
    </div>
  );

};

FormItem.propTypes = {
  distinguish: PropTypes.bool,
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  verb: PropTypes.string.isRequired
};

class FormSummary extends Component {

  constructor (props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._onDone = this._onDone.bind(this);
    this._layout = this._layout.bind(this);
    this.state = { height: 100, pad: 100 };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.formTemplateId !== this.props.formTemplateId) {
      this._load(nextProps);
    }
  }

  componentDidUpdate () {
    clearTimeout(this._layoutTimer);
    this._layoutTimer = setTimeout(this._layout, 100);
  }

  componentWillUnmount () {
    clearTimeout(this._layoutTimer);
  }

  _layout () {
    const container = findDOMNode(this.refs.container);
    const child = container.childNodes[0];
    const rect = child.getBoundingClientRect();
    if (this.state.height !== rect.height) {
      const style = window.getComputedStyle(container, null);
      const pad = parseInt(style.paddingTop, 10) +
        parseInt(style.paddingBottom, 10);
      this.setState({ height: rect.height, pad: pad });
    }
  }

  _load (props) {
    const { formTemplate, formTemplateId } = props;
    if (! formTemplate) {
      getItem('form-templates', formTemplateId._id || formTemplateId,
        { select: 'name submitLabel' })
      .then(formTemplate => this.setState({ formTemplate: formTemplate }))
      .catch(error => console.log('!!! FormSummary formTemplate catch', error));
    }
    this._loadForms(props);
  }

  _loadForms (props) {
    const { formTemplateId, session } = props;
    if (session) {
      getItems('forms',{
        filter: {
          formTemplateId: (formTemplateId._id || formTemplateId),
          userId: session.userId
        },
        select: 'modified userId name', populate: true
      })
      .then(forms => this.setState({ forms: forms }))
      .catch(error => console.log('!!! FormSummary forms catch', error));
    } else {
      this.setState({ forms: [] });
    }
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
    const { color, full, plain, formTemplateId, session } = this.props;
    const { formTemplate, forms, adding, editId, height, pad } = this.state;

    let contents;
    if (! forms || ! formTemplate) {
      contents = <Loading />;
    } else if (adding || forms.length === 0) {
      const onCancel = forms.length > 0 ? this._onCancel : undefined;
      contents = (
        <FormAdd formTemplateId={formTemplateId._id || formTemplateId}
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
          <FormItem item={form} onClick={this._edit(form._id)}
            verb={LABEL[formTemplate.submitLabel || 'Submit']}
            distinguish={forms.length > 1} />
        </li>
      ));
      let heading = formTemplate.name;
      if (session.administrator) {
        heading = (
          <Link to={`/form-templates/${formTemplate.formTemplateId}/edit`}>
            {formTemplate.name}
          </Link>
        );
      }
      contents = (
        <div className="form-summary">
          <div className="box--between">
            <h2>{heading}</h2>
            <Button plain={true} icon={<AddIcon />}
              onClick={this._onAdd} />
          </div>
          <ul className="list">
            {items}
          </ul>
        </div>
    );
    }

    return (
      <Section color={color} full={full} plain={plain}>
        <div ref="container" className="form-summary__container"
          style={{ height: height + pad }}>
          {contents}
        </div>
      </Section>
    );
  }
};

FormSummary.propTypes = {
  formTemplate: PropTypes.object,
  formTemplateId: PropTypes.oneOfType([
    PropTypes.string, PropTypes.object]).isRequired,
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
