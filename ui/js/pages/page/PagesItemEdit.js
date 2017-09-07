
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';
// import ImageField from '../../components/ImageField';
import SelectSearch from '../../components/SelectSearch';
import TextHelp from '../../components/TextHelp';
import FormState from '../../utils/FormState';

export default class PageItemEdit extends Component {

  constructor(props) {
    super(props);
    const { onChange, item } = props;
    this.state = { formState: new FormState(item, onChange) };
  }

  componentWillReceiveProps(nextProps) {
    const { onChange, item } = nextProps;
    this.setState({ formState: new FormState(item, onChange) });
  }

  render() {
    // const { index } = this.props;
    const { formState } = this.state;
    const pageSummary = formState.object;

    return (
      <div>
        <FormField label="Page">
          <SelectSearch category="pages"
            value={pageSummary.id ? pageSummary.id.name : ''}
            onChange={suggestion =>
              formState.change('id')({
                _id: suggestion._id, name: suggestion.name })} />
        </FormField>
        <FormField name="summary" label="Summary" help={<TextHelp />}>
          <textarea name="summary"
            value={pageSummary.summary || ''}
            rows={4}
            onChange={formState.change('summary')} />
        </FormField>
        {/* }
        <ImageField key="image" label="Image" name={`image-${index}`}
          formState={formState} property="image" />
        { */}
      </div>
    );
  }

}

PageItemEdit.propTypes = {
  // index: PropTypes.number.isRequired,
  item: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
