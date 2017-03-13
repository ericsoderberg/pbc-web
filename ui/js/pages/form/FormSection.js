
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import Markdown from 'markdown-to-jsx';
import { getItems, getItem } from '../../actions';
import Loading from '../../components/Loading';
import Stored from '../../components/Stored';
import Button from '../../components/Button';
import AddIcon from '../../icons/Add';
import FormAdd from './FormAdd';
import FormEdit from './FormEdit';
import PaymentPay from '../payment/PaymentPay';
import SessionSection from '../session/SessionSection';
// import { calculateTotal } from './FormUtils';

const LABEL = {
  Register: 'Registered',
  'Sign Up': 'Signed up',
  Submit: 'Submitted',  Subscribe: 'Subscribed',
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
  const buttonClassNames = ['button'];
  let message;
  if (intermediate) {
    buttonClassNames.push('button--secondary');
    message = `${form.name}`;
  } else {
    buttonClassNames.push('button-plain ');
    const timestamp = moment(form.modified).format('MMM Do YYYY');
    if (distinguish) {
      message = `${verb} for ${form.name} ${timestamp}`;
    } else {
      message = `${verb} ${timestamp}`;
    }
  }

  return (
    <div className={classNames.join(' ')}>
      <div className="item item--full">
        <div>
          <button className={buttonClassNames.join(' ')} onClick={onClick}>
            {message}
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

const _bestForm = (form, forms) => {
  let result = form;
  Object.keys(forms).some(key =>
    forms[key].some((form2) => {
      if (form2.linkedFormId === form._id) {
        result = _bestForm(form2, forms);
        return true;
      }
      return false;
    }),
  );
  return result;
};

class FormSection extends Component {

  constructor(props) {
    super(props);
    this._nextState = this._nextState.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._onDone = this._onDone.bind(this);
    // this._onResize = this._onResize.bind(this);
    // this._layout = this._layout.bind(this);

    // formTemplates and forms are a hash to handle inter-form linkages,
    // both are keyed by a form template id
    this.state = { formTemplates: {}, forms: {}, state: LOADING };
  }

  componentDidMount() {
    this._load(this.props);
    // window.addEventListener('resize', this._onResize);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.formTemplateId !== this.props.formTemplateId ||
      (nextProps.session && !this.props.session) ||
      (!nextProps.session && this.props.session)) {
      this._load(nextProps);
    }
  }

  // componentDidUpdate() {
  //   if (this.state.layoutNeeded) {
  //     this.setState({ layoutNeeded: undefined });
  //     this._onResize();
  //   }
  // }

  // componentWillUnmount() {
  //   window.removeEventListener('resize', this._onResize);
  //   clearTimeout(this._layoutTimer);
  // }

  // _onResize() {
  //   clearTimeout(this._layoutTimer);
  //   this._layoutTimer = setTimeout(this._layout, 300);
  // }

  _load(props) {
    const { formTemplate, formTemplateId } = props;
    if (formTemplateId || formTemplate) {
      const finalFormTemplateId = formTemplateId._id || formTemplate._id;
      this.setState({
        activeFormTemplateId: finalFormTemplateId,
        finalFormTemplateId,
        rootFormTemplateId: finalFormTemplateId,
      });
      // We might already have the form template if we're on a page that
      // populated it.
      if (formTemplateId && !formTemplate) {
        this._loadFormTemplate(finalFormTemplateId);
      } else if (formTemplate) {
        this._formTemplateReady(formTemplate);
      }
    }
  }

  _formTemplateReady(formTemplate) {
    const { session } = this.props;
    const formTemplates = { ...this.state.formTemplates };
    formTemplates[formTemplate._id] = formTemplate;
    this.setState({ formTemplates });
    if (!session && formTemplate.authenticate) {
      this.setState({ state: AUTHENTICATION_NEEDED });
    } else {
      if (formTemplate.linkedFormTemplateId) {
        this.setState({ rootFormTemplateId: formTemplate.linkedFormTemplateId._id });
        this._loadFormTemplate(formTemplate.linkedFormTemplateId._id);
      }
      this._loadForms(formTemplate._id);
    }
  }

  _loadFormTemplate(id) {
    getItem('form-templates', id)
    .then(formTemplate => this._formTemplateReady(formTemplate))
    .catch(error => console.error('!!! FormSummary formTemplate catch', error));
  }

  _loadForms(formTemplateId) {
    const { session } = this.props;
    if (session) {
      getItems('forms', {
        filter: { formTemplateId, userId: session.userId._id },
        populate: true,
      })
      .then((forms) => {
        let paymentFormId;
        // if (formTemplate.payable) {
        //   // see if any require payment
        //   forms.forEach((form) => {
        //     const formTotal = calculateTotal(formTemplate, form);
        //     let paymentTotal = 0;
        //     (form.paymentIds || []).forEach((payment) => {
        //       paymentTotal += payment.amount;
        //     });
        //     if (formTotal > paymentTotal) {
        //       form.needsPayment = true;
        //       if (!paymentFormId) {
        //         paymentFormId = form._id;
        //       }
        //     }
        //   });
        // }
        const nextForms = { ...this.state.forms };
        nextForms[formTemplateId] = forms;
        this.setState({ forms: nextForms, paymentFormId },
          () => this._resetState(this.props));
      })
      .catch(error => console.error('!!! FormSummary forms catch', error));
    }
  }

  // _layout() {
  //   const contents = this.refs.contents;
  //   const height = contents.offsetHeight;
  //   if (this.state.height !== height) {
  //     this.setState({ height });
  //     // unset height after a while, this allows forms to be dynamic
  //     clearTimeout(this._layoutTimer);
  //     this._layoutTimer = setTimeout(
  //       () => this.setState({ height: undefined }), 600);
  //   }
  // }

  _add(linkedForm) {
    return () => {
      const { finalFormTemplateId, formTemplates } = this.state;
      let formTemplate = formTemplates[finalFormTemplateId];
      while (formTemplate.linkedFormTemplateId &&
        (!linkedForm ||
          linkedForm.formTemplateId._id !== formTemplate.linkedFormTemplateId._id)) {
        formTemplate = formTemplates[formTemplate.linkedFormTemplateId._id];
      }
      this.setState({
        state: ADDING, activeFormTemplateId: formTemplate._id, linkedForm,
      });
    };
  }

  _edit(id) {
    return () => {
      this.setState({ editId: id, state: EDITING });
    };
  }

  _onCancel() {
    this.setState({
      adding: undefined,
      editId: undefined,
      paymentFormId: undefined,
      // layoutNeeded: true,
    });
  }

  _resetState(props) {
    const { session } = props;
    const {
      finalFormTemplateId, formTemplates, forms, editId, paymentFormId,
    } = this.state;

    const finalFormTemplate = formTemplates[finalFormTemplateId];
    const finalForms = forms[finalFormTemplateId];

    let state;
    let activeFormTemplateId = finalFormTemplateId;
    let linkedForm;
    if (!finalFormTemplate || !finalForms) {
      state = LOADING;
    } else if (!session && finalFormTemplate.authenticate) {
      state = AUTHENTICATION_NEEDED;
    } else if (finalFormTemplate.linkedFormTemplateId) {
      const linkedFormTemplateId = finalFormTemplate.linkedFormTemplateId._id;
      const linkedToFormTemplate = formTemplates[linkedFormTemplateId];
      const linkedToForms = forms[linkedFormTemplateId];
      if (!linkedToFormTemplate || !linkedToForms) {
        state = LOADING;
      } else if (linkedToForms.length === 0) {
        activeFormTemplateId = linkedFormTemplateId;
        state = ADDING;
      } else if (finalForms.length === 0 && linkedToForms.length === 1) {
        linkedForm = linkedToForms[0];
        state = ADDING;
      } else {
        state = SUMMARY;
      }
    } else if (finalForms.length === 0) {
      state = ADDING;
    } else if (editId) {
      state = EDITING;
    } else if (paymentFormId) {
      state = PAYING;
    } else {
      state = SUMMARY;
    }

    this.setState({ activeFormTemplateId, linkedForm, state });
  }

  _nextState(state) {
    return () => {
      this.setState({ state, editId: undefined, paymentFormId: undefined });
    };
  }

  _onDone() {
    this._resetState(this.props);
    this._loadForms(this.state.activeFormTemplateId);
  }

  render() {
    const { className, session } = this.props;
    const {
      activeFormTemplateId, finalFormTemplateId, formTemplates, forms, editId, height,
      linkedForm, paymentFormId, rootFormTemplateId, state,
    } = this.state;
    const finalFormTemplate = formTemplates[finalFormTemplateId];
    const formTemplate = formTemplates[activeFormTemplateId];

    // determine which set of forms to show
    const bestForms = (forms[rootFormTemplateId] || []).map(form =>
      _bestForm(form, forms));

    const classes = ['form-summary__container'];
    if (className) {
      classes.push(className);
    }

    let formTemplateLink;
    if (session && session.userId.administrator && finalFormTemplate) {
      const formTemplatePath = `/form-templates/${finalFormTemplateId}`;
      formTemplateLink = (
        <Link className="form-summary__template" to={formTemplatePath}>
          {finalFormTemplate.name}
        </Link>
      );
    }

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
        const onCancel = bestForms.length > 0 ? this._nextState(SUMMARY) : undefined;
        contents = (
          <FormAdd full={false} inline={true}
            formTemplateId={activeFormTemplateId} linkedForm={linkedForm}
            onDone={this._onDone} onCancel={onCancel} />
        );
        break;
      }

      case EDITING: {
        contents = (
          <FormEdit id={editId} full={false} inline={true}
            onDone={this._onDone} onCancel={this._nextState(SUMMARY)}
            onLinkedForm={id => this.setState({ editId: id })} />
        );
        break;
      }

      case PAYING: {
        contents = (
          <PaymentPay formId={paymentFormId}
            formTemplateId={activeFormTemplateId}
            onDone={this._onDone} onCancel={this._nextState(SUMMARY)} />
        );
        break;
      }

      case SUMMARY: {
        const items = bestForms.map((form) => {
          let itemContents;
          if (form.formTemplateId._id === finalFormTemplateId) {
            itemContents = (
              <FormItem item={form} onClick={this._edit(form._id)}
                verb={LABEL[formTemplate.submitLabel] || LABEL.Submit}
                distinguish={bestForms.length > 1} />
            );
          } else {
            itemContents = (
              <FormItem item={form} onClick={this._add(form)}
                intermediate={true} />
            );
          }
          return <li key={form._id}>{itemContents}</li>;
        });

        contents = (
          <div className="form-summary">
            <Button className="form-summary__add" plain={true}
              icon={<AddIcon />} onClick={this._add()} />
            <div className="form-summary__message">
              <Markdown>
                {formTemplate.postSubmitMessage || `## ${formTemplate.name}`}
              </Markdown>
            </div>
            <ul className="list">
              {items}
            </ul>
          </div>
        );
        break;
      }

      default:
        contents = <Loading />;
    }

    return (
      <div className={classes.join(' ')}
        style={{ height }}>
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
  formTemplateId: PropTypes.oneOfType([
    PropTypes.string, PropTypes.object]),
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
  session: undefined,
};

const select = state => ({
  session: state.session,
});

export default Stored(FormSection, select);
