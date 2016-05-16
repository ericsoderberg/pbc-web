"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';

export default class EventResources extends Component {

  constructor () {
    super();
    this.state = { resources: [] };
  }

  componentDidMount () {
    getItems('resources')
    .then(resources => this.setState({ resources: resources }))
    .catch(error => console.log('!!! EventResources catch', error));
  }

  render () {
    const { formState } = this.props;
    const event = formState.object;

    const resources = this.state.resources.map(resource => {
      const checked = (event.resources || []).some(resourceId => {
        return resourceId === resource._id;
      });
      return (
        <div key={resource._id}>
          <input type="checkbox" checked={checked}
            onChange={formState.toggleIn('resources', resource._id)}/>
          <label>{resource.name}</label>
        </div>
      );
    });

    return (
      <fieldset className="form__fields">
        <FormField label="Resources">
          {resources}
        </FormField>
      </fieldset>
    );
  }
};

EventResources.propTypes = {
  formState: PropTypes.object.isRequired
};
