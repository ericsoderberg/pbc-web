
import React, { Component, PropTypes } from 'react';
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
