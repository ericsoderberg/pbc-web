import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import TextHelp from '../../components/TextHelp';

export default class EmailListFormContents extends Component {

  constructor() {
    super();
    this.state = { domains: [] };
  }

  componentDidMount() {
    const { formState, session } = this.props;
    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.error('EmailListFormContents catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  render() {
    const { className, formState, session } = this.props;
    const emailList = formState.object;

    let administeredBy;
    if (session.administrator) {
      const domains = this.state.domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domains.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={emailList.domainId || ''}
            onChange={formState.change('domainId')}>
            {domains}
          </select>
        </FormField>
      );
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input name="name" value={emailList.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField name="text" label="Description" help={<TextHelp />}>
            <textarea name="text" value={emailList.text || ''} rows={4}
              onChange={formState.change('text')} />
          </FormField>
          <FormField label="Path" help="unique url name">
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
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

EmailListFormContents.defaultProps = {
  className: undefined,
};
