"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import PodcastEdit from './PodcastEdit';

export default class LibraryFormContents extends Component {

  constructor () {
    super();
    this.state = { domains: [] };
  }

  componentDidMount () {
    const { formState, session } = this.props;

    this.refs.name.focus();

    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.log('LibraryFormContents domains catch', error));
    } else if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  render () {
    const { formState, session } = this.props;
    const library = formState.object;

    let administeredBy;
    if (session.administrator) {
      let domains = this.state.domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      domains.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={library.domainId || ''}
            onChange={formState.change('domainId')}>
            {domains}
          </select>
        </FormField>
      );
    }

    let podcast;
    if (library.podcast) {
      podcast = (
        <PodcastEdit podcast={library.podcast}
          onChange={formState.change('podcast')} />
      );
    }

    return (
      <div>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input ref="name" name="name" value={library.name || ''}
              onChange={formState.change('name')}/>
          </FormField>
          <FormField name="path" label="Path" help="unique url name">
            <input name="path" value={library.path || ''}
              onChange={formState.change('path')}/>
          </FormField>
          {administeredBy}
          <FormField>
            <input name="podcast" type="checkbox"
              checked={library.podcast ? true : false}
              onChange={() =>
                formState.set('podcast', library.podcast ? undefined : {})} />
            <label htmlFor="podcast">podcast</label>
          </FormField>
        </fieldset>
        {podcast}
      </div>
    );
  }
};

LibraryFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
