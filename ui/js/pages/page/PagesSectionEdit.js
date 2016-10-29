"use strict";
import React, { Component, PropTypes } from 'react';
import FormField from '../../components/FormField';
import FormFieldAdd from '../../components/FormFieldAdd';
import ImageField from '../../components/ImageField';
import SelectSearch from '../../components/SelectSearch';
import Button from '../../components/Button';
import FormState from '../../utils/FormState';
import DownIcon from '../../icons/Down';
import UpIcon from '../../icons/Up';
import TrashIcon from '../../icons/Trash';
import SectionFields from './SectionFields';

class SubPageEdit extends Component {

  constructor (props) {
    super(props);
    const { onChange, pageSummary } = props;
    this.state = { formState: new FormState(pageSummary, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    const { onChange, pageSummary } = nextProps;
    this.setState({ formState: new FormState(pageSummary, onChange) });
  }

  render () {
    const { index, onRemove, onRaise, onLower } = this.props;
    const { formState } = this.state;
    const pageSummary = formState.object;

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
          <h5>{`page ${index + 1}`}</h5>
          <div className="box--row">
            {raise}
            {lower}
            <button type="button" className="button-icon"
              onClick={onRemove}>
              <TrashIcon />
            </button>
          </div>
        </div>
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

SubPageEdit.propTypes = {
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onRaise: PropTypes.func,
  onLower: PropTypes.func,
  onRemove: PropTypes.func.isRequired,
  pageSummary: PropTypes.object.isRequired
};

export default class PagesSectionEdit extends Component {

  constructor (props) {
    super(props);
    this._onAddPage = this._onAddPage.bind(this);
    this._onChangePage = this._onChangePage.bind(this);
    // this._onRemovePage = this._onRemovePage.bind(this);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentWillReceiveProps (nextProps) {
    const { section, onChange } = nextProps;
    this.setState({ formState: new FormState(section, onChange) });
  }

  _onAddPage () {
    const { formState } = this.state;
    const section = formState.object;
    let pages = (section.pages || []).slice(0);
    pages.push({});
    formState.set('pages', pages);
  }

  _onChangePage (pageSummary, index) {
    const { formState } = this.state;
    let pages = (formState.object.pages || []).slice(0);
    pages[index] = pageSummary;
    formState.change('pages')(pages);
  }

  // _onRemovePage (index) {
  //   const { formState } = this.state;
  //   let pages = formState.object.pages.slice(0);
  //   pages.splice(index, 1);
  //   formState.change('pages')(pages);
  // }

  render () {
    const { formState } = this.state;
    const section = formState.object;
    const pages = section.pages || [{}];

    const edits = pages.map((pageSummary, index) => {
      return (
        <SubPageEdit key={index} pageSummary={pageSummary} index={index}
          onRaise={index > 0 ?
            formState.swapWith('pages', index, index-1) : undefined}
          onLower={index < (pages.length - 1) ?
            formState.swapWith('pages', index, index+1) : undefined}
          onChange={(nextPageSummary) => {
            this._onChangePage(nextPageSummary, index);
          }}
          onRemove={formState.removeAt('pages', index)} />
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
            <Button label="Add page" secondary={true}
              onClick={this._onAddPage} />
          </FormFieldAdd>
        </fieldset>
      </div>
    );
  }
};

PagesSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
