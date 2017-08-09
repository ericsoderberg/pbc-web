
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory, loadItem, unloadItem } from '../../actions';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import SelectSearch from '../../components/SelectSearch';
import Button from '../../components/Button';
import TextHelp from '../../components/TextHelp';
import DownIcon from '../../icons/DownArrow';
import UpIcon from '../../icons/UpArrow';
import BlankIcon from '../../icons/Blank';
import TrashIcon from '../../icons/Trash';
import FormTemplateSectionEdit from './FormTemplateSectionEdit';

let linkedToFormTemplateId; // hack for now

class FormTemplateFormContents extends Component {

  constructor() {
    super();
    this._changeLinkedFormTemplateId = this._changeLinkedFormTemplateId.bind(this);
    this._onMove = this._onMove.bind(this);
    this.state = {
      expandedSections: {}, // _id or id
      newSectionId: 1,
    };
  }

  componentDidMount() {
    const { dispatch, formState, session } = this.props;
    if (session.userId.administrator) {
      dispatch(loadCategory('domains', { sort: 'name' }));
    } else if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }
    dispatch(loadCategory('email-lists', { sort: 'name' }));
    this._loadDependency(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { formState: { object: { linkedFormTemplateId } } } = this.props;
    const { formState: { object: { linkedFormTemplateId: nextLinkedFormTemplateId } } } = nextProps;
    if (nextLinkedFormTemplateId !== linkedFormTemplateId) {
      this._loadDependency(nextProps);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCategory('domains'));
    dispatch(unloadCategory('email-lists'));
  }

  _loadDependency(props) {
    const { dispatch, formState: { object: formTemplate } } = props;
    if (formTemplate.linkedFormTemplateId) {
      // load linked form to get fields we might link to
      linkedToFormTemplateId = formTemplate.linkedFormTemplateId._id;
      dispatch(loadItem('form-templates', formTemplate.linkedFormTemplateId._id));
    } else if (linkedToFormTemplateId) {
      dispatch(unloadItem('form-templates', linkedToFormTemplateId));
      linkedToFormTemplateId = undefined;
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
      return { id: `${id}`, fields: [] };
    });
  }

  _toggleSection(id) {
    return () => {
      const expandedSections = { ...this.state.expandedSections };
      expandedSections[id] = !expandedSections[id];
      this.setState({ expandedSections });
    };
  }

  _changeLinkedFormTemplateId(suggestion) {
    const { formState } = this.props;
    const linkedFormTemplateId = suggestion ?
      { _id: suggestion._id, name: suggestion.name } : undefined;
    if (!linkedFormTemplateId) {
      // clear any linkedField fields too
      const sections = formState.object.sections.slice(0);
      sections.forEach((section) => {
        section.fields.forEach((field) => {
          field.linkedFieldId = undefined;
        });
      });
      formState.set('sections', sections);
    }
    formState.set('linkedFormTemplateId', linkedFormTemplateId);
  }

  _onMove(fieldId, oldSectionId, newSectionId) {
    const { formState } = this.props;
    const sections = formState.object.sections.slice(0);
    let newSection;
    let field;
    sections.forEach((section) => {
      if (section._id === newSectionId || section.id === newSectionId) {
        // remember new section
        newSection = section;
      } else if (section._id === oldSectionId || section.id === oldSectionId) {
        // remove field from old section
        section.fields = section.fields.filter((f) => {
          if (f._id === fieldId) {
            field = f;
            return false;
          }
          return true;
        });
      }
    });
    // add field to new section
    newSection.fields.push(field);
    formState.set('sections', sections);
  }

  render() {
    const {
      className, domains, emailLists, errors, formState, linkedToFormTemplate,
      session,
    } = this.props;
    const { expandedSections, detailsActive } = this.state;
    const formTemplate = formState.object;

    const sections = (formTemplate.sections || []).map((section, index) => {
      let sectionClassName;

      let raise;
      if (index !== 0) {
        raise = (
          <button type="button"
            className="button-icon"
            onClick={formState.swapWith('sections', index, index - 1)}>
            <UpIcon />
          </button>
        );
      }
      let lower;
      if (index < (formTemplate.sections.length - 1)) {
        lower = (
          <button type="button"
            className="button-icon"
            onClick={formState.swapWith('sections', index, index + 1)}>
            <DownIcon />
          </button>
        );
      } else {
        lower = (
          <button type="button" className="button-icon">
            <BlankIcon />
          </button>
        );
      }

      let header;
      if (formTemplate.sections.length > 1) {
        sectionClassName = 'form-section';
        header = (
          <div className="form-item form-item__controls">
            <button type="button"
              className="button-plain form-item__control"
              onClick={this._toggleSection(section._id || section.id)}>
              <h4>{section.name || `Section ${index + 1}`}</h4>
            </button>
            <div className="box--row box--static">
              {raise}
              {lower}
              <button type="button"
                className="button-icon"
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
            formTemplate={formTemplate}
            linkedToFormTemplate={linkedToFormTemplate}
            onChange={formState.changeAt('sections', index)}
            onMove={this._onMove} />
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
        <FormField key="submit"
          label="Submit button label"
          error={errors.submitLabel}>
          <input name="submitLabel"
            value={formTemplate.submitLabel || 'Submit'}
            onChange={formState.change('submitLabel')} />
        </FormField>,
        <FormField key="message"
          label="Post submit message"
          help={<TextHelp />}
          error={errors.postSubmitMessage}>
          <textarea name="postSubmitMessage"
            rows={2}
            value={formTemplate.postSubmitMessage || ''}
            onChange={formState.change('postSubmitMessage')} />
        </FormField>,
        <FormField key="another"
          label="Another button label"
          help="if multiple are expected per user"
          error={errors.anotherLabel}>
          <input name="anotherLabel"
            value={formTemplate.anotherLabel || ''}
            onChange={formState.change('anotherLabel')} />
        </FormField>,
        <FormField key="ack"
          error={errors.acknowledge}
          help={`After a form is submitted, the submitter will be sent a
            standardized email indicating that we received it`}>
          <input name="acknowledge"
            type="checkbox"
            checked={formTemplate.acknowledge || false}
            onChange={formState.toggle('acknowledge')} />
          <label htmlFor="acknowledge">acknowledge via email</label>
        </FormField>,
        <FormField key="auth" error={errors.authenticate}>
          <input name="authenticate"
            type="checkbox"
            checked={formTemplate.authenticate || false}
            onChange={formState.toggle('authenticate')} />
          <label htmlFor="authenticate">authenticate</label>
        </FormField>,
        <FormField key="pay" error={errors.payable}>
          <input name="payable"
            type="checkbox"
            checked={formTemplate.payable || false}
            onChange={formState.toggle('payable')} />
          <label htmlFor="payable">accept payment</label>
        </FormField>,
      ];

      if (formTemplate.payable) {
        details.push(
          <FormField key="check"
            label="Check instructions"
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
          <FormField key="linkedTo"
            label="Linked to"
            help={`Another form that must be filled out first.
              This only works for authenticated forms.`}
            error={errors.linkedFormTemplateId}>
            <SelectSearch category="form-templates"
              clearable={true}
              options={{ filter: { authenticate: true } }}
              value={(formTemplate.linkedFormTemplateId || {}).name || ''}
              onChange={this._changeLinkedFormTemplateId} />
          </FormField>,
        );
      }

      const options2 = emailLists.map(emailList => (
        <option key={emailList._id} label={emailList.name} value={emailList._id} />
      ));
      options2.unshift(<option key={0} />);
      details.push(
        <FormField key="emailList"
          label="Email list"
          help={`Email addresses will be added and removed from this email list
            when forms are added and removed. Other email addresses in the
            email list will not be affected.`}
          error={errors.emailListId}>
          <select name="emailListId"
            value={formTemplate.emailListId || ''}
            onChange={formState.change('emailListId')}>
            {options2}
          </select>
        </FormField>,
      );

      details.push(
        <FormField key="notify"
          label="Notify email addresses"
          help={`Whom to notify when people submit filled out forms.
            Separate multiple addresses with commas.`}
          error={errors.notify}>
          <input name="notify"
            value={formTemplate.notify || ''}
            onChange={formState.change('notify')} />
        </FormField>,
      );

      if (session.userId.administrator) {
        const options = domains.map(domain => (
          <option key={domain._id} label={domain.name} value={domain._id} />
        ));
        options.unshift(<option key={0} />);
        details.push(
          <FormField key="admin" label="Administered by" error={errors.domainId}>
            <select name="domainId"
              value={formTemplate.domainId || ''}
              onChange={formState.change('domainId')}>
              {options}
            </select>
          </FormField>,
        );
      }
    } else {
      details = (
        <button className="form__more-control button button-plain"
          onClick={() => this.setState({ detailsActive: true })}>details</button>
      );
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Form name" error={errors.name}>
            <input name="name"
              value={formTemplate.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          {details}
        </fieldset>
        {sections}
        <fieldset className="form__fields">
          <FormFieldAdd>
            <Button label="Add section"
              secondary={true}
              onClick={this._addSection()} />
          </FormFieldAdd>
        </fieldset>
      </div>
    );
  }
}

FormTemplateFormContents.propTypes = {
  className: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  domains: PropTypes.array,
  emailLists: PropTypes.array,
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  linkedToFormTemplate: PropTypes.object,
  session: PropTypes.object.isRequired,
};

FormTemplateFormContents.defaultProps = {
  className: undefined,
  domains: [],
  emailLists: [],
  errors: undefined,
  linkedToFormTemplate: undefined,
};

const select = state => ({
  domains: (state.domains || {}).items || [],
  emailLists: (state['email-lists'] || {}).items || [],
  linkedToFormTemplate:
    linkedToFormTemplateId ? state[linkedToFormTemplateId] : undefined,
  session: state.session,
});

export default connect(select)(FormTemplateFormContents);
