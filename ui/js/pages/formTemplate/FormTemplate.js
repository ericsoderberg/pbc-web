
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import {
  loadItem, loadCategory, getFormTemplateDownload, unloadItem, unloadCategory,
} from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Filter from '../../components/Filter';
import DateInput from '../../components/DateInput';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import PageContext from '../page/PageContext';
import { searchToObject } from '../../utils/Params';

const FIXED_FIELDS = [
  { name: 'created', label: 'Submitted' },
  { name: 'modified', label: 'Updated' },
];

class FormTemplate extends Component {

  constructor() {
    super();
    this._load = this._load.bind(this);
    this._layout = this._layout.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this._onFrom = this._onFrom.bind(this);
    this._onTo = this._onTo.bind(this);
    this._onPayment = this._onPayment.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onDownload = this._onDownload.bind(this);
    this.state = {
      columns: [], fromDate: '', toDate: '', payment: '', searchText: '', sort: '-created',
    };
  }

  componentDidMount() {
    const { dispatch, id } = this.props;
    dispatch(loadItem('form-templates', id, { totals: true }));
    this.setState(this._stateFromProps(this.props), this._load);
    window.addEventListener('scroll', this._onScroll);
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, id } = nextProps;
    if (id !== this.props.id) {
      dispatch(loadItem('form-templates', id, { full: true }));
      this.setState({
        searchText: '', filter: {}, sort: undefined, forms: undefined,
      });
    } else if (nextProps.formTemplate) {
      document.title = nextProps.formTemplate.name;
      this._setupColumns(nextProps.formTemplate);
      if (nextProps.location.search !== this.props.location.search) {
        this.setState(this._stateFromProps(nextProps), this._load);
      } else {
        this.setState({ loading: false, loadingMore: false });
      }
    }
  }

  componentDidUpdate() {
    setTimeout(() => {
      this._layout();
      this._onScroll();
    }, 20);
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadCategory('forms'));
    dispatch(unloadItem('form-templates', id));
    window.removeEventListener('scroll', this._onScroll);
  }

  _stateFromProps(props) {
    const { location } = props;
    const query = searchToObject(location.search);
    return {
      fromDate: query.fromDate || '',
      toDate: query.toDate || '',
      payment: query.payment || '',
      searchText: query.search || '',
      sort: query.sort,
    };
  }

  _actionOptions() {
    const { id } = this.props;
    const {
      fromDate, toDate, payment, searchText, sort,
    } = this.state;
    const filter = { formTemplateId: id };
    if (fromDate && toDate) {
      filter.created = [fromDate, toDate];
    }
    if (payment) {
      if (payment === 'not received') {
        filter['cost.unreceived'] = { $gt: 0 };
      } else if (payment === 'not paid') {
        filter['cost.balance'] = { $gt: 0 };
      } else {
        filter['cost.unreceived'] = { $lte: 0 };
        filter['cost.balance'] = { $lte: 0 };
      }
    }
    return {
      filter, search: searchText, sort: sort || '-created', totals: true,
    };
  }

  _load() {
    const { dispatch } = this.props;
    const options = this._actionOptions();
    this.setState({ loading: true }, () =>
      dispatch(loadCategory('forms', options)));
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
      section.fields.filter(f => f.type !== 'instructions').forEach((field) => {
        templateFieldMap[field._id] = field;
        field.options.forEach((option) => { optionMap[option._id] = option; });
        columns.push(field._id);
        if (field.linkedFieldId) {
          linkedTemplateFieldIdMap[field._id] = field.linkedFieldId;
        }
      });
    });

    FIXED_FIELDS.forEach((field) => {
      templateFieldMap[field.name] = field;
      columns.push(field.name);
    });
    if (formTemplate.payable) {
      templateFieldMap.balance = {
        name: 'balance',
        label: 'Balance',
        monetary: true,
        total: (formTemplate.cost.unreceived),
      };
      columns.push('balance');
    }

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

  _setLocation(options) {
    const { history } = this.props;
    const state = { ...this.state, ...options };
    const searchParams = [];

    if (state.searchText) {
      searchParams.push(`search=${encodeURIComponent(state.searchText)}`);
    }

    if (state.fromDate) {
      searchParams.push(`fromDate=${state.fromDate}`);
    }
    if (state.toDate) {
      searchParams.push(`toDate=${state.toDate}`);
    }
    if (state.payment) {
      searchParams.push(`payment=${state.payment}`);
    }
    if (state.sort) {
      searchParams.push(`sort=${state.sort}`);
    }

    history.replace({
      pathname: window.location.pathname,
      search: `?${searchParams.join('&')}`,
    });
  }

  _onMore() {
    const { dispatch, forms } = this.props;
    this.setState({ loadingMore: true }, () => {
      const options = this._actionOptions();
      dispatch(loadCategory('forms', { ...options, skip: forms.length }));
    });
  }

  _onScroll() {
    const { mightHaveMore } = this.props;
    const { loadingMore } = this.state;
    if (mightHaveMore && !loadingMore) {
      const more = this._moreRef;
      if (more) {
        const rect = more.getBoundingClientRect();
        // start loading just before they get there
        if (rect.top <= (window.innerHeight + 200)) {
          this._onMore();
        }
      }
    }
  }

  _onSearch(event) {
    const searchText = event.target.value;
    this.setState({ searchText });
    // throttle when user is typing
    clearTimeout(this._getTimer);
    this._getTimer = setTimeout(() => this._setLocation({ searchText }), 100);
  }

  _onFrom(fromDate) {
    this.setState({ fromDate });
    this._setLocation({ fromDate: fromDate ? fromDate.toISOString() : undefined });
  }

  _onTo(toDate) {
    this.setState({ toDate });
    this._setLocation({ toDate: toDate ? toDate.toISOString() : undefined });
  }

  _onPayment(event) {
    let value = event.target.value;
    if (!value || value.match(/^all$/i)) {
      value = undefined;
    }
    this._setLocation({ payment: value });
  }

  _onSort(fieldId) {
    return () => {
      let sort;
      if (this.state.sort && this.state.sort === fieldId) {
        sort = `-${fieldId}`;
      } else {
        sort = fieldId;
      }
      this.setState({ sort });
      this._setLocation({ sort });
    };
  }

  _onDownload(event) {
    const { id } = this.props;
    event.preventDefault();
    const options = this._actionOptions();
    getFormTemplateDownload(id, options);
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
      value = (templateField.value || 1) * field.value;
    } else if (templateField.type === 'choice' && field.optionId) {
      const option = optionMap[field.optionId] || {};
      value = option.value;
    } else if (templateField.type === 'choices' && field.optionIds.length > 0) {
      value = field.optionIds.map((optionId) => {
        const option = optionMap[optionId] || {};
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
      if (templateField.value) {
        prefix = (
          <span className="secondary">
            {`${templateField.monetary ? '$ ' : ''}${templateField.value} x `}
          </span>
        );
      }
      contents = <span>{prefix}{field.value}</span>;
    } else if (templateField.type === 'choice' && field.optionId) {
      const option = optionMap[field.optionId] || {};
      if (templateField.monetary) {
        if (option.value === null || option.value === option.name) {
          contents = `$ ${option.name}`;
        } else {
          contents = `${option.name || ''} $ ${option.value}`;
        }
      } else {
        contents = option.name;
      }
    } else if (templateField.type === 'choices' && field.optionIds) {
      contents = field.optionIds.map((optionId) => {
        const option = optionMap[optionId] || {};
        if (templateField.monetary) {
          if (option.value === null || option.value === option.name) {
            return `$ ${option.name}`;
          }
          return `${option.name || ''} $ ${option.value}`;
        }
        return option.name;
      })
        .join(', ');
    } else if (templateField.type === 'date') {
      const date = moment(contents);
      contents = `${date.format('YYYY-MM-DD')} (${date.fromNow(true)})`;
    } else if (templateField.monetary && contents) {
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

  _renderHeaderCells() {
    const {
      columns, templateFieldMap, sortFieldId, sortReverse,
    } = this.state;
    const cells = columns.map((fieldId) => {
      const field = templateFieldMap[fieldId];
      const classes = [];
      let onClick;
      if (fieldId === 'created' || fieldId === 'modified' ||
        field.linkToUserProperty === 'name') {
        classes.push('sortable');
        const sortBy = field.linkToUserProperty === 'name' ? 'name' : fieldId;
        onClick = this._onSort(sortBy);
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
      return (
        <th key={fieldId}
          className={classes.join(' ')}
          onClick={onClick}>
          {field.label || field.name}
        </th>
      );
    });

    return cells;
  }

  _renderFooterCells() {
    const {
      columns, templateFieldMap, fromDate, toDate, payment, searchText,
    } = this.state;
    return columns.map((fieldId) => {
      let contents = '';
      let classes = '';
      if ((!fromDate && !toDate && !payment && !searchText) || fieldId === 'balance') {
        const field = templateFieldMap[fieldId];
        const { total } = field;
        if (total > 0) {
          classes = 'total';
          contents = total;
        }
        if (field.monetary && contents) {
          contents = `$ ${contents}`;
        }
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
      const { templateFieldId } = field;
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
    let unpaid;
    if (form.cost && form.cost.balance) {
      cellMap.balance = `$ ${form.cost.balance}`;
      unpaid = true;
    } else if (form.cost && form.cost.unreceived) {
      cellMap.balance = `$ ${form.cost.unreceived}`;
    }

    const cells = columns.map((templateFieldId) => {
      const templateField = templateFieldMap[templateFieldId] || {};
      let classes = (templateFieldId === sortFieldId ? 'sort' : '');
      if (templateField.total >= 0) {
        classes += ' numeric';
      }
      if (templateFieldId === 'balance' && unpaid) {
        classes += ' error';
      }
      const contents = cellMap[templateFieldId] || <span>&nbsp;</span>;
      return <td key={templateFieldId} className={classes}>{contents}</td>;
    });

    return cells;
  }

  _renderRows() {
    const { forms, formTemplate } = this.props;
    const linkedForms = {};
    ((formTemplate.linkedFormTemplate || {}).forms || []).forEach((form) => {
      linkedForms[form._id] = form;
    });
    const fixedRows = [];
    const flexedRows = [];
    (forms || []).forEach((form) => {
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

  render() {
    const {
      forms, formTemplate, id, mightHaveMore, notFound,
    } = this.props;
    const {
      fromDate, toDate, loadingMore, payment, searchText,
    } = this.state;

    const actions = [];

    actions.push(
      <a key="download"
        href={`/api/form-templates/${id}.csv`}
        onClick={this._onDownload}>
        Download
      </a>,
    );

    actions.push(
      <Link key="email"
        to={`/form-templates/${id}/email`}>
        Email
      </Link>,
    );

    actions.push(
      <Link key="add"
        to={`/forms/add?formTemplateId=${encodeURIComponent(id)}`}>
        Add
      </Link>,
    );

    const filterItems = [];
    if (formTemplate) {
      filterItems.push(
        <span key="from" className="header-field">
          <label htmlFor="from">From</label>
          <DateInput id="from" value={fromDate} onChange={this._onFrom} />
        </span>,
      );
      filterItems.push(
        <span key="to" className="header-field">
          <label htmlFor="to">To</label>
          <DateInput id="to" value={toDate} onChange={this._onTo} />
        </span>,
      );
      if (formTemplate.payable) {
        filterItems.push(
          <Filter key="paid"
            options={['not paid', 'not received', 'received']}
            allLabel="All"
            value={payment}
            onChange={this._onPayment} />,
        );
      }
    }

    let title;
    let contents;
    if (formTemplate) {
      title = formTemplate.name;
      contents = this._renderTable();
    } else if (notFound) {
      contents = <NotFound />;
    } else {
      contents = <Loading />;
    }

    let more;
    if (loadingMore) {
      more = <Loading />;
    } else if (mightHaveMore) {
      more = <div ref={(ref) => { this._moreRef = ref; }} />;
    } else if (forms && forms.length > 5) {
      more = <div className="list__count">{forms.length}</div>;
    }

    let linkedForm;
    if (formTemplate && formTemplate.linkedFormTemplateId) {
      linkedForm = (
        <Link className="associated-link"
          to={`/form-templates/${formTemplate.linkedFormTemplateId._id}`}>
          {formTemplate.linkedFormTemplateId.name}
        </Link>
      );
    }

    let payments;
    if (formTemplate && formTemplate.payable) {
      payments = (
        <Link className="associated-link"
          to={`/payments?formTemplateId=${formTemplate._id}&` +
          `formTemplateId-name=${formTemplate.name}`}>
          Payments
        </Link>
      );
    }

    let associated;
    if (linkedForm || payments) {
      associated = (
        <div className="associated">
          {linkedForm}
          {payments}
        </div>
      );
    }

    return (
      <main>
        <ItemHeader category="form-templates"
          item={formTemplate}
          title={title}
          actions={actions}
          searchText={searchText}
          onSearch={this._onSearch}
          filters={filterItems} />
        {contents}
        {more}
        {associated}
        <PageContext filter={{ 'sections.formTemplateId': id }} />
      </main>
    );
  }
}

FormTemplate.propTypes = {
  dispatch: PropTypes.func.isRequired,
  forms: PropTypes.array,
  formTemplate: PropTypes.object,
  history: PropTypes.any.isRequired,
  id: PropTypes.string.isRequired,
  location: PropTypes.object.isRequired,
  mightHaveMore: PropTypes.bool,
  notFound: PropTypes.bool,
};

FormTemplate.defaultProps = {
  forms: undefined,
  formTemplate: undefined,
  mightHaveMore: false,
  notFound: false,
};

const select = (state, props) => {
  const id = props.match.params.id;
  const formsState = state.forms || {};
  const formTemplate = state[id];
  if (formsState.items && formTemplate && formTemplate.payable) {
    const cost = { total: 0, paid: 0, received: 0 };
    formsState.items.forEach((form) => {
      if (form.cost) {
        cost.total += form.cost.total;
        cost.paid += form.cost.paid;
        cost.received += form.cost.received;
      }
    });
    cost.balance = cost.total - cost.paid;
    cost.unreceived = cost.total - cost.received;
    formTemplate.cost = cost;
  }
  return {
    id,
    forms: formsState.items,
    formTemplate,
    mightHaveMore: formsState.mightHaveMore,
    notFound: state.notFound[id],
    session: state.session,
  };
};

export default connect(select)(FormTemplate);
