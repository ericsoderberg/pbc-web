import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../../actions';
import FormField from '../../components/FormField';
import TextHelp from '../../components/TextHelp';

class EmailListFormContents extends Component {

  componentDidMount() {
    const { dispatch, formState, session } = this.props;
    if (session.userId.administrator) {
      dispatch(loadCategory('domains', { sort: 'name' }));
    } else if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCategory('domains'));
  }

  render() {
    const { className, domains, errors, formState, session } = this.props;
    const emailList = formState.object;

    let administeredBy;
    if (session.userId.administrator) {
      const options = domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      options.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by" error={errors.domainId}>
          <select name="domainId" value={emailList.domainId || ''}
            onChange={formState.change('domainId')}>
            {options}
          </select>
        </FormField>
      );
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Name" error={errors.name}>
            <input name="name" value={emailList.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField name="text" label="Description" help={<TextHelp />}
            error={errors.text}>
            <textarea name="text" value={emailList.text || ''} rows={4}
              onChange={formState.change('text')} />
          </FormField>
          <FormField label="Url ID" help="unique url name"
            error={errors.path}>
            <input name="path" value={emailList.path || ''}
              onChange={formState.change('path')} />
          </FormField>
          <FormField>
            <input name="public" type="checkbox"
              checked={emailList.public || false}
              onChange={formState.toggle('public')} />
            <label htmlFor="public">Allow self subscription</label>
          </FormField>
          {administeredBy}
        </fieldset>
      </div>
    );
  }
}

EmailListFormContents.propTypes = {
  className: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  domains: PropTypes.array,
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

EmailListFormContents.defaultProps = {
  className: undefined,
  domains: [],
  errors: {},
};

const select = state => ({
  domains: (state.domains || {}).items || [],
  session: state.session,
});

export default connect(select)(EmailListFormContents);
