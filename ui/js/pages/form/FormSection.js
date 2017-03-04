
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
import { calculateTotal } from './FormUtils';

const LABEL = {
  Register: 'Registered',
  'Sign Up': 'Signed up',
  Submit: 'Submitted',
  Subscribe: 'Subscribed',
};

const FormItem = (props) => {
  const { className, distinguish, item: form, onClick, verb } = props;
  const classNames = ['item__container', className];
  const timestamp = moment(form.modified).format('MMM Do YYYY');
  let message;
  if (distinguish) {
    message = `${verb} for ${form.name} ${timestamp}`;
  } else {
    message = `${verb} ${timestamp}`;
  }

  return (
    <div className={classNames.join(' ')}>
      <div className="item item--full">
        <button className="button button-plain" onClick={onClick}>
          {message}
        </button>
      </div>
    </div>
  );
};

FormItem.propTypes = {
  className: PropTypes.string,
  distinguish: PropTypes.bool,
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  verb: PropTypes.string.isRequired,
};

FormItem.defaultProps = {
  className: undefined,
  distinguish: false,
};

class FormSection extends Component {

  constructor(props) {
    super(props);
    this._onAdd = this._onAdd.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._onDone = this._onDone.bind(this);
    this._onResize = this._onResize.bind(this);
    this._layout = this._layout.bind(this);
    this.state = { forms: [] };
  }

  componentDidMount() {
    this._load(this.props);
    // window.addEventListener('resize', this._onResize);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.formTemplateId !== this.props.formTemplateId) {
      this._load(nextProps);
    }
  }

  componentDidUpdate() {
    if (this.state.layoutNeeded) {
      this.setState({ layoutNeeded: undefined });
      this._onResize();
    }
  }

  componentWillUnmount() {
    // window.removeEventListener('resize', this._onResize);
    clearTimeout(this._layoutTimer);
  }

  _onResize() {
    clearTimeout(this._layoutTimer);
    this._layoutTimer = setTimeout(this._layout, 300);
  }

  _load(props) {
    const { formTemplate, formTemplateId } = props;
    if (formTemplateId && !formTemplate) {
      getItem('form-templates', formTemplateId._id || formTemplateId)
        // { select: 'name submitLabel authenticate payable' })
      .then(formTemplateResponse =>
        this.setState({ formTemplate: formTemplateResponse }, this._loadForms))
      .catch(error => console.error('!!! FormSummary formTemplate catch', error));
    } else if (formTemplate) {
      this.setState({ formTemplate }, this._loadForms);
    }
  }

  _loadForms() {
    const { session } = this.props;
    const { formTemplate } = this.state;
    if (session) {
      getItems('forms', {
        filter: {
          formTemplateId: formTemplate._id,
          userId: session.userId,
        },
        // select: 'modified userId name',
        populate: true,
      })
      .then((forms) => {
        let paymentFormId;
        if (formTemplate.payable) {
          // see if any require payment
          forms.forEach((form) => {
            const formTotal = calculateTotal(formTemplate, form);
            let paymentTotal = 0;
            (form.paymentIds || []).forEach((payment) => {
              paymentTotal += payment.amount;
            });
            if (formTotal > paymentTotal) {
              form.needsPayment = true;
              if (!paymentFormId) {
                paymentFormId = form._id;
              }
            }
          });
        }
        this.setState({ forms, paymentFormId });
      })
      .catch(error => console.error('!!! FormSummary forms catch', error));
    }
  }

  _layout() {
    // const contents = this.refs.contents;
    // const height = contents.offsetHeight;
    // if (this.state.height !== height) {
    //   this.setState({ height });
    //   // unset height after a while, this allows forms to be dynamic
    //   clearTimeout(this._layoutTimer);
    //   this._layoutTimer = setTimeout(
    //     () => this.setState({ height: undefined }), 600);
    // }
  }

  _onAdd() {
    this.setState({ adding: true, layoutNeeded: true });
  }

  _edit(id) {
    return () => {
      this.setState({ editId: id, layoutNeeded: true });
    };
  }

  _onCancel() {
    this.setState({
      adding: undefined,
      editId: undefined,
      paymentFormId: undefined,
      layoutNeeded: true,
    });
  }

  _onDone() {
    this.setState({ adding: undefined, editId: undefined, layoutNeeded: true });
    this._loadForms();
  }

  render() {
    const { className, formTemplateId, session } = this.props;
    const {
      formTemplate, forms, adding, editId, height, paymentFormId,
    } = this.state;

    const classes = ['form-summary__container'];
    if (className) {
      classes.push(className);
    }

    let formTemplateLink;
    if (session && session.administrator && formTemplate) {
      const formTemplatePath = `/form-templates/${formTemplate._id}`;
      formTemplateLink = (
        <Link className="form-summary__template" to={formTemplatePath}>
          {formTemplate.name}
        </Link>
      );
    }

    let contents;
    if (!formTemplateId || !forms || !formTemplate) {
      contents = <Loading />;
    } else if (!session && formTemplate.authenticate) {
      contents = (
        <div className="form-summary">
          <h2>{formTemplate.name}</h2>
          <p>You must sign in to fill out this form.</p>
          <Link className="link-button" to="/sign-in" >Sign In</Link>
        </div>
      );
    } else if (adding || forms.length === 0) {
      const onCancel = forms.length > 0 ? this._onCancel : undefined;
      contents = (
        <FormAdd formTemplateId={formTemplateId._id || formTemplateId}
          full={false} inline={true}
          onDone={this._onDone} onCancel={onCancel} />
      );
    } else if (editId) {
      contents = (
        <FormEdit id={editId} full={false} inline={true}
          onDone={this._onDone} onCancel={this._onCancel} />
      );
    } else if (paymentFormId) {
      contents = (
        <PaymentPay formId={paymentFormId} formTemplateId={formTemplate._id}
          onDone={this._onDone} onCancel={this._onCancel} />
      );
    } else {
      const items = forms.map(form => (
        <li key={form._id}>
          <FormItem item={form} onClick={this._edit(form._id)}
            verb={LABEL[formTemplate.submitLabel] || LABEL.Submit}
            distinguish={forms.length > 1} />
        </li>
      ));

      contents = (
        <div className="form-summary">
          <Button className="form-summary__add" plain={true}
            icon={<AddIcon />} onClick={this._onAdd} />
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
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string,
    userId: PropTypes.string,
  }).isRequired,
};

FormSection.defaultProps = {
  className: undefined,
  formTemplateId: undefined,
};

const select = state => ({
  session: state.session,
});

export default Stored(FormSection, select);
