
import React, { Component, PropTypes } from 'react';
// import { Link } from 'react-router';
import moment from 'moment';
import { getResourceEvents } from '../../actions';
import Loading from '../../components/Loading';

export default class ResourceContents extends Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this._load();
  }

  _load() {
    const { item: resource } = this.props;
    getResourceEvents(resource)
    .then(events => this.setState({ events }))
    .catch(error => console.error('!!! ResourceContents catch', error));
  }

  render() {
    const { events } = this.state;

    let contents;
    if (!events) {
      contents = <Loading />;
    } else {
      const items = events.map(event => <div>{event.name}</div>);
      contents = (
        <div>
          {items}
        </div>
      );
    }
    return contents;
  }
}

ResourceContents.propTypes = {
  item: PropTypes.object.isRequired,
};
