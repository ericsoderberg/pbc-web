import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';
import SelectSearch from '../../components/SelectSearch';
import ImageField from '../../components/ImageField';
import TextHelp from '../../components/TextHelp';

const Suggestion = props => (
  <div className="box--between">
    <span>{props.item.name}</span>
    <span className="secondary">{props.item.email}</span>
  </div>
);

Suggestion.propTypes = {
  item: PropTypes.object.isRequired,
};

export default class PeopleItemEdit extends Component {

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
    const { index } = this.props;
    const { formState } = this.state;
    const personSummary = formState.object;

    return (
      <div>
        <FormField label="Person">
          <SelectSearch category="users"
            options={{ select: 'name email image', sort: 'name' }}
            Suggestion={Suggestion}
            value={personSummary.id ? personSummary.id.name : ''}
            onChange={suggestion =>
              formState.change('id')({
                _id: suggestion._id,
                name: suggestion.name,
                image: suggestion.image,
              })} />
        </FormField>
        <FormField label="Text" help={<TextHelp />}>
          <textarea name={`text-${index}`}
            rows={4}
            value={personSummary.text || ''}
            onChange={formState.change('text')} />
        </FormField>
        <ImageField label="Image"
          name={`image-${index}`}
          formState={formState}
          property="image" />
      </div>
    );
  }

}

PeopleItemEdit.propTypes = {
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  item: PropTypes.object.isRequired,
};
