import React, { Component, PropTypes } from 'react';
import { getResources } from '../../actions';
import FormField from '../../components/FormField';
import Button from '../../components/Button';

export default class EventResources extends Component {

  constructor() {
    super();
    this._onToggle = this._onToggle.bind(this);
    this._get = this._get.bind(this);
    this.state = { resources: [], active: false };
  }

  componentDidUpdate() {
    if (this._scrollNeeded) {
      this._scrollNeeded = false;
      const rect = this._containerRef.getBoundingClientRect();
      window.scrollBy(0, rect.top);
    }
  }

  _get() {
    const { formState: { object: event } } = this.props;
    const { active } = this.state;
    if (active) {
      getResources(event)
      .then((resources) => {
        this.setState({ resources });
        this._scrollNeeded = true;
      })
      .catch(error => console.error('!!! EventResources catch', error));
    }
  }

  _onToggle() {
    this.setState({ active: !this.state.active }, this._get);
  }

  render() {
    const { errors, formState } = this.props;
    const { active } = this.state;
    const event = formState.object;

    let fields;
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

      fields = [
        <FormField key="resources">
          {resources}
        </FormField>,
        <FormField key="setup" label="Setup time" help="minutes"
          error={errors.setup}>
          <input name="setup" type="number" min="0" step="15"
            value={event.setup || 0}
            onChange={formState.change('setup')} />
        </FormField>,
        <FormField key="teaddown" label="Teardown time" help="minutes"
          error={errors.teardown}>
          <input name="teardown" type="number" min="0" step="15"
            value={event.teardown || 0}
            onChange={formState.change('teardown')} />
        </FormField>,
      ];
    }

    return (
      <fieldset ref={(ref) => { this._containerRef = ref; }}
        className="form__fields">
        <div type="button" className="form-item">
          <Button secondary={true} label="Resource reservations"
            onClick={this._onToggle} />
        </div>
        {fields}
      </fieldset>
    );
  }
}

EventResources.propTypes = {
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
};

EventResources.defaultProps = {
  errors: {},
};
