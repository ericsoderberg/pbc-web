"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import ImageField from '../../components/ImageField';
import SelectSearch from '../../components/SelectSearch';
import FormState from '../../utils/FormState';
import SectionMultiEdit from '../../components/SectionMultiEdit';

class PageItemEdit extends Component {

  constructor (props) {
    super(props);
    const { onChange, item } = props;
    this.state = { formState: new FormState(item, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    const { onChange, item } = nextProps;
    this.setState({ formState: new FormState(item, onChange) });
  }

  render () {
    const { index } = this.props;
    const { formState } = this.state;
    const pageSummary = formState.object;

    return (
      <div>
        <FormField label="Page">
          <SelectSearch category="pages"
            value={pageSummary.id ? pageSummary.id.name : ''}
            onChange={(suggestion) =>
              formState.change('id')({
                _id: suggestion._id, name: suggestion.name })} />
        </FormField>
        <ImageField key="image" label="Image" name={`image-${index}`}
          formState={formState} property="image" />
      </div>
    );
  }

}

PageItemEdit.propTypes = {
  index: PropTypes.number.isRequired,
  item: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default class PagesSectionEdit extends Component {

  constructor (props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    const { section, onChange } = nextProps;
    this.setState({ formState: new FormState(section, onChange) });
  }

  render () {
    const { formState } = this.state;
    return (
      <SectionMultiEdit formState={formState} property='pages' label='page'
        ItemEdit={PageItemEdit} />
    );
  }
};

PagesSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
