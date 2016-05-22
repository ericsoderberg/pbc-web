"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import ImageField from '../../components/ImageField';
import FormState from '../../utils/FormState';
import SectionFields from './SectionFields';

class SubPageEdit extends Component {

  constructor (props) {
    super(props);
    this.state = {
      formState: new FormState(props.pageSummary, props.onChange)
    };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.pageSummary, nextProps.onChange)
    });
  }

  render () {
    const { index, summary } = this.props;
    const { formState } = this.state;
    const pageSummary = formState.object;

    const pages = this.props.pages.map(page => (
      <option key={page._id} label={page.name} value={page._id} />
    ));
    pages.unshift(<option key={0} />);

    let summaryFields;
    if (summary) {
      const textHelp = (
        <a href="http://daringfireball.net/projects/markdown/syntax"
          target="_blank">Markdown syntax</a>
      );

      summaryFields = [
        <ImageField key="tile" label="Tile image" name={`tile-${index}`}
          formState={formState} property="tile" />,
        <ImageField key="image" label="Image" name={`image-${index}`}
          formState={formState} property="image" />,
        <FormField key="text" label="Text" help={textHelp}>
          <textarea name={`text-${index}`} value={pageSummary.text || ''} rows={6}
            onChange={formState.change('text')}/>
        </FormField>
      ];
    }

    return (
      <div>
        <legend>{`Page ${index + 1}`}</legend>
        <FormField label="Page">
          <select name={`id-${index}`} value={pageSummary.id || ''}
            onChange={formState.change('id')}>
            {pages}
          </select>
        </FormField>
        {summaryFields}
      </div>
    );
  }

}

SubPageEdit.propTypes = {
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  pages: PropTypes.array.isRequired,
  pageSummary: PropTypes.object.isRequired,
  summary: PropTypes.bool
};

export default class PagesSectionEdit extends Component {

  constructor (props) {
    super(props);
    this._onAddPage = this._onAddPage.bind(this);
    this._onChangePage = this._onChangePage.bind(this);
    this._onRemovePage = this._onRemovePage.bind(this);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange), pages: [] };
  }

  componentDidMount () {
    getItems('pages')
    .then(pages => this.setState({ pages: pages }));
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange)
    });
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

  _onRemovePage (index) {
    const { formState } = this.state;
    let pages = formState.object.pages.slice(0);
    pages.splice(index, 1);
    formState.change('pages')(pages);
  }

  render () {
    const { formState } = this.state;
    const section = formState.object;

    const subPages = (section.pages || [{}]).map((pageSummary, index) => (
      <SubPageEdit key={index} pageSummary={pageSummary} index={index}
        pages={this.state.pages} summary={section.summary}
        onChange={(nextPageSummary) => this._onChangePage(nextPageSummary, index)} />
    ));

    return (
      <div>
        <fieldset className="form__fields">
          <FormField>
            <input name="summary" type="checkbox"
              checked={section.summary || false}
              onChange={formState.toggle('summary')}/>
            <label htmlFor="summary">Summaries</label>
          </FormField>
          <SectionFields formState={formState} />
          {subPages}
          <div><legend>{`Page ${subPages.length + 1}`}</legend></div>
          <FormField>
            <div className="form__tabs">
              <button type="button" onClick={this._onAddPage}>
                Add page
              </button>
            </div>
          </FormField>
        </fieldset>
      </div>
    );
  }
};

PagesSectionEdit.defaultProps = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired
};
