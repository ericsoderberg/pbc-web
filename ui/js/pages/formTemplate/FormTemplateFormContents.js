
import React, { Component, PropTypes } from 'react';
import { getItems, getItem } from '../../actions';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import SelectSearch from '../../components/SelectSearch';
import Button from '../../components/Button';
import TextHelp from '../../components/TextHelp';
import DownIcon from '../../icons/Down';
import UpIcon from '../../icons/Up';
import TrashIcon from '../../icons/Trash';
import FormTemplateSectionEdit from './FormTemplateSectionEdit';

export default class FormTemplateFormContents extends Component {

  constructor() {
    super();
    this._changeDependsOnId = this._changeDependsOnId.bind(this);
    this.state = {
      domains: [],
      expandedSections: {}, // _id or id
      newSectionId: 1,
    };
  }

  componentDidMount() {
    const { formState, session } = this.props;
    if (session.userId.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.error('FormTemplateFormContents catch', error));
    } else if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }
    this._loadDependency(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { formState: { object: { dependsOnId } } } = this.props;
    const { formState: { object: { dependsOnId: nextDependsOnId } } } = nextProps;
    if (nextDependsOnId !== dependsOnId) {
      this._loadDependency(nextProps);
    }
  }

  _loadDependency(props) {
    const { formState: { object: formTemplate } } = props;
    if (formTemplate.dependsOnId) {
      // load dependent form to get fields we might link to
      getItem('form-templates', formTemplate.dependsOnId._id)
      .then(dependsOnFormTemplate => this.setState({ dependsOnFormTemplate }))
      .catch(error => console.error(
        'FormTemplateFormContents dependsOnFormTemplate catch', error));
    } else {
      this.setState({ dependsOnFormTemplate: undefined });
    }
  }

  _addSection() {
    return this.props.formState.addTo('sections', () => {
      const id = this.state.newSectionId;
      const expandedSections = { ...this.state.expandedSections };
      expandedSections[id] = true;
      this.setState({
        expandedSections,
        newSectionId: this.state.newSectionId + 1,
      });
      return { id };
    });
  }

  _toggleSection(id) {
    return () => {
      const expandedSections = { ...this.state.expandedSections };
      expandedSections[id] = !expandedSections[id];
      this.setState({ expandedSections });
    };
  }

  _changeDependsOnId(suggestion) {
    const { formState } = this.props;
    const dependsOnId = suggestion ?
      { _id: suggestion._id, name: suggestion.name } : undefined;
    if (!dependsOnId) {
      // clear any linkedTo fields too
      const sections = formState.object.sections.slice(0);
      sections.forEach((section) => {
        section.fields.forEach((field) => {
          field.linkedToId = undefined;
        });
      });
      formState.set('sections', sections);
    }
    formState.set('dependsOnId', dependsOnId);
  }

  render() {
    const { className, errors, formState, session } = this.props;
    const { expandedSections, detailsActive, dependsOnFormTemplate } = this.state;
    const formTemplate = formState.object;

    // build field id/name list for dependencies
    const dependableFields = [];
    (formTemplate.sections || []).forEach((section) => {
      (section.fields || []).forEach((field) => {
        if (field.type !== 'instructions') {
          dependableFields.push({
            id: field._id || field.id,
            name: field.name,
            sectionId: section._id || section.id,
          });
        }
      });
    });

    const sections = (formTemplate.sections || []).map((section, index) => {
      let sectionClassName;

      const raise = (index === 0 ? undefined : (
        <button type="button" className="button-icon"
          onClick={formState.swapWith('sections', index, index - 1)}>
          <UpIcon />
        </button>
      ));
      const lower = (index === (formTemplate.sections.length - 1) ?
        undefined : (
          <button type="button" className="button-icon"
            onClick={formState.swapWith('sections', index, index + 1)}>
            <DownIcon />
          </button>
        ));

      let header;
      if (formTemplate.sections.length > 1) {
        sectionClassName = 'form-section';
        header = (
          <div className="form-item form-item__controls">
            <button type="button" className="button-plain form-item__control"
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
      if (!header || expandedSections[section._id] ||
        expandedSections[section.id]) {
        edit = (
          <FormTemplateSectionEdit section={section}
            family={formTemplate.family}
            dependableFields={dependableFields}
            dependsOnFormTemplate={dependsOnFormTemplate}
            includeName={formTemplate.sections.length > 1}
            onChange={formState.changeAt('sections', index)} />
        );
      }

      return (
        <div key={section._id || section.id} className={sectionClassName}>
          {header}
          {edit}
        </div>
      );
    });

    let details;
    if (detailsActive) {
      details = [
        <FormField key="submit" label="Submit button label"
          error={errors.submitLabel}>
          <input name="submitLabel"
            value={formTemplate.submitLabel || 'Submit'}
            onChange={formState.change('submitLabel')} />
        </FormField>,
        <FormField key="message" label="Post submit message"
          help={<TextHelp />} error={errors.postSubmitMessage}>
          <textarea name="postSubmitMessage" rows={2}
            value={formTemplate.postSubmitMessage || ''}
            onChange={formState.change('postSubmitMessage')} />
        </FormField>,
        <FormField key="ack" error={errors.acknowledge}>
          <input name="acknowledge" type="checkbox"
            checked={formTemplate.acknowledge || false}
            onChange={formState.toggle('acknowledge')} />
          <label htmlFor="acknowledge">acknowledge via email</label>
        </FormField>,
        <FormField key="auth" error={errors.authenticate}>
          <input name="authenticate" type="checkbox"
            checked={formTemplate.authenticate || false}
            onChange={formState.toggle('authenticate')} />
          <label htmlFor="authenticate">authenticate</label>
        </FormField>,
        <FormField key="pay" error={errors.payable}>
          <input name="payable" type="checkbox"
            checked={formTemplate.payable || false}
            onChange={formState.toggle('payable')} />
          <label htmlFor="payable">accept payment</label>
        </FormField>,
      ];

      if (formTemplate.payable) {
        details.push(
          <FormField key="check" label="Check instructions"
            help="Leave blank to not allow checks"
            error={errors.payByCheckInstructions}>
            <textarea name="payByCheckInstructions"
              value={formTemplate.payByCheckInstructions || ''}
              onChange={formState.change('payByCheckInstructions')} />
          </FormField>,
        );
      }

      if (formTemplate.authenticate) {
        details.push(
          <FormField key="depends" label="Depends on"
            help={`Another form that must be filled out first.
              This only works for authenticated forms.`}
            error={errors.dependsOnId}>
            <SelectSearch category="form-templates" clearable={true}
              options={{ filter: { authenticate: true } }}
              value={(formTemplate.dependsOnId || {}).name || ''}
              onChange={this._changeDependsOnId} />
          </FormField>,
        );
      }

      details.push(
        <FormField key="notify" label="Notify email addresses"
          help="Whom to notify when people submit filled out forms."
          error={errors.notify}>
          <input name="notify"
            value={formTemplate.notify || ''}
            onChange={formState.change('notify')} />
        </FormField>,
      );

      if (session.userId.administrator) {
        const domains = this.state.domains.map(domain => (
          <option key={domain._id} label={domain.name} value={domain._id} />
        ));
        domains.unshift(<option key={0} />);
        details.push(
          <FormField key="admin" label="Administered by" error={errors.domainId}>
            <select name="domainId" value={formTemplate.domainId || ''}
              onChange={formState.change('domainId')}>
              {domains}
            </select>
          </FormField>,
        );
      }
    } else {
      details = (
        <button className="form-fields__more-control button button-plain"
          onClick={() => this.setState({ detailsActive: true })}>details</button>
      );
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Form name" error={errors.name}>
            <input name="name" value={formTemplate.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          {details}
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
}

FormTemplateFormContents.propTypes = {
  className: PropTypes.string,
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

FormTemplateFormContents.defaultProps = {
  className: undefined,
  errors: undefined,
};
