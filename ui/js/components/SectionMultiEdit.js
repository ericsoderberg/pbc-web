import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormFieldAdd from './FormFieldAdd';
import Button from './Button';
import SectionFields from './SectionFields';
import SectionItem from './SectionItem';

export default class SectionMultiEdit extends Component {

  constructor() {
    super();
    this._onAddItem = this._onAddItem.bind(this);
    this._onChangeItem = this._onChangeItem.bind(this);
    this.state = { nextId: 1 };
  }

  _onAddItem() {
    const { formState, property } = this.props;
    const { nextId } = this.state;
    const section = formState.object;
    const items = (section[property] ? section[property].slice(0) : []);
    items.push({ id: nextId });
    formState.set(property, items);
    this.setState({ nextId: nextId + 1 });
  }

  _onChangeItem(item, index) {
    const { formState, property } = this.props;
    const items = (formState.object[property] || []).slice(0);
    items[index] = item;
    formState.change(property)(items);
  }

  render() {
    const { formState, ItemEdit, label, property } = this.props;
    const section = formState.object;

    const items = (section[property] || []).map((item, index) => (
      <SectionItem key={item._id || item.id}
        formState={formState}
        index={index}
        property={property}
        label={label}>
        <ItemEdit item={item}
          index={index}
          onChange={nextItem => this._onChangeItem(nextItem, index)} />
      </SectionItem>
    ));

    return (
      <fieldset className="form__fields">
        <SectionFields formState={formState} />
        {items}
        <div className="form-item-add">
          <FormFieldAdd>
            <Button label={`Add ${label}`}
              secondary={true}
              onClick={this._onAddItem} />
          </FormFieldAdd>
        </div>
      </fieldset>
    );
  }
}

SectionMultiEdit.propTypes = {
  formState: PropTypes.object.isRequired,
  ItemEdit: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  property: PropTypes.string.isRequired,
};
