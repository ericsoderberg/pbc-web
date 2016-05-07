"use strict";
import React, { Component, PropTypes } from 'react';
import Form from '../../components/Form';
import FormField from '../../components/FormField';
import FormEvents from '../../utils/FormEvents';
import TextSectionEdit from './TextSectionEdit';
import ImageSectionEdit from './ImageSectionEdit';

const SECTIONS = {
  image: ImageSectionEdit,
  text: TextSectionEdit
};

export default class PageForm extends Component {

  constructor (props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._setPage = this._setPage.bind(this);
    this._onAddSection = this._onAddSection.bind(this);
    this._onChangeSection = this._onChangeSection.bind(this);
    this._onSwapSection = this._onSwapSection.bind(this);
    this._onRemoveSection = this._onRemoveSection.bind(this);
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

  _setPage (page) {
    this.setState({ page: page});
  }

  _onAddSection (type) {
    let page = { ...this.state.page };
    if (! page.sections) {
      page.sections = [];
    }
    page.sections.push({
      type: type
    });
    this._setPage(page);
  }

  _onChangeSection (section, index) {
    let page = { ...this.state.page };
    page.sections = page.sections.slice(0);
    page.sections[index] = section;
    this._setPage(page);
  }

  _onSwapSection (section, index, nextIndex) {
    let page = { ...this.state.page };
    page.sections = page.sections.slice(0);
    page.sections[index] = page.sections[nextIndex];
    page.sections[nextIndex] = section;
    this._setPage(page);
  }

  _onRemoveSection (index) {
    let page = { ...this.state.page };
    page.sections = page.sections.slice(0);
    page.sections.splice(index, 1);
    this._setPage(page);
  }

  render () {
    const { title, action, submitLabel, onRemove, error } = this.props;
    const { page } = this.state;
    const formEvents = new FormEvents(page, this._setPage);

    const sections = (page.sections || []).map((section, index) => {
      const Section = SECTIONS[section.type];
      const raise = (index === 0 ? undefined : (
        <button type="button" onClick={
            this._onSwapSection.bind(this, section, index, index - 1)}>up</button>
      ));
      const lower = (index === (page.sections.length - 1) ? undefined : (
        <button type="button" onClick={
            this._onSwapSection.bind(this, section, index, index + 1)}>down</button>
        ));
      return (
        <div key={index}>
          <div className="form__fields-header">
            {raise}
            {lower}
            <button type="button" onClick={this._onRemoveSection}>remove</button>
          </div>
          <Section section={section}
            onChange={(nextSection) => this._onChangeSection(nextSection, index)} />
        </div>
      );
    });

    const addControls = ['text', 'image'].map(type => (
      <button key={type} type="button" onClick={this._onAddSection.bind(this, type)}>
        {type}
      </button>
    ));

    return (
      <Form title={title} submitLabel={submitLabel} action={action}
        onSubmit={this._onSubmit} onRemove={onRemove} error={error}>
        <fieldset className="form__fields">
          <FormField name="name" label="Name">
            <input ref="name" name="name" value={page.name || ''}
              onChange={formEvents.change('name')}/>
          </FormField>
        </fieldset>
        {sections}
        <fieldset>
          <FormField label="Add section">
            {addControls}
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
