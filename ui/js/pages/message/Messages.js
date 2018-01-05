
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../../actions';
import List from '../../components/List';
import MessageItem from './MessageItem';

class MessagesMessageItem extends MessageItem {}

MessagesMessageItem.defaultProps = {
  detailsForMostRecent: true,
};

class Messages extends Component {

  constructor() {
    super();
    this.state = { filterOptions: [] };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(loadCategory('libraries', { sort: 'name' }));
  }

  componentWillReceiveProps(nextProps) {
    const { libraries } = nextProps;
    if (libraries) {
      this.setState({
        // convert to options format with label and value
        filterOptions: libraries.map(library => ({
          label: library.name,
          value: library._id,
        })),
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCategory('libraries'));
  }

  render() {
    const { history, location, session } = this.props;
    const { filterOptions } = this.state;

    let filters;
    if (session &&
      (session.userId.administrator || session.userId.domainIds.length > 0)) {
      filters = [{
        property: 'libraryId',
        options: filterOptions,
        allLabel: 'All libraries',
      }];
    }

    return (
      <List location={location}
        homer={true}
        category="messages"
        title="Messages"
        path="/messages"
        filters={filters}
        select="name path verses date author"
        sort="-date"
        Item={MessagesMessageItem}
        history={history} />
    );
  }
}

Messages.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.any.isRequired,
  libraries: PropTypes.array,
  location: PropTypes.object.isRequired,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      domainIds: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
};

Messages.defaultProps = {
  libraries: [],
  session: undefined,
};

const select = state => ({
  libraries: (state.libraries || {}).items || [],
  session: state.session,
});

export default connect(select)(Messages);
