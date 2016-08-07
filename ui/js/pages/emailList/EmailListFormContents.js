"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';

export default class EmailListFormContents extends Component {

  constructor () {
    super();
    this._onChangeAdd = this._onChangeAdd.bind(this);
    this._onAdd = this._onAdd.bind(this);
    this._onChangeAddresses = this._onChangeAddresses.bind(this);
    this.state = { addAddress: '', domains: [] };
  }

  componentDidMount () {
    const { formState, session } = this.props;
    if (session.administrator) {
      getItems('domains')
      .then(response => this.setState({ domains: response }))
      .catch(error => console.log('EmailListFormContents catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  _onChangeAdd (event) {
    this.setState({ addAddress: event.target.value });
  }

  _onAdd (event) {
    if (this.state.addAddress) {
      const { formState } = this.props;
      const emailList = formState.object;
      let addresses = (emailList.addresses || []).splice(0);
      addresses.push(this.state.addAddress);
      formState.set('addresses', addresses.sort());
      this.setState({ addAddress: '' });
    }
  }

  _onChangeAddresses (event) {
    const { formState } = this.props;
    let addresses = event.target.value.split(' ');
    addresses.push(this.state.addAddress);
    formState.set('addresses', addresses.sort());
  }

  render () {
    const { formState, session } = this.props;
    const emailList = formState.object;

    const textHelp = (
      <a href="http://daringfireball.net/projects/markdown/syntax"
        target="_blank">Markdown syntax</a>
    );

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

    return (
      <fieldset className="form__fields">
        <FormField label="Name">
          <input name="name" value={emailList.name || ''}
            onChange={formState.change('name')}/>
        </FormField>
        <FormField name="text" label="Text" help={textHelp}>
          <textarea name="text" value={emailList.text || ''} rows={4}
            onChange={formState.change('text')}/>
        </FormField>
        <FormField label="Add address">
          <input name="add" value={this.state.addAddress}
            onChange={this._onChangeAdd} />
          <div className="form__tabs">
            <button type="button" className="button button--secondary"
              onClick={this._onAdd}>
              Add
            </button>
          </div>
        </FormField>
        <FormField name="addresses" label="Addresses">
          <textarea name="addresses" value={(emailList.addresses || []).join("\n")} rows={8}
            onChange={this._onChangeAddresses}/>
        </FormField>
        {administeredBy}
      </fieldset>
    );
  }
};

EmailListFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
