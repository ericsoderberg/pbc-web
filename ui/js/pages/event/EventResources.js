"use strict";
import React, { Component, PropTypes } from 'react';
import { getResources } from '../../actions';
import FormField from '../../components/FormField';

export default class EventResources extends Component {

  constructor () {
    super();
    this.state = { resources: [] };
  }

  componentDidMount () {
    const event = this.props.formState.object;
    getResources(event)
    .then(resources => this.setState({ resources: resources }))
    .catch(error => console.log('!!! EventResources catch', error));
  }

  render () {
    const { formState } = this.props;
    const event = formState.object;

    const resources = this.state.resources.map(resource => {
      let classNames = ['choice'];
      const checked = (event.resourceIds || []).some(resourceId => {
        return resourceId === resource._id;
      });
      let usedBy;
      if (resource.events) {
        classNames.push("choice--disabled");
        const events = resource.events.map(event => (
          <a key={event._id} href={`/events/${event._id}`}>{event.name}</a>
        ));
        usedBy = <span className="used-by">Used by {events}</span>;
      }
      return (
        <div key={resource._id} className={classNames.join(' ')}>
          <input type="checkbox" checked={checked} disabled={resource.events}
            onChange={formState.toggleIn('resourceIds', resource._id)}/>
          <label>{resource.name}</label>
          {usedBy}
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
