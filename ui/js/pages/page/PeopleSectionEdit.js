"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import FormState from '../../utils/FormState';
import SelectSearch from '../../components/SelectSearch';
import ImageField from '../../components/ImageField';
import Button from '../../components/Button';
import TextHelp from '../../components/TextHelp';
import DownIcon from '../../icons/Down';
import UpIcon from '../../icons/Up';
import TrashIcon from '../../icons/Trash';
import SectionFields from './SectionFields';

const Suggestion = (props) => (
  <div className="box--between">
    <span>{props.item.name}</span>
    <span className="secondary">{props.item.email}</span>
  </div>
);

class PersonEdit extends Component {

  constructor (props) {
    super(props);
    const { onChange, personSummary } = props;
    this.state = { formState: new FormState(personSummary, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    const { onChange, personSummary } = nextProps;
    this.setState({ formState: new FormState(personSummary, onChange) });
  }

  render () {
    const { index, onRemove, onRaise, onLower } = this.props;
    const { formState } = this.state;
    const personSummary = formState.object;

    const raise = (onRaise ? (
      <button type="button" className="button-icon" onClick={onRaise}>
        <UpIcon />
      </button>
    ) : undefined);
    const lower = (onLower ? (
      <button type="button" className="button-icon" onClick={onLower}>
        <DownIcon />
      </button>
    ) : undefined);

    return (
      <div>
        <div className="form-item">
          <h5>{`person ${index + 1}`}</h5>
          <div className="box--row">
            {raise}
            {lower}
            <button type="button" className="button-icon"
              onClick={onRemove}>
              <TrashIcon />
            </button>
          </div>
        </div>
        <FormField label="Person">
          <SelectSearch category="users"
            options={{select: 'name email image', sort: 'name'}}
            Suggestion={Suggestion}
            value={personSummary.id ? personSummary.id.name : ''}
            onChange={(suggestion) =>
              formState.change('id')({
                _id: suggestion._id,
                name: suggestion.name,
                image: suggestion.image
              })} />
          <FormField label="Text" help={<TextHelp />}>
            <textarea name={`text-${index}`} rows={4}
              value={personSummary.text || ''}
              onChange={formState.change('text')}/>
          </FormField>
          <ImageField label="Image" name={`image-${index}`}
            formState={formState} property="image" />
        </FormField>
      </div>
    );
  }

}

PersonEdit.propTypes = {
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onRaise: PropTypes.func,
  onLower: PropTypes.func,
  onRemove: PropTypes.func.isRequired,
  personSummary: PropTypes.object.isRequired
};

export default class PeopleSectionEdit extends Component {

  constructor (props) {
    super(props);
    this._onAddPerson = this._onAddPerson.bind(this);
    this._onChangePerson = this._onChangePerson.bind(this);
    // this._onRemovePerson = this._onRemovePerson.bind(this);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    const { section, onChange } = nextProps;
    this.setState({ formState: new FormState(section, onChange) });
  }

  _onAddPerson () {
    const { formState } = this.state;
    const section = formState.object;
    let people = (section.people || []).slice(0);
    people.push({});
    formState.set('people', people);
  }

  _onChangePerson (personSummary, index) {
    const { formState } = this.state;
    let people = (formState.object.people || []).slice(0);
    people[index] = personSummary;
    formState.change('people')(people);
  }

  // _onRemovePerson (index) {
  //   const { formState } = this.state;
  //   let people = formState.object.people.slice(0);
  //   people.splice(index, 1);
  //   formState.change('people')(people);
  // }

  render () {
    const { formState } = this.state;
    const section = formState.object;
    const people = section.people || [{}];

    const edits = people.map((personSummary, index) => {
      return (
        <PersonEdit key={index} personSummary={personSummary} index={index}
          onRaise={index > 0 ?
            formState.swapWith('people', index, index-1) : undefined}
          onLower={index < (people.length - 1) ?
            formState.swapWith('people', index, index+1) : undefined}
          onChange={(nextPersonSummary) => {
            this._onChangePerson(nextPersonSummary, index);
          }}
          onRemove={formState.removeAt('people', index)} />
      );
    });

    return (
      <div>
        <fieldset className="form__fields">
          <SectionFields formState={formState} />
          {edits}
          <div className="form-item">
            <h5>{`page ${edits.length + 1}`}</h5>
          </div>
          <FormFieldAdd>
            <Button label="Add person" secondary={true}
              onClick={this._onAddPerson} />
          </FormFieldAdd>
        </fieldset>
      </div>
    );
  }
};

PeopleSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
