import React, { Component, PropTypes } from 'react';
import { getResources } from '../../actions';
import FormField from '../../components/FormField';
import Button from '../../components/Button';

export default class EventResources extends Component {

  constructor() {
    super();
    this._onToggle = this._onToggle.bind(this);
    this._get = this._get.bind(this);
    this.state = { resources: [], active: false, scroll: false };
  }

  componentDidUpdate() {
    const { scroll } = this.state;
    if (scroll) {
      const rect = this._containerRef.getBoundingClientRect();
      window.scrollBy(0, rect.top);
      this.setState({ scroll: false });
    }
  }

  _get() {
    const { formState: { object: event } } = this.props;
    const { active, resources } = this.state;
    if (active) {
      if (resources.length === 0) {
        getResources(event)
        .then(resourcesResponse => this.setState({
          resources: resourcesResponse, scroll: true,
        }))
        .catch(error => console.error('!!! EventResources catch', error));
      } else {
        this.setState({ scroll: true });
      }
    }
  }

  _onToggle() {
    this.setState({ active: !this.state.active }, this._get);
  }

  render() {
    const { formState } = this.props;
    const { active } = this.state;
    const event = formState.object;

    let field;
    if (active) {
      const resources = this.state.resources.map((resource) => {
        const classNames = ['choice'];
        const checked = (event.resourceIds || []).some(resourceId =>
          (resourceId === resource._id));
        let usedBy;
        if (resource.events) {
          if (!checked) {
            // allow unchecking resources with conflicts
            classNames.push('choice--disabled');
          }
          const events = resource.events.map(resourceEvent => (
            <a key={resourceEvent._id} href={`/events/${resourceEvent._id}`}>
              {resourceEvent.name}
            </a>
          ));
          usedBy = <span className="choice__note">Used by {events}</span>;
        }
        return (
          <div key={resource._id} className={classNames.join(' ')}>
            <input type="checkbox" checked={checked}
              id={`resource-${resource._id}`}
              disabled={resource.events && !checked}
              onChange={formState.toggleIn('resourceIds', resource._id)} />
            <label htmlFor={`resource-${resource._id}`}>{resource.name}</label>
            {usedBy}
          </div>
        );
      });

      field = (
        <FormField>
          {resources}
        </FormField>
      );
    }

    return (
      <fieldset ref={(ref) => { this._containerRef = ref; }}
        className="form__fields">
        <div type="button" className="form-item">
          <Button secondary={true} label="Resource reservations"
            onClick={this._onToggle} />
        </div>
        {field}
      </fieldset>
    );
  }
}

EventResources.propTypes = {
  formState: PropTypes.object.isRequired,
};
