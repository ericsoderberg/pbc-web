import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../../actions';
import FormField from '../../components/FormField';
import ImageField from '../../components/ImageField';
import TextHelp from '../../components/TextHelp';

class UserFormContents extends Component {

  componentDidMount() {
    const { dispatch, session } = this.props;
    if (session.userId.administrator || session.userId.administratorDomainId) {
      dispatch(loadCategory('domains', { sort: 'name' }));
    }
  }

  componentWillUnmount() {
    const { dispatch, session } = this.props;
    if (session.userId.administrator) {
      dispatch(unloadCategory('domains'));
    }
  }

  render() {
    const { className, domains, formState, session } = this.props;
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
              value={user.administratorDomainId || ''}
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
  dispatch: PropTypes.func.isRequired,
  domains: PropTypes.array,
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
  domains: [],
};

const select = state => ({
  domains: (state.domains || {}).items,
});

export default connect(select)(UserFormContents);
