
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import List from '../../components/List';
import MessageItem from './MessageItem';

class MessagesMessageItem extends MessageItem {}

MessagesMessageItem.defaultProps = {
  detailsForMostRecent: true,
};

export default class Messages extends Component {

  constructor() {
    super();
    this.state = { filterOptions: [] };
  }

  componentDidMount() {
    getItems('libraries', { select: 'name' })
    .then(response => this.setState({
      // convert to options format with label and value
      filterOptions: response.map(library => ({
        label: library.name,
        value: library._id,
      })),
    }))
    .catch(error => console.error('!!! Messages catch', error));
  }

  render() {
    const { location } = this.props;
    const { filterOptions } = this.state;

    const filter = {
      property: 'libraryId',
      options: filterOptions,
      allLabel: 'All libraries',
    };

    return (
      <List location={location} homer={true}
        category="messages" title="Messages" path="/messages"
        filters={[filter]} select="name path verses date author" sort="-date"
        Item={MessagesMessageItem} />
    );
  }
}

Messages.propTypes = {
  location: PropTypes.object.isRequired,
};
