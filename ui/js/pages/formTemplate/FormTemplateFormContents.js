"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import Button from '../../components/Button';
import DownIcon from '../../icons/Down';
import UpIcon from '../../icons/Up';
import TrashIcon from '../../icons/Trash';
import FormTemplateSectionEdit from './FormTemplateSectionEdit';

export default class FormTemplateFormContents extends Component {

  constructor () {
    super();
    this.state = {
      domains: [],
      expandedSections: {}, // _id or id
      newSectionId: 1
    };
  }

  componentDidMount () {
    const { formState, session } = this.props;
    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.log('FormTemplateFormContents catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  _addSection () {
    return this.props.formState.addTo('sections', () => {
      const id = this.state.newSectionId;
      let expandedSections = { ...this.state.expandedSections };
      expandedSections[id] = true;
      this.setState({
        expandedSections: expandedSections,
        newSectionId: this.state.newSectionId + 1
      });
      return { id: id };
    });
  }

  _toggleSection (id) {
    return () => {
      let expandedSections = { ...this.state.expandedSections };
      expandedSections[id] = ! expandedSections[id];
      this.setState({ expandedSections: expandedSections });
    };
  }

  render () {
    const { className, formState, session } = this.props;
    const { expandedSections, moreActive } = this.state;
    const formTemplate = formState.object;

    // build field id/name list for dependencies
    let dependableFields = [];
    (formTemplate.sections || []).forEach(section => {
      (section.fields || []).forEach(field => {
        if ('instructions' !== field.type) {
          dependableFields.push({
            id: field._id || field.id,
            name: field.name,
            sectionId: section._id || section.id
          });
        }
      });
    });

    const sections = (formTemplate.sections || []).map((section, index) => {
      let className;

      const raise = (index === 0 ? undefined : (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('sections', index, index-1)}>
          <UpIcon />
        </button>
      ));
      const lower = (index === (formTemplate.sections.length - 1) ?
        undefined : (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('sections', index, index+1)}>
          <DownIcon />
        </button>
      ));

      let header;
      if (formTemplate.sections.length > 1) {
        className = "form-section";
        header = (
          <div className="form-item">
            <button type="button" className="button-plain"
              onClick={this._toggleSection(section._id || section.id)}>
              <h4>{section.name || `Section ${index + 1}`}</h4>
            </button>
            <div className="box--row">
              {raise}
              {lower}
              <button type="button" className="button-icon"
                onClick={formState.removeAt('sections', index)}>
                <TrashIcon />
              </button>
            </div>
          </div>
        );
      }

      let edit;
      if (! header || expandedSections[section._id] ||
        expandedSections[section.id]) {
        edit = (
          <FormTemplateSectionEdit key={index} section={section}
            dependableFields={dependableFields}
            includeName={formTemplate.sections.length > 1}
            onChange={formState.changeAt('sections', index)} />
        );
      }

      return (
        <div key={index} className={className}>
          {header}
          {edit}
        </div>
      );
    });

    let more;
    if (moreActive) {
      more = [
        <FormField key="submit" label="Submit button label">
          <input name="submitLabel"
            value={formTemplate.submitLabel || 'Submit'}
            onChange={formState.change('submitLabel')} />
        </FormField>,
        <FormField key="message" label="Post submit message">
          <textarea name="postSubmitMessage" rows={2}
            value={formTemplate.postSubmitMessage || ''}
            onChange={formState.change('postSubmitMessage')}/>
        </FormField>,
        <FormField key="ack">
          <input name="acknowledge" type="checkbox"
            checked={formTemplate.acknowledge || false}
            onChange={formState.toggle('acknowledge')} />
          <label htmlFor="acknowledge">acknowledge via email</label>
        </FormField>,
        <FormField key="auth">
          <input name="authenticate" type="checkbox"
            checked={formTemplate.authenticate || false}
            onChange={formState.toggle('authenticate')} />
          <label htmlFor="authenticate">authenticate</label>
        </FormField>,
        <FormField key="family">
          <input name="family" type="checkbox"
            checked={formTemplate.family || false}
            onChange={formState.toggle('family')} />
          <label htmlFor="family">family</label>
        </FormField>,
        <FormField key="pay">
          <input name="payable" type="checkbox"
            checked={formTemplate.payable || false}
            onChange={formState.toggle('payable')} />
          <label htmlFor="payable">accept payment</label>
        </FormField>
      ];

      if (formTemplate.payable) {
        more.push(
          <FormField key="check" label="Check instructions"
            help="Leave blank to not allow checks">
            <textarea name="payByCheckInstructions"
              value={formTemplate.payByCheckInstructions || ''}
              onChange={formState.change('payByCheckInstructions')} />
          </FormField>
        );
      }

      more.push(
        <FormField key="notify" label="Notify email addresses">
          <input name="notify"
            value={formTemplate.notify || ''}
            onChange={formState.change('notify')} />
        </FormField>
      );

      if (session.administrator) {
        let domains = this.state.domains.map(domain => (
          <option key={domain._id} label={domain.name} value={domain._id} />
        ));
        domains.unshift(<option key={0} />);
        more.push(
          <FormField key="admin" label="Administered by">
            <select name="domainId" value={formTemplate.domainId || ''}
              onChange={formState.change('domainId')}>
              {domains}
            </select>
          </FormField>
        );
      }
    } else {
      more = (
        <a className="form-fields__more-control"
          onClick={() => this.setState({ moreActive: true })}>details</a>
      );
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Form name">
            <input name="name" value={formTemplate.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          {more}
        </fieldset>
        {sections}
        <fieldset className="form__fields">
          <FormFieldAdd>
            <Button label="Add section" secondary={true}
              onClick={this._addSection()} />
          </FormFieldAdd>
        </fieldset>
      </div>
    );
  }
};

FormTemplateFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
