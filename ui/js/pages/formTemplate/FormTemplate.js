
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { loadItem, getFormTemplateDownload, unloadItem } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Button from '../../components/Button';
import DateInput from '../../components/DateInput';
import Loading from '../../components/Loading';
import PageContext from '../page/PageContext';

const FIXED_FIELDS = [
  { name: 'created', label: 'Submitted' },
  { name: 'modified', label: 'Updated' },
];

class FormTemplate extends Component {

  constructor() {
    super();
    this._layout = this._layout.bind(this);
    // this._onScroll = this._onScroll.bind(this);
    this._onDownload = this._onDownload.bind(this);
    this.state = { sortReverse: false };
  }

  componentDidMount() {
    const { dispatch, id } = this.props;
    dispatch(loadItem('form-templates', id, { full: true }));
    // window.addEventListener('scroll', this._onScroll);
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, id } = nextProps;
    if (id !== this.props.id) {
      dispatch(loadItem('form-templates', id, { full: true }));
    } else if (nextProps.formTemplate) {
      document.title = nextProps.formTemplate.name;
      this._setupColumns(nextProps.formTemplate);
    }
  }

  componentDidUpdate() {
    setTimeout(() => {
      this._layout();
      // this._onScroll();
    }, 20);
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('form-templates', id));
    // window.removeEventListener('scroll', this._onScroll);
  }

  _layout() {
    const flexed = findDOMNode(this._flexedHeaderRef);
    if (flexed) {
      const rect = flexed.getBoundingClientRect();
      if (rect.height !== this.state.headerHeight) {
        this.setState({ headerHeight: rect.height });
      }
    }
  }

  _setupColumns(formTemplate) {
    const columns = [];
    const templateFieldMap = {};
    const linkedTemplateFieldIdMap = {};
    const optionMap = {};
    formTemplate.sections.forEach((section) => {
      section.fields.forEach((field) => {
        templateFieldMap[field._id] = field;
        field.options.forEach((option) => { optionMap[option._id] = option; });
        if (field.type !== 'instructions') {
          columns.push(field._id);
        }
        if (field.linkedFieldId) {
          linkedTemplateFieldIdMap[field._id] = field.linkedFieldId;
        }
      });
    });

    FIXED_FIELDS.forEach((field) => {
      templateFieldMap[field.name] = field;
      columns.push(field.name);
    });

    if (formTemplate.linkedFormTemplate) {
      formTemplate.linkedFormTemplate.sections.forEach((section) => {
        section.fields.forEach((field) => {
          templateFieldMap[field._id] = field;
          field.options.forEach((option) => { optionMap[option._id] = option; });
        });
      });
    }

    this.setState({
      columns,
      templateFieldMap,
      linkedTemplateFieldIdMap,
      optionMap,
      // totals: formTemplate.totals,
    });
  }

  _onDownload(event) {
    const { id } = this.props;
    event.preventDefault();
    getFormTemplateDownload(id);
  }

  _filterForms() {
    // TODO: move to back-end
    const { fromDate, toDate } = this.state;
    const filteredForms = this.state.forms.filter(form => (
      (!fromDate || moment(form.created).isAfter(fromDate)) &&
      (!toDate || moment(form.created).isBefore(toDate))
    ));
    this.setState({ filteredForms });
  }

  _editForm(id) {
    return () => {
      const { history } = this.props;
      history.push(`/forms/${id}/edit`);
    };
  }

  _fieldValue(field) {
    const { templateFieldMap, optionMap } = this.state;
    const templateField = templateFieldMap[field.templateFieldId];
    let value;
    if (templateField.type === 'count' || templateField.type === 'number') {
      value = templateField.value * field.value;
    } else if (templateField.type === 'choice' && field.optionId) {
      const option = optionMap[field.optionId];
      value = option.value;
    } else if (templateField.type === 'choices' && field.optionIds.length > 0) {
      value = field.optionIds.map((optionId) => {
        const option = optionMap[optionId];
        return option.value;
      });
      value = value.reduce((t, v) => (t + parseFloat(v, 10)), 0);
    } else {
      value = field.value;
    }
    return value;
  }

  _fieldContents(field, templateField) {
    const { optionMap } = this.state;
    let contents = field.value;
    if (templateField.type === 'count' || templateField.type === 'number') {
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
    } else if (templateField.type === 'choice' && field.optionId) {
      contents = optionMap[field.optionId].name;
    } else if (templateField.type === 'choices' && field.optionIds) {
      contents = field.optionIds.map((optionId) => {
        const option = optionMap[optionId];
        let suffix = '';
        if (templateField.monetary) {
          suffix = ` $ ${option.value}`;
        }
        return `${option.name}${suffix}`;
      })
      .join(', ');
    } else if (templateField.type === 'date') {
      contents = moment(contents).format('YYYY-MM-DD');
    } else if (templateField.monetary) {
      contents = <span><span className="secondary">$ </span>{contents}</span>;
    }
    return contents;
  }

  _fieldValueFor(form, templateFieldId) {
    let result = form[templateFieldId];
    if (!result) {
      form.fields.some((field) => {
        if (field.templateFieldId === templateFieldId) {
          result = this._fieldValue(field);
          if (typeof form === 'string') {
            result = result.toLowerCase();
          }
          return true;
        }
        return false;
      });
    }
    return result;
  }

  _sortForms(templateFieldId) {
    return () => {
      const { formTemplate: { forms } } = this.props;
      const { sortFieldId, sortReverse } = this.state;
      const nextSortReverse = (templateFieldId === sortFieldId ?
        !sortReverse : false);

      const nextForms = forms.sort((form1, form2) => {
        const value1 = this._fieldValueFor(form1, templateFieldId);
        const value2 = this._fieldValueFor(form2, templateFieldId);
        if (value1 && (!value2 || value1 < value2)) {
          return nextSortReverse ? 1 : -1;
        }
        if (value2 && (!value1 || value2 < value1)) {
          return nextSortReverse ? -1 : 1;
        }
        return 0;
      });

      this.setState({
        forms: nextForms,
        sortFieldId: templateFieldId,
        sortReverse: nextSortReverse,
      });
    };
  }

  _renderHeaderCells() {
    const {
      columns, mightHaveMore, templateFieldMap, sortFieldId, sortReverse,
    } = this.state;
    const cells = columns.map((fieldId) => {
      const field = templateFieldMap[fieldId];
      const classes = [];
      if (!mightHaveMore) {
        classes.push('sortable');
      }
      if (sortFieldId === fieldId) {
        classes.push('sort');
        if (sortReverse) {
          classes.push('sort--reverse');
        }
      }
      if (field.total >= 0) {
        classes.push('numeric');
      }
      let onClick;
      if (!mightHaveMore) {
        onClick = this._sortForms(fieldId);
      }
      return (
        <th key={fieldId} className={classes.join(' ')}
          onClick={onClick}>
          {field.name}
        </th>
      );
    });

    return cells;
  }

  _renderFooterCells() {
    const { columns, templateFieldMap, sortFieldId } = this.state;
    return columns.map((fieldId) => {
      const field = templateFieldMap[fieldId];
      const total = field.total;
      let classes = (total >= 0 ? 'total' : '');
      if (fieldId === sortFieldId) {
        classes += ' sort';
      }
      let contents = total >= 0 ? total : '';
      if (field.monetary) {
        contents = `$ ${contents}`;
      }
      return <td key={fieldId} className={classes}>{contents}</td>;
    });
  }

  _renderCells(form, linkedForm) {
    const {
      columns, templateFieldMap, linkedTemplateFieldIdMap, sortFieldId,
    } = this.state;

    const cellMap = {};
    form.fields.forEach((field) => {
      const templateFieldId = field.templateFieldId;
      const templateField = templateFieldMap[templateFieldId] || {};
      if (linkedForm && templateField.linkedFieldId) {
        linkedForm.fields.some((linkedField) => {
          if (linkedField.templateFieldId === templateField.linkedFieldId) {
            const linkedTemplateField = templateFieldMap[linkedField.templateFieldId] || {};
            cellMap[templateFieldId] = this._fieldContents(linkedField, linkedTemplateField);
            return true;
          }
          return false;
        });
      } else {
        cellMap[templateFieldId] = this._fieldContents(field, templateField);
      }
    });

    if (linkedForm) {
      // look for linked fields
      Object.keys(linkedTemplateFieldIdMap).forEach((templateFieldId) => {
        linkedForm.fields.some((linkedField) => {
          if (linkedField.templateFieldId ===
            linkedTemplateFieldIdMap[templateFieldId]) {
            const linkedTemplateField =
              templateFieldMap[linkedField.templateFieldId];
            cellMap[templateFieldId] =
              this._fieldContents(linkedField, linkedTemplateField);
            return true;
          }
          return false;
        });
      });
    }

    const created = moment(form.created);
    cellMap.created = created.format('MMM Do YYYY');
    const modified = moment(form.modified);
    if (!modified.isSame(created, 'day')) {
      cellMap.modified = modified.format('MMM Do YYYY');
    }

    const cells = columns.map((templateFieldId) => {
      const templateField = templateFieldMap[templateFieldId] || {};
      let classes = (templateFieldId === sortFieldId ? 'sort' : '');
      if (templateField.total >= 0) {
        classes += ' numeric';
      }
      const contents = cellMap[templateFieldId] || <span>&nbsp;</span>;
      return <td key={templateFieldId} className={classes}>{contents}</td>;
    });

    return cells;
  }

  _renderRows() {
    const { formTemplate } = this.props;
    const { filteredForms } = this.state;
    const forms = this.state.forms || formTemplate.forms;
    const linkedForms = {};
    ((formTemplate.linkedFormTemplate || {}).forms || []).forEach((form) => {
      linkedForms[form._id] = form;
    });
    const fixedRows = [];
    const flexedRows = [];
    (filteredForms || forms || []).forEach((form) => {
      const linkedForm = linkedForms[form.linkedFormId];
      const cells = this._renderCells(form, linkedForm);
      fixedRows.push(
        <tr key={form._id} onClick={this._editForm(form._id)}>
          {cells.slice(0, 1)}
        </tr>,
      );
      flexedRows.push(
        <tr key={form._id} onClick={this._editForm(form._id)}>
          {cells.slice(1)}
        </tr>,
      );
    });
    return [fixedRows, flexedRows];
  }

  _renderTable() {
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
            <thead ref={(ref) => { this._flexedHeaderRef = ref; }}>
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

  _renderFilter() {
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

  render() {
    const { formTemplate, id } = this.props;
    const { filterActive, loadingMore, mightHaveMore } = this.state;

    let filter;
    if (filterActive) {
      filter = this._renderFilter();
    }

    const actions = [];
    actions.push(
      <span key="filter" className="page-header__dropper">
        <Button label="Filter"
          onClick={() => this.setState({
            filterActive: !this.state.filterActive })} />
        {filter}
      </span>,
    );

    actions.push(
      <a key="download" href={`/api/form-templates/${id}.csv`}
        onClick={this._onDownload}>
        Download
      </a>,
    );

    actions.push(
      <Link key="add"
        to={`/forms/add?formTemplateId=${encodeURIComponent(id)}`}>
        Add
      </Link>,
    );

    let title;
    let contents;
    if (formTemplate) {
      title = formTemplate.name;
      contents = this._renderTable();
    } else {
      contents = <Loading />;
    }

    let more;
    if (loadingMore) {
      more = <Loading />;
    } else if (mightHaveMore) {
      more = <div ref={(ref) => { this._moreRef = ref; }} />;
    } else if (formTemplate && formTemplate.forms.length > 20) {
      more = <div className="list__count">{formTemplate.forms.length}</div>;
    }

    return (
      <main>
        <ItemHeader category="form-templates" item={formTemplate}
          title={title} actions={actions} />
        {contents}
        {more}
        <PageContext filter={{ 'sections.formTemplateId': id }} />
      </main>
    );
  }
}

FormTemplate.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.any.isRequired,
  id: PropTypes.string.isRequired,
  formTemplate: PropTypes.object,
};

FormTemplate.defaultProps = {
  formTemplate: undefined,
};

const select = (state, props) => {
  const id = props.match.params.id;
  return {
    id,
    notFound: state.notFound[id],
    formTemplate: state[id],
    session: state.session,
  };
};

export default connect(select)(FormTemplate);
