"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import TextHelp from '../../components/TextHelp';
import AddIcon from '../../icons/Add';
import TrashIcon from '../../icons/Trash';

export default class EmailListFormContents extends Component {

  constructor () {
    super();
    this._onChangeAdd = this._onChangeAdd.bind(this);
    this._onAddAddress = this._onAddAddress.bind(this);
    this._onChangeAddresses = this._onChangeAddresses.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this.state = {
      addAddress: '', domains: [], searchText: '', addresses: undefined };
  }

  componentDidMount () {
    const { formState, session } = this.props;
    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.log('EmailListFormContents catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  _onChangeAdd (event) {
    this.setState({ addAddress: event.target.value });
  }

  _onAddAddress (event) {
    if (this.state.addAddress) {
      const { formState } = this.props;
      const emailList = formState.object;
      let addresses = (emailList.addresses || []).splice(0);
      addresses.push({ address: this.state.addAddress });
      formState.set('addresses', addresses);
      this.setState({ addAddress: '' });
    }
  }

  _onChangeAddresses (event) {
    const { formState } = this.props;
    let addresses = event.target.value.split(/\s+/).filter(address => address);
    if (this.state.addAddress) {
      addresses.push(this.state.addAddress);
    }
    formState.set('addresses', addresses.sort());
  }

  _onSearch (event) {
    event.preventDefault();
    const searchText = event.target.value;
    const { formState } = this.props;
    let addresses;
    if (searchText) {
      const emailList = formState.object;
      const exp = new RegExp(searchText, 'i');
      addresses = emailList.addresses
      .filter(address => (
        exp.test(address.address) || exp.test(address.userId.name)
      ));
    }
    this.setState({ addresses: addresses, searchText: searchText });
  }

  render () {
    const { formState, session } = this.props;
    const emailList = formState.object;

    let administeredBy;
    if (session.administrator) {
      let domains = this.state.domains.map(domain => (
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

    const addresses = (this.state.addresses || emailList.addresses || [])
    .map((address, index) => {
      let details;
      if (address.userId) {
        details = (
          <div className="email-list__address">
            <span>{address.address}</span>
            <span>{address.state}</span>
            <Link to={`/users/${address.userId._id}`}>
              <span>{address.userId.name}</span>
            </Link>
          </div>
        );
      } else {
        details = address.address;
      }
      return (
        <li key={index} className="form-item">
          {details}
          <button type="button" className="button-icon"
            onClick={formState.removeAt('addresses', index)}>
            <TrashIcon />
          </button>
        </li>
      );
    });

    let search;
    if (this.state.searchText || addresses.length > 1) {
      search = (
        <div className="form-item email-list__search">
          <input value={this.state.searchText} placeholder="Search"
            onChange={this._onSearch} />
        </div>
      );
    }

    return (
      <div>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input name="name" value={emailList.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          <FormField name="text" label="Description" help={<TextHelp />}>
            <textarea name="text" value={emailList.text || ''} rows={4}
              onChange={formState.change('text')}/>
          </FormField>
          <FormField>
            <input name="public" type="checkbox"
              checked={emailList.public || false}
              onChange={formState.toggle('public')}/>
            <label htmlFor="public">Allow self subscription</label>
          </FormField>
          {administeredBy}
        </fieldset>

        <div className="form-section">
          <div className="form-item">
            <h3>Email addresses</h3>
            <input name="add" placeholder="Address to add"
              value={this.state.addAddress}
              onChange={this._onChangeAdd} />
            <button type="button" className="button-icon"
              onClick={this._onAddAddress}>
              <AddIcon />
            </button>
          </div>
          {search}
          <ul className="list">
            {addresses}
          </ul>
        </div>
      </div>
    );
  }
};

EmailListFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
