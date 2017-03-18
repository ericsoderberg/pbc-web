import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import ImageField from '../../components/ImageField';
import TextHelp from '../../components/TextHelp';

export default class UserFormContents extends Component {

  constructor() {
    super();
    this.state = { domains: [] };
  }

  componentDidMount() {
    const { session } = this.props;
    if (session.userId.administrator || session.userId.administratorDomainId) {
      this._getDomains();
    }
  }

  _getDomains() {
    getItems('domains', { sort: 'name' })
    .then(response => this.setState({ domains: response }))
    .catch(error => console.error('UserFormContents domains catch', error));
  }

  render() {
    const { className, formState, session } = this.props;
    const { domains } = this.state;
    const user = formState.object;

    let adminFields;
    if (session.userId.administrator) {
      const domainOptions = domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domainOptions.unshift(<option key={0} />);

      adminFields = (
        <fieldset className="form__fields">
          <FormField>
            <input name="administrator" type="checkbox"
              checked={user.administrator || false}
              onChange={formState.toggle('administrator')} />
            <label htmlFor="administrator">Administrator</label>
          </FormField>
          <FormField label="Administrator for">
            <select name="administratorDomainId"
              value={(user.administratorDomainId || {})._id || ''}
              onChange={formState.change('administratorDomainId')}>
              {domainOptions}
            </select>
          </FormField>
        </fieldset>
      );
    } else if (session.userId.administratorDomainId && domains.length > 0 &&
      user.administratorDomainId) {
      const domain = domains.filter(d => d._id === user.administratorDomainId._id);
      adminFields = (
        <fieldset className="form__fields">
          <FormField label="Administrator for">
            <input name="administratorDomainId" disabled={true}
              value={domain.name} />
          </FormField>
        </fieldset>
      );
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input name="name" value={user.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField name="email" label="Email">
            <input name="email" value={user.email || ''}
              onChange={formState.change('email')} />
          </FormField>
          <FormField name="password" label="Password">
            <input name="password" type="password" value={user.password || ''}
              onChange={formState.change('password')} />
          </FormField>
        </fieldset>

        <fieldset className="form__fields">
          <ImageField label="Photo" name="image"
            formState={formState} property="image" />
          <FormField name="text" label="Text" help={<TextHelp />}>
            <textarea name="text" value={user.text || ''} rows={8}
              onChange={formState.change('text')} />
          </FormField>
          <FormField name="phone" label="Phone">
            <input name="phone" value={user.phone || ''}
              onChange={formState.change('phone')} />
          </FormField>
        </fieldset>

        {adminFields}

      </div>
    );
  }
}

UserFormContents.propTypes = {
  className: PropTypes.string,
  formState: PropTypes.object.isRequired,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
      name: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

UserFormContents.defaultProps = {
  className: undefined,
};
