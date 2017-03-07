
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import DateInput from '../../components/DateInput';
import AddIcon from '../../icons/Add';
import AdultEdit from './AdultEdit';
import ChildEdit from './ChildEdit';

export default class FamilyFormContents extends Component {

  _addPerson(property) {
    return () => {
      const { formState } = this.props;
      const family = formState.object;
      const people = family[property].slice(0);
      people.push({});
      formState.set(property, people);
    };
  }

  render() {
    const { className, formState } = this.props;
    const family = formState.object;

    const adults = (family.adults || []).map((adult, index) => (
      <AdultEdit key={adult._id} adult={adult}
        defaultActive={true || !adult.userId || !adult.relation}
        onChange={formState.changeAt('adults', index)}
        onRemove={family.adults.length > 1 ?
          formState.removeAt('adults', index) : undefined} />
    ));

    const children = (family.children || []).map((child, index) => (
      <ChildEdit key={child._id} child={child}
        defaultActive={true || !child.name}
        onChange={formState.changeAt('children', index)}
        onRemove={formState.removeAt('children', index)} />
    ));

    return (
      <div className={className}>
        <div className="form__text">
          <h2>Adults</h2>
        </div>
        {adults}
        <div className="form-item">
          <button type="button" className="button-icon"
            onClick={this._addPerson('adults')}>
            <AddIcon />
          </button>
        </div>

        <div className="form__text">
          <h2>Children</h2>
        </div>
        {children}
        <div className="form-item">
          <button type="button" className="button-icon"
            onClick={this._addPerson('children')}>
            <AddIcon />
          </button>
        </div>

        <div className="form__text">
          <h2>Acknowledgements</h2>
        </div>
        <fieldset className="form__fields">
          <FormField label="Media">
            <input id="media" name="media" type="checkbox"
              checked={family.mediaConsent || false}
              onChange={formState.toggle('mediaConsent')} />
            <label htmlFor="media">
              I give my permission to publish photos of my children.
            </label>
          </FormField>
          <FormField label="Dismissal">
            <input id="dismissal" name="dismissal" type="checkbox"
              checked={family.dismissalConsent || false}
              onChange={formState.toggle('dismissalConsent')} />
            <label htmlFor="dismissal">
              I give my permission to release my children from classes
              without me being present.
            </label>
          </FormField>
          <FormField label="Liability">
            <input id="liability" name="liability" type="checkbox"
              checked={family.liabilityRelease || false}
              onChange={formState.toggle('liabilityRelease')} />
            <label htmlFor="dismissal">
              I release liability for my children.
            </label>
          </FormField>
          <FormField label="Signature"
            help="Typing your name here is treated as your signature">
            <input name="signature" value={family.signature || ''}
              onChange={formState.change('signature')} />
          </FormField>
          <FormField label="Date">
            <DateInput value={family.signed || ''}
              onChange={formState.change('signed')} />
          </FormField>
        </fieldset>
      </div>
    );
  }
}

FamilyFormContents.propTypes = {
  className: PropTypes.string,
  formState: PropTypes.object.isRequired,
};

FamilyFormContents.defaultProps = {
  className: undefined,
};
