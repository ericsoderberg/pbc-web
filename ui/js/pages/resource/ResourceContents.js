
import React, { Component, PropTypes } from 'react';
import { getResourceCalendar } from '../../actions';
import CalendarGrid from '../../components/CalendarGrid';
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
    getResourceCalendar(resource)
    .then(calendar => this.setState({ calendar }))
    .catch(error => console.error('!!! ResourceContents catch', error));
  }

  render() {
    const { calendar } = this.state;

    let contents;
    if (!calendar) {
      contents = <Loading />;
    } else {
      contents = <CalendarGrid weeks={calendar.weeks} />;
    }
    return contents;
  }
}

ResourceContents.propTypes = {
  item: PropTypes.object.isRequired,
};
