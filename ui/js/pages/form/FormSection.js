
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import Markdown from 'markdown-to-jsx';
import { loadItem, unloadItem } from '../../actions';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import RightIcon from '../../icons/Right';
import FormAdd from './FormAdd';
import FormEdit from './FormEdit';
import PaymentPay from '../payment/PaymentPay';
import SessionSection from '../session/SessionSection';

const LABEL = {
  Register: 'Registered',
  'Sign Up': 'Signed up',
  Submit: 'Submitted',
  Subscribe: 'Subscribed',
};

const LABEL_MULTIPLE = {
  Submit: 'Submitted for',
};

const LOADING = 'loading';
const AUTHENTICATION_NEEDED = 'authenticationNeeded';
const SESSION = 'session';
const ADDING = 'adding';
const EDITING = 'editing';
const PAYING = 'paying';
const SUMMARY = 'summary';

const FormItem = (props) => {
  const {
    className, distinguish, intermediate, item: form, onClick, verb,
  } = props;
  const classNames = ['item__container', className];
  let message;
  let timestamp;
  if (intermediate) {
    message = `${form.name}`;
  } else {
    const date = moment(form.modified).format('MMM Do YYYY');
    timestamp = <span className="tertiary">{date}</span>;
    if (distinguish) {
      message = `${verb} ${form.name}`;
    } else {
      message = `${verb}`;
    }
  }

  return (
    <div className={classNames.join(' ')}>
      <div className="item item--full">
        <div>
          <button className="button button-plain" onClick={onClick}>
            {message} {timestamp} <RightIcon className="button__indicator" />
          </button>
        </div>
      </div>
    </div>
  );
};

FormItem.propTypes = {
  className: PropTypes.string,
  distinguish: PropTypes.bool,
  intermediate: PropTypes.bool,
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  verb: PropTypes.string,
};

FormItem.defaultProps = {
  className: undefined,
  distinguish: false,
  intermediate: false,
  verb: undefined,
};

class FormSection extends Component {

  constructor(props) {
    super(props);
    this._nextState = this._nextState.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._onDone = this._onDone.bind(this);
    this.state = { state: LOADING };
  }

  componentDidMount() {
    this._load(this.props);
    this._resetState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.formTemplateId !== this.props.formTemplateId ||
      (nextProps.session && !this.props.session) ||
      (!nextProps.session && this.props.session)) {
      this._load(nextProps);
    } else {
      this._resetState(nextProps);
    }
  }

  componentWillUnmount() {
    const { dispatch, formTemplateId } = this.props;
    dispatch(unloadItem('form-templates', formTemplateId));
  }

  _load(props) {
    const { dispatch, formTemplate, formTemplateId } = props;
    if (formTemplateId) {
      if (!formTemplate) {
        dispatch(loadItem('form-templates', formTemplateId,
          { full: true, forSession: true }));
      }
    }
  }

  _resetState(props) {
    const { session, formTemplate } = props;
    const { editForm, editId } = this.state;

    let nextState;
    let activeFormTemplate = formTemplate;
    if (!formTemplate) {
      nextState = LOADING;
    } else if (!session && formTemplate.authenticate) {
      nextState = AUTHENTICATION_NEEDED;
    } else if (formTemplate.linkedFormTemplate) {
      if (formTemplate.linkedFormTemplate.forms.length === 0) {
        activeFormTemplate = formTemplate.linkedFormTemplate;
        nextState = ADDING;
      } else {
        nextState = SUMMARY;
      }
    } else if (!formTemplate.forms || formTemplate.forms.length === 0) {
      nextState = ADDING;
    } else if (editId || editForm) {
      nextState = EDITING;
    } else if (formTemplate.totalCost < formTemplate.paidAmount
      && !formTemplate.anotherLabel) {
      nextState = PAYING;
    } else {
      nextState = SUMMARY;
    }

    this.setState({ activeFormTemplate, state: nextState });
  }

  _add(linkedForm) {
    return () => {
      let { formTemplate } = this.props;
      const linkedFormTemplate = linkedForm ? formTemplate.linkedFormTemplate : undefined;
      while (formTemplate.linkedFormTemplate && !linkedForm) {
        formTemplate = formTemplate.linkedFormTemplate;
      }
      this.setState({
        state: ADDING,
        activeFormTemplate: formTemplate,
        linkedForm,
        linkedFormTemplate,
      });
    };
  }

  _edit(form) {
    return () => {
      const { formTemplate } = this.props;
      let linkedForm;
      let linkedFormTemplate;
      if (form.linkedFormId) {
        linkedFormTemplate = formTemplate.linkedFormTemplate;
        linkedFormTemplate.forms.some((form2) => {
          if (form2._id === form.linkedFormId) {
            linkedForm = form2;
            return true;
          }
          return false;
        });
      }
      this.setState({
        editForm: form, linkedForm, linkedFormTemplate, state: EDITING,
      });
    };
  }

  _onCancel() {
    this.setState({
      adding: undefined,
      editForm: undefined,
      paymentFormId: undefined,
      // layoutNeeded: true,
    });
  }

  _nextState(state) {
    return () => {
      this.setState({ state, editForm: undefined, paymentFormId: undefined });
    };
  }

  _onDone() {
    const { dispatch, formTemplateId } = this.props;
    dispatch(loadItem('form-templates', formTemplateId,
      { full: true, forSession: true }));
  }

  render() {
    const { className, formTemplate, formTemplateId, session } = this.props;
    const {
      activeFormTemplate, editForm, linkedForm, linkedFormTemplate, state,
    } = this.state;

    // determine which set of forms to show
    let forms = [];
    if (formTemplate && formTemplate.linkedFormTemplate) {
      forms = formTemplate.linkedFormTemplate.forms.map((form2) => {
        let bestForm = form2;
        formTemplate.forms.some((form) => {
          if (form.linkedFormId === form2._id) {
            bestForm = form;
            return true;
          }
          return false;
        });
        return bestForm;
      });
    } else if (formTemplate) {
      forms = formTemplate.forms || [];
    }

    const classes = ['form-summary__container'];
    if (className) {
      classes.push(className);
    }

    let formTemplateLink;
    if (session && formTemplate &&
      (session.userId.administrator ||
        (session.userId.administratorDomainId &&
          session.userId.administratorDomainId === formTemplate.domainId))) {
      formTemplateLink = (
        <Link className="form-summary__template"
          to={`/form-templates/${formTemplateId}`}>
          {formTemplate.name}
        </Link>
      );
    }

    let totalCost = 0;
    let paidAmount = 0;
    forms.forEach((form) => {
      totalCost += form.totalCost;
      paidAmount += form.paidAmount;
    });
    const unpaidAmount = totalCost - paidAmount;

    let contents;
    switch (state) {

      case LOADING: {
        contents = <Loading />;
        break;
      }

      case AUTHENTICATION_NEEDED: {
        contents = (
          <div className="form-summary">
            <h2>{formTemplate.name}</h2>
            <p>You must sign in to fill out this form.</p>
            <Button label="Sign In"
              onClick={this._nextState(SESSION)} />
          </div>
        );
        break;
      }

      case SESSION: {
        contents = (
          <SessionSection onCancel={this._nextState(AUTHENTICATION_NEEDED)}
            returnPath={window.location.pathname} />
        );
        break;
      }

      case ADDING: {
        const onCancel = forms.length > 0 ? this._nextState(SUMMARY) : undefined;
        contents = (
          <FormAdd full={false}
            inline={true}
            formTemplate={activeFormTemplate}
            formTemplateId={activeFormTemplate._id}
            linkedForm={linkedForm}
            linkedFormTemplate={linkedFormTemplate}
            onDone={this._onDone}
            onCancel={onCancel}
            onLinkedForm={() => this.setState({
              activeFormTemplate: linkedFormTemplate,
              editForm: linkedForm,
              linkedForm: undefined,
              linkedFormTemplate: undefined,
              state: EDITING })}
            signInControl={<Button label="Sign In"
              secondary={true}
              onClick={this._nextState(SESSION)} />} />
        );
        break;
      }

      case EDITING: {
        contents = (
          <FormEdit id={editForm._id}
            full={false}
            inline={true}
            form={editForm}
            formTemplate={activeFormTemplate}
            linkedForm={linkedForm}
            linkedFormTemplate={linkedFormTemplate}
            onDone={this._onDone}
            onCancel={this._nextState(SUMMARY)}
            onLinkedForm={() => this.setState({
              activeFormTemplate: linkedFormTemplate,
              editForm: linkedForm,
              linkedForm: undefined,
              linkedFormTemplate: undefined })} />
        );
        break;
      }

      case PAYING: {
        contents = (
          <PaymentPay amount={unpaidAmount}
            formIds={formTemplate.forms.filter(f => f.totalCost > f.paidAmount)
              .map(f => f._id)}
            formTemplateId={formTemplate._id}
            formTemplateName={formTemplate.name}
            payByCheckInstructions={formTemplate.payByCheckInstructions}
            onDone={this._onDone}
            onCancel={this._nextState(SUMMARY)} />
        );
        break;
      }

      case SUMMARY: {
        let anyPending = false;
        const items = forms.map((form) => {
          let itemContents;
          if (form.formTemplateId === formTemplateId) {
            const label = (formTemplate.anotherLabel ?
              LABEL_MULTIPLE[formTemplate.submitLabel] : undefined) ||
              LABEL[formTemplate.submitLabel] ||
              LABEL.Submit;
            itemContents = (
              <FormItem item={form}
                onClick={this._edit(form)}
                verb={label}
                distinguish={forms.length > 1 ||
                  formTemplate.anotherLabel !== undefined} />
            );
          } else {
            anyPending = true;
            itemContents = (
              <FormItem item={form}
                onClick={this._add(form)}
                intermediate={true} />
            );
          }
          return <li key={form._id}>{itemContents}</li>;
        });

        let addControl;
        let another;
        if (formTemplate.anotherLabel) {
          another = (
            <Button className="button form-summary__another"
              plain={true}
              label={<span>
                {formTemplate.anotherLabel} <RightIcon className="button__indicator" />
              </span>}
              onClick={this._add()} />
          );
        }

        let paymentControl;
        if (unpaidAmount) {
          paymentControl = (
            <Button className="button form-summary__pay"
              secondary={true}
              label={`Pay current balance of $${unpaidAmount}`}
              onClick={this._nextState(PAYING)} />
          );
        } else if (formTemplate.paidAmount) {
          paymentControl = (
            <div className="form-summary__paid">
              {`Paid $${formTemplate.paidAmount}`}
            </div>
          );
        }

        let message;
        if (!unpaidAmount && !anyPending && formTemplate.postSubmitMessage) {
          message = formTemplate.postSubmitMessage;
        } else {
          message = `## ${formTemplate.name}`;
        }

        contents = (
          <div className="form-summary">
            {addControl}
            <div className="form-summary__message">
              <Markdown>{message}</Markdown>
            </div>
            <ul className="list">
              {items}
            </ul>
            {another}
            {paymentControl}
          </div>
        );
        break;
      }

      default:
        contents = <Loading />;
    }

    return (
      <div className={classes.join(' ')}>
        <div>
          {contents}
        </div>
        {formTemplateLink}
      </div>
    );
  }
}

FormSection.propTypes = {
  className: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  formTemplateId: PropTypes.string,
  formTemplate: PropTypes.object,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
      _id: PropTypes.string,
    }),
  }),
};

FormSection.defaultProps = {
  className: undefined,
  formTemplateId: undefined,
  formTemplate: undefined,
  session: undefined,
};

const select = (state, props) => {
  let formTemplateId;
  if (props.formTemplateId) {
    if (typeof props.formTemplateId === 'object') {
      formTemplateId = props.formTemplateId._id;
    } else {
      formTemplateId = props.formTemplateId;
    }
  }

  return {
    formTemplateId,
    formTemplate: state[formTemplateId] || props.formTemplate,
    session: state.session,
  };
};

export default connect(select)(FormSection);
