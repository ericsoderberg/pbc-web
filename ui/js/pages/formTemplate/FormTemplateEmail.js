import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Form from '../../components/Form';
import FormField from '../../components/FormField';
import TextHelp from '../../components/TextHelp';
import { loadItem, unloadItem, postFormTemplateEmailSend } from '../../actions';
import FormTemplateEmailPreview from './FormTemplateEmailPreview';

const FormContents = ({ className, formState }) => (
  <div className={className}>
    <fieldset className="form__fields">
      <FormField name="contents" label="Contents" help={<TextHelp />}>
        <textarea name="contents"
          value={formState.object.contents}
          rows={8}
          onChange={formState.change('contents')} />
      </FormField>
    </fieldset>
  </div>
);

FormContents.propTypes = {
  className: PropTypes.string.isRequired,
  formState: PropTypes.object.isRequired,
};

class FormTemplateEmail extends Component {

  constructor() {
    super();
    this._onSend = this._onSend.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this.state = { contents: '' };
  }

  componentDidMount() {
    const { formTemplate, title } = this.props;
    document.title = title;
    if (!formTemplate) {
      this._load(this.props);
    }
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('form-templates', id));
  }

  _load(props) {
    const { dispatch, id, title } = props;
    document.title = title;
    dispatch(loadItem('form-templates', id));
  }

  _onSend(data) {
    const { id } = this.props;
    postFormTemplateEmailSend(id, data);
    this._onCancel();
  }

  _onCancel() {
    const { router } = this.context;
    router.history.goBack();
  }

  render() {
    const { formTemplate, id, notFound, session, title } = this.props;
    const { contents } = this.state;
    return (
      <Form title={title}
        session={session}
        submitLabel="Send"
        loading={!formTemplate && !notFound}
        notFound={notFound}
        action={`/api/form-templates/${id}/email`}
        FormContents={FormContents}
        Preview={FormTemplateEmailPreview}
        item={{ contents }}
        onSubmit={this._onSend}
        onCancel={this._onCancel} />
    );
  }
}

FormTemplateEmail.propTypes = {
  dispatch: PropTypes.func.isRequired,
  formTemplate: PropTypes.object,
  id: PropTypes.string.isRequired,
  notFound: PropTypes.bool,
  session: PropTypes.object.isRequired,
  title: PropTypes.string,
};

FormTemplateEmail.defaultProps = {
  formTemplate: undefined,
  notFound: false,
  title: 'Email Form Submitters',
};

FormTemplateEmail.contextTypes = {
  router: PropTypes.any,
};

const select = (state, props) => {
  const id = props.id || props.match.params.id;
  return {
    formTemplate: state[id],
    id,
    notFound: state.notFound[id],
    session: state.session,
  };
};

export default connect(select)(FormTemplateEmail);
