"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import ImageField from '../../components/ImageField';
import SelectSearch from '../../components/SelectSearch';
import TextHelp from '../../components/TextHelp';
import AddIcon from '../../icons/Add';
import TrashIcon from '../../icons/Trash';
import RelationEdit from './RelationEdit';

export default class UserFormContents extends Component {

  constructor () {
    super();
    this._onAddEmailList = this._onAddEmailList.bind(this);
    this.state = {
      domains: [],
      newRelationId: 1
    };
  }

  componentDidMount () {
    const { formState, session } = this.props;
    this.refs.name.focus();

    if (session.administrator) {
      this._getDomains();
    }

    if (formState.object._id) {
      this._getEmailLists(this.props);
    }
  }

  componentWillReceiveProps (nextProps) {
    if (! this.props.formState.object._id && nextProps.formState.object._id) {
      this._getEmailLists(nextProps);
    }
  }

  _getDomains () {
    getItems('domains', { sort: 'name' })
    .then(response => this.setState({ domains: response }))
    .catch(error => console.log('UserFormContents domains catch', error));
  }

  _getEmailLists (props) {
    const { formState } = props;
    const user = formState.object;
    getItems('email-lists', {
      filter: { 'addresses.address': { $eq: user.email } },
      sort: 'name'
    })
    .then(response => formState.set('emailLists', response))
    .catch(error => console.log('UserFormContents email lists catch', error));
  }

  _addRelation () {
    return this.props.formState.addTo('relations', () => {
      const id = this.state.newRelationId;
      this.setState({ newRelationId: this.state.newRelationId + 1 });
      return { id: id };
    });
  }

  _onAddEmailList () {
    const { formState } = this.props;
    formState.addTo('emailLists', { subscribe: true })();
  }

  _removeEmailList (index) {
    return () => {
      const { formState } = this.props;
      const user = formState.object;
      if (user.emailLists[index].subscribe) {
        formState.removeAt('emailLists', index)();
      } else {
        formState.changeAt('emailLists', index)({
          ...user.emailLists[index],
          unsubscribe: true
        });
      }
    };
  }

  _setEmailList (index) {
    return (suggestion) => {
      const { formState } = this.props;
      formState.changeAt('emailLists', index)({
        ...suggestion,
        subscribe: true
      });
    };
  }

  render () {
    const { formState, session } = this.props;
    const user = formState.object;

    let adminFields;
    if (session.administrator) {
      let domains = this.state.domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domains.unshift(<option key={0} />);

      adminFields = (
        <fieldset className="form__fields">
          <FormField>
            <input name="administrator" type="checkbox"
              checked={user.administrator || false}
              onChange={formState.toggle('administrator')}/>
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

    let relations = (user.relations || []).map((relation, index) => (
      <div key={index}>
        <div className="form-item">
          <h4>{relation.name}</h4>
          <button type="button" className="button-icon"
            onClick={formState.removeAt('relations', index)}>
            <TrashIcon />
          </button>
        </div>
        <RelationEdit relation={relation}
          onChange={formState.changeAt('relations', index)} />
      </div>
    ));

    const addRelationControl = (
      <button type="button" className="button-icon"
        onClick={this._addRelation()}>
        <AddIcon />
      </button>
    );

    let emailLists = (user.emailLists || [])
    .filter(emailList => ! emailList.unsubscribe)
    .map((emailList, index) => {
      let value;
      if (emailList.subscribe) {
        value = (
          <SelectSearch category="email-lists" exclude={user.emailLists}
            value={emailList.name} active={! emailList.name}
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
        <div key={index}>
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

    const formPath = `/forms?` +
      `userId=${encodeURIComponent(user._id)}` +
      `&userId-name=${encodeURIComponent(user.name)}`;

    return (
      <div>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input ref="name" name="name" value={user.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          <FormField name="email" label="Email">
            <input name="email" value={user.email || ''}
              onChange={formState.change('email')}/>
          </FormField>
          <FormField name="password" label="Password">
            <input name="password" type="password" value={user.password || ''}
              onChange={formState.change('password')}/>
          </FormField>
        </fieldset>

        <fieldset className="form__fields">
          <ImageField label="Photo" name="image"
            formState={formState} property="image" />
          <FormField name="text" label="Text" help={<TextHelp />}>
            <textarea ref="text" name="text" value={user.text || ''} rows={8}
              onChange={formState.change('text')}/>
          </FormField>
        </fieldset>

        {adminFields}

        <div className="form-section">
          <div className="form-item">
            <h3>Family</h3>
            {relations.length === 0 ? addRelationControl : undefined}
          </div>
          {relations}
          <div className="form-item">
            {relations.length > 0 ? addRelationControl : undefined}
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

        <div className="form-section">
          <div className="form-item">
            <h3>Forms</h3>
            <Link to={formPath}>Filled out forms</Link>
          </div>
        </div>
      </div>
    );
  }
};

UserFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
