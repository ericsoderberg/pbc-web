"use strict";
import React, { Component, PropTypes } from 'react';
import FormFieldAdd from '../../components/FormFieldAdd';
import Button from '../../components/Button';
import AdultEdit from './AdultEdit';
import ChildEdit from './ChildEdit';

export default class FamilyFormContents extends Component {

  _addPerson (property) {
    return () => {
      const { formState } = this.props;
      const family = formState.object;
      let people = family[property].slice(0);
      people.push({});
      formState.set(property, people);
    };
  }

  render () {
    const { className, formState } = this.props;
    const family = formState.object;

    const adults = (family.adults || []).map((adult, index) => (
      <AdultEdit key={index} adult={adult}
        defaultActive={!adult.userId || ! adult.relation}
        onChange={formState.changeAt('adults', index)}
        onRemove={family.adults.length > 1 ?
          formState.removeAt('adults', index) : undefined} />
    ));

    const children = (family.children || []).map((child, index) => (
      <ChildEdit key={index} child={child} defaultActive={! child.name}
        onChange={formState.changeAt('children', index)}
        onRemove={formState.removeAt('children', index)} />
    ));

    return (
      <div className={className}>
        <div className="form__text">
          <h2>Adults</h2>
        </div>
        {adults}
        <div className="form-item-add">
          <FormFieldAdd>
            <Button label={`Add adult`} secondary={true}
              onClick={this._addPerson('adults')} />
          </FormFieldAdd>
        </div>

        <div className="form__text">
          <h2>Children</h2>
        </div>
        {children}
        <div className="form-item-add">
          <FormFieldAdd>
            <Button label={`Add child`} secondary={true}
              onClick={this._addPerson('children')} />
          </FormFieldAdd>
        </div>
      </div>
    );
  }
};

FamilyFormContents.propTypes = {
  formState: PropTypes.object.isRequired
};
