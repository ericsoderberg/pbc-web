
import React, { Component, PropTypes } from 'react';
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
    const { history, location } = this.props;
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
};

Messages.defaultProps = {
  libraries: [],
};

const select = state => ({
  libraries: (state.libraries || {}).items || [],
  session: state.session,
});

export default connect(select)(Messages);
