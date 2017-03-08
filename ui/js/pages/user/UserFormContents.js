import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import ImageField from '../../components/ImageField';
import SelectSearch from '../../components/SelectSearch';
import TextHelp from '../../components/TextHelp';
import AddIcon from '../../icons/Add';
import TrashIcon from '../../icons/Trash';

export default class UserFormContents extends Component {

  constructor() {
    super();
    this._onAddEmailList = this._onAddEmailList.bind(this);
    this.state = {
      domains: [],
      newRelationId: 1,
    };
  }

  componentDidMount() {
    const { formState, session } = this.props;

    if (session.administrator) {
      this._getDomains();
    }

    if (formState.object._id) {
      this._getEmailLists(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.formState.object._id && nextProps.formState.object._id) {
      this._getEmailLists(nextProps);
    }
  }

  _getDomains() {
    getItems('domains', { sort: 'name' })
    .then(response => this.setState({ domains: response }))
    .catch(error => console.error('UserFormContents domains catch', error));
  }

  _getEmailLists(props) {
    const { formState } = props;
    const user = formState.object;
    getItems('email-lists', {
      filter: { 'addresses.address': { $eq: user.email } },
      sort: 'name',
    })
    .then(response => formState.set('emailLists', response))
    .catch(error => console.error('UserFormContents email lists catch', error));
  }

  _addRelation() {
    return this.props.formState.addTo('relations', () => {
      const id = this.state.newRelationId;
      this.setState({ newRelationId: this.state.newRelationId + 1 });
      return { id };
    });
  }

  _onAddEmailList() {
    const { formState } = this.props;
    formState.addTo('emailLists', { subscribe: true })();
  }

  _removeEmailList(index) {
    return () => {
      const { formState } = this.props;
      const user = formState.object;
      if (user.emailLists[index].subscribe) {
        formState.removeAt('emailLists', index)();
      } else {
        formState.changeAt('emailLists', index)({
          ...user.emailLists[index],
          unsubscribe: true,
        });
      }
    };
  }

  _setEmailList(index) {
    return (suggestion) => {
      const { formState } = this.props;
      formState.changeAt('emailLists', index)({
        ...suggestion,
        subscribe: true,
      });
    };
  }

  render() {
    const { className, formState, session } = this.props;
    const user = formState.object;

    let adminFields;
    if (session.administrator) {
      const domains = this.state.domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domains.unshift(<option key={0} />);

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
              {domains}
            </select>
          </FormField>
        </fieldset>
      );
    }

    const emailLists = (user.emailLists || [])
    .filter(emailList => !emailList.unsubscribe)
    .map((emailList, index) => {
      let value;
      if (emailList.subscribe) {
        value = (
          <SelectSearch category="email-lists" exclude={user.emailLists}
            value={emailList.name} active={!emailList.name}
            onChange={this._setEmailList(index)} />
        );
      } else {
        value = (
          <Link to={`/email-lists/${emailList._id}/edit`}>
            {emailList.name}
          </Link>
        );
      }
      return (
        <div key={emailList._id}>
          <div className="form-item">
            {value}
            <button type="button" className="button-icon"
              onClick={this._removeEmailList(index)}>
              <TrashIcon />
            </button>
          </div>
        </div>
      );
    });

    const addEmailListControl = (
      <button type="button" className="button-icon"
        onClick={this._onAddEmailList}>
        <AddIcon />
      </button>
    );

    const formPath = '/forms?' +
      `userId=${encodeURIComponent(user._id)}` +
      `&userId-name=${encodeURIComponent(user.name)}`;

    // let family;
    // if (user.familyId) {
    //   family = <Link to={`/families/${user.familyId}/edit`}>Family</Link>;
    // } else {
    //   family = <Link to={'/families/add'}>Add Family</Link>;
    // }

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

        {/* }
        <div className="form-section">
          <div className="form-item">
            <h3>{family}</h3>
          </div>
        </div>
        {*/}

        <div className="form-section">
          <div className="form-item">
            <h3><Link to={formPath}>Forms</Link></h3>
          </div>
        </div>

        <div className="form-section">
          <div className="form-item">
            <h3>Email Lists</h3>
            {emailLists.length === 0 ? addEmailListControl : undefined}
          </div>
          {emailLists}
          <div className="form-item">
            {emailLists.length > 0 ? addEmailListControl : undefined}
          </div>
        </div>


      </div>
    );
  }
}

UserFormContents.propTypes = {
  className: PropTypes.string,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

UserFormContents.defaultProps = {
  className: undefined,
};
