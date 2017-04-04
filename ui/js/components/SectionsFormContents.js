import React, { Component, PropTypes } from 'react';
import FormFieldAdd from './FormFieldAdd';
import Button from './Button';
import SectionFormContents from './SectionFormContents';

export default class SectionsFormContents extends Component {

  constructor() {
    super();
    this.state = { newSectionId: 1 };
  }

  _addSection(type) {
    return this.props.formState.addTo('sections', () => {
      const id = this.state.newSectionId;
      this.setState({ newSectionId: this.state.newSectionId + 1 });
      return { type, id, full: (type === 'image') };
    });
  }

  render() {
    const { formState, types } = this.props;
    const item = formState.object;

    const sections = (item.sections || []).map((section, index) => (
      <SectionFormContents key={section._id || section.id} formState={formState}
        index={index} />
    ));

    const addControls = types.map(type => (
      <Button key={type} label={`Add ${type}`} secondary={true}
        onClick={this._addSection(type)} />
    ));

    return (
      <div>
        {sections}
        <FormFieldAdd>
          {addControls}
        </FormFieldAdd>
      </div>
    );
  }
}

SectionsFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
};
