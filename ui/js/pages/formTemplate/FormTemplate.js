"use strict";
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router';
import moment from 'moment';
import { getItem, getItems } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Button from '../../components/Button';
import DateInput from '../../components/DateInput';
import Loading from '../../components/Loading';
import PageContext from '../page/PageContext';

const FIXED_FIELDS = ['created', 'modified'];
const FiXED_LABELS = { created: 'Submitted', modified: 'Updated'};

export default class FormTemplate extends Component {

  constructor () {
    super();
    this._layout = this._layout.bind(this);
    this.state = { sortReverse: false };
  }

  componentDidMount () {
    this._loadFormTemplate();
  }

  componentDidUpdate () {
    setTimeout(this._layout, 20);
  }

  _layout () {
    const flexed = findDOMNode(this._flexedHeaderRef);
    if (flexed) {
      const rect = flexed.getBoundingClientRect();
      if (rect.height !== this.state.headerHeight) {
        this.setState({ headerHeight: rect.height });
      }
    }
  }

  _loadFormTemplate () {
    const { params: { id } } = this.props;
    getItem('form-templates', id)
    .then(formTemplate => {
      document.title = formTemplate.name;
      this._annotateFormTemplate(formTemplate);
      this.setState({ formTemplate: formTemplate }, this._loadForm);
    })
    .catch(error => console.log('!!! FormTemplate template catch', error));
  }

  _loadForm () {
    const { params: { id } } = this.props;
    const { formTemplate } = this.state;
    getItems('forms', {
      filter: { formTemplateId: id }, populate: true
    })
    .then(forms => {
      this._annotateForms(forms, formTemplate);
      this.setState({ forms: forms, formTemplate: formTemplate });
    })
    .catch(error => console.log('!!! FormTemplate forms catch', error));
  }

  _annotateFormTemplate (formTemplate) {
    let fieldMap = {};
    let optionMap = {};
    let columnFields = [];
    formTemplate.sections.forEach(section => {
      section.fields.forEach(field => {
        fieldMap[field._id] = field;
        field.options.forEach(option => optionMap[option._id] = option);
        if ('instructions' !== field.type) {
          field.index = columnFields.length;
          if ('count' === field.type || field.monetary) {
            field.total = 0;
          }
          columnFields.push(field);
        }
      });
    });
    formTemplate.fieldMap = fieldMap;
    formTemplate.optionMap = optionMap;
    formTemplate.columnFields = columnFields;
    formTemplate.fixedFields = FIXED_FIELDS.map((name, index) => ({
      name: name,
      index: columnFields.length + index
    }));
  }

  _annotateForms (forms, formTemplate) {
    forms.forEach(form => {
      let fieldMap = {};
      form.fields.forEach(field => {
        // hash fields for sorting
        fieldMap[field.templateFieldId] = field;
        // calculate totals
        const templateField = formTemplate.fieldMap[field.templateFieldId];
        if (templateField.total >= 0) {
          const value = parseFloat(this._fieldValue(field, formTemplate), 10);
          if (value) {
            templateField.total += value;
          }
        }
      });

      form.fieldMap = fieldMap;
    });
  }

  _fieldValue (field, formTemplate) {
    const templateField = formTemplate.fieldMap[field.templateFieldId];
    let value;
    if ('count' === templateField.type) {
      value = templateField.value * field.value;
    } else if ('choice' === templateField.type && field.optionId) {
      const option = formTemplate.optionMap[field.optionId];
      value = option.value;
    } else if ('choices' === templateField.type && field.optionIds.length > 0) {
      value = field.optionIds.map(optionId => {
        const option = formTemplate.optionMap[optionId];
        return option.value;
      });
      value = value.reduce((t, v) => (t + parseFloat(v, 10)), 0);
    } else {
      value = field.value;
    }
    return value;
  }

  _fieldContents (field, formTemplate) {
    const templateField = formTemplate.fieldMap[field.templateFieldId];
    let contents = field.value;
    if ('count' === templateField.type) {
      let prefix;
      if (templateField.monetary) {
        prefix = '$ ';
      }
      contents = (
        <span>
          <span className="secondary">{prefix}{templateField.value} x </span>
          {field.value}
        </span>
      );
    } else if ('choice' === templateField.type && field.optionId) {
      const option = formTemplate.optionMap[field.optionId];
      contents = option.name;
    } else if ('choices' === templateField.type && field.optionIds) {
      contents = field.optionIds.map(optionId => {
        const option = formTemplate.optionMap[optionId];
        return option.name;
      }).join(', ');
    } else if (templateField.monetary) {
      contents = <span><span className='secondary'>$ </span>{contents}</span>;
    }
    return contents;
  }

  _sortForms (templateFieldId) {
    return () => {
      const { forms, formTemplate, sortFieldId, sortReverse } = this.state;
      const nextSortReverse = (templateFieldId === sortFieldId ?
        ! sortReverse : false);
      const fixed = FIXED_FIELDS.indexOf(templateFieldId) !== -1;

      let nextForms = forms.sort((form1, form2) => {

        let value1;
        if (fixed) {
          value1 = form1[templateFieldId];
        } else {
          const field1 = form1.fieldMap[templateFieldId];
          if (field1) {
            value1 = this._fieldValue(field1, formTemplate);
            if (typeof value1 === 'string') {
              value1 = value1.toLowerCase();
            }
          }
        }

        let value2;
        if (fixed) {
          value2 = form2[templateFieldId];
        } else {
          const field2 = form2.fieldMap[templateFieldId];
          if (field2) {
            value2 = this._fieldValue(field2, formTemplate);
            if (typeof value2 === 'string') {
              value2 = value2.toLowerCase();
            }
          }
        }

        if (value1 && (!value2 || value1 < value2)) {
          return nextSortReverse ? 1 : -1;
        }
        if (value2  && (!value1 || value2 < value1)) {
          return nextSortReverse ? -1 : 1;
        }
        return 0;
      });

      this.setState({
        forms: nextForms,
        sortFieldId: templateFieldId,
        sortReverse: nextSortReverse
      });
    };
  }

  _totalForms () {
    const { filteredForms, forms, formTemplate } = this.state;
    // zero out totals
    formTemplate.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.total >= 0) {
          field.total = 0;
        }
      });
    });

    (filteredForms || forms).forEach(form => {
      form.fields.forEach(field => {
        // calculate totals
        const templateField = formTemplate.fieldMap[field.templateFieldId];
        if (templateField.total >= 0) {
          const value = parseFloat(this._fieldValue(field, formTemplate), 10);
          if (value) {
            templateField.total += value;
          }
        }
      });
    });
    this.setState({ formTemplate: formTemplate });
  }

  _filterForms () {
    const { fromDate, toDate } = this.state;
    const filteredForms = this.state.forms.filter(form => (
      (! fromDate || moment(form.created).isAfter(fromDate)) &&
      (! toDate || moment(form.created).isBefore(toDate))
    ));
    this.setState({ filteredForms: filteredForms }, this._totalForms);
  }

  _editForm (id) {
    return () => {
      this.context.router.push(`/forms/${id}/edit`);
    };
  }

  _renderHeaderCells () {
    const { formTemplate, sortFieldId, sortReverse } = this.state;
    let cells = formTemplate.columnFields.map(field => {
      let classes = [];
      if (sortFieldId === field._id) {
        classes.push('sort');
        if (sortReverse) {
          classes.push('sort--reverse');
        }
      }
      if (field.total >= 0) {
        classes.push('numeric');
      }
      return (
        <th key={field._id} className={classes.join(' ')}
          onClick={this._sortForms(field._id)}>
          {field.name}
        </th>
      );
    });

    cells = cells.concat(formTemplate.fixedFields.map(field => {
      let classes = (sortFieldId === field.name ?
        (sortReverse ? 'sort sort--reverse' : 'sort') : undefined);
      cells.push(
        <th key={field.name} className={classes}
          onClick={this._sortForms(field.name)}>
          {FiXED_LABELS[field.name]}
        </th>
      );
    }));

    return cells;
  }

  _renderFooterCells () {
    const { formTemplate, sortFieldId } = this.state;
    return formTemplate.columnFields.map(field => {
      let classes = (field.total >= 0 ? 'total' : '');
      if (field._id === sortFieldId) {
        classes += ' sort';
      }
      let contents = field.total >= 0 ? field.total : '';
      if (field.monetary) {
        contents = `$ ${contents}`;
      }
      return <td key={field.index} className={classes}>{contents}</td>;
    });
  }

  _renderCells (form) {
    const { formTemplate, sortFieldId } = this.state;
    const templateFieldMap = formTemplate.fieldMap;

    let cells = [];
    form.fields.forEach(field => {
      const templateField = templateFieldMap[field.templateFieldId];

      let classes = (field.templateFieldId === sortFieldId ? 'sort' : '');
      if (templateField.total >= 0) {
        classes += ' numeric';
      }

      let contents = this._fieldContents(field, formTemplate);
      cells[templateField.index] = (
        <td key={field._id} className={classes}>{contents}</td>
      );
    });

    cells = formTemplate.columnFields.map((templateField, index) => (
      cells[index] || <td key={index}>&nbsp;</td>));

    let classes = 'secondary';
    if (sortFieldId === 'created') {
      classes += ' sort';
    }
    const created = moment(form.created);
    cells.push(
      <td key="created" className={classes}>
        {created.format('MMM Do YYYY')}
      </td>
    );

    classes = 'secondary';
    if (sortFieldId === 'modified') {
      classes += ' sort';
    }
    const modified = moment(form.modified);
    let contents;
    if (! modified.isSame(created, 'day')) {
      contents = modified.format('MMM Do YYYY');
    }
    cells.push(
      <td key="modified" className={classes}>{contents}</td>
    );

    return cells;
  }

  _renderRows () {
    const { filteredForms, forms } = this.state;
    let fixedRows = [];
    let flexedRows = [];
    (filteredForms || forms).forEach(form => {
      let cells = this._renderCells(form);
      fixedRows.push(
        <tr key={form._id} onClick={this._editForm(form._id)}>
          {cells.slice(0, 1)}
        </tr>
      );
      flexedRows.push(
        <tr key={form._id} onClick={this._editForm(form._id)}>
          {cells.slice(1)}
        </tr>
      );
    });
    return [fixedRows, flexedRows];
  }

  _renderTable () {
    const { headerHeight } = this.state;
    const headerCells = this._renderHeaderCells();
    const footerCells = this._renderFooterCells();
    const [fixedRows, flexedRows] = this._renderRows();

    let repeatHeaderCells = [];
    if (fixedRows.length > 10) {
      repeatHeaderCells = headerCells;
    }

    return (
      <div className="form-table">
        <table className="form-table__fixed">
          <thead>
            <tr style={{ height: headerHeight }}>{headerCells.slice(0, 1)}</tr>
          </thead>
          <tbody>
            {fixedRows}
          </tbody>
          <tfoot>
            <tr>{footerCells.slice(0, 1)}</tr>
          </tfoot>
        </table>
        <div className="form-table__flexed">
          <table>
            <thead ref={ref => this._flexedHeaderRef = ref}>
              <tr>{headerCells.slice(1)}</tr>
            </thead>
            <tbody>
              {flexedRows}
            </tbody>
            <tfoot>
              <tr>{footerCells.slice(1)}</tr>
              <tr>{repeatHeaderCells.slice(1)}</tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  _renderFilter () {
    const { fromDate, toDate } = this.state;
    return (
      <div className="page-header__drop box--row">
        <div>
          <h4>From</h4>
          <DateInput inline={true} value={fromDate || ''}
            onChange={date => this.setState({ fromDate: date },
              this._filterForms)} />
        </div>
        <div>
          <h4>To</h4>
          <DateInput inline={true} value={toDate || ''}
            onChange={date => this.setState({ toDate: date },
              this._filterForms)} />
        </div>
      </div>
    );
  }

  render () {
    const { params: { id } } = this.props;
    const { filterActive, formTemplate, forms } = this.state;

    let filter;
    if (filterActive) {
      filter = this._renderFilter();
    }

    let actions = [];
    actions.push(
      <nav key="filter" className="page-header__actions">
        <span className="page-header__dropper">
          <Button label="Filter" className="button-header"
            onClick={() => this.setState({
              filterActive: ! this.state.filterActive})}/>
          {filter}
        </span>
      </nav>
    );

    actions.push(
      <nav key="download" className="page-header__actions">
        <Link to={`/form-templates/${id}/download`}
          className="a-header">
          Download
        </Link>
      </nav>
    );

    actions.push(
      <nav key="add" className="page-header__actions">
        <Link to={`forms/add?formTemplateId=${encodeURIComponent(id)}`}
          className="a-header">Add</Link>
      </nav>
    );

    let title;
    let contents;
    if (formTemplate) {
      title = formTemplate.name;
      if (forms) {
        contents = this._renderTable();
      }
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <ItemHeader category="form-templates" item={formTemplate}
          title={title} actions={actions} />
        {contents}
        <PageContext
          filter={id ? { 'sections.formTemplateId': id } : undefined} />
      </main>
    );
  }
};

FormTemplate.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  })
};

FormTemplate.contextTypes = {
  router: PropTypes.any
};
