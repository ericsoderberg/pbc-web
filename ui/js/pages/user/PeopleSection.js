import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import Markdown from 'markdown-to-jsx';
import { getItem } from '../../actions';
import Image from '../../components/Image';
import UserIcon from '../../icons/User';

export default class PeopleSection extends Component {

  constructor() {
    super();
    this.state = { users: [] };
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._load(nextProps);
  }

  _load(props) {
    // When editing, we only have ids, get the rest
    (props.people || []).forEach((person) => {
      if (typeof person.id === 'string' && !person.image &&
        !this.state.users[person.id]) {
        getItem('users', person.id)
        .then((user) => {
          const users = { ...this.state.users };
          users[person.id] = user;
          this.setState({ users });
        })
        .catch(error => console.error('!!! PeopleSummary catch', error));
      }
    });
  }

  render() {
    const { className, people } = this.props;

    const classes = ['people-summaries'];
    if (className) {
      classes.push(className);
    }

    const links = (people || []).map((person) => {
      let user;
      if (typeof person.id === 'object') {
       // populated on server
        user = person.id;
      } else {
        // populated via _load
        user = this.state.users[person.id];
      }
      return { person, user };
    })
    .filter(context => context.user)
    .map((context) => {
      const { person, user } = context;
      let image;
      if (person.image || user.image) {
        image = (
          <Image className="person-summary__image" plain={true}
            image={person.image || user.image} />
        );
      } else {
        image = <UserIcon className="person-summary__image" />;
      }

      return (
        <Link key={user._id} to={`/users/${user._id}`}
          className="person-summary">
          {image}
          <div className="person-summary__summary">
            <h2>{user.name}</h2>
            <Markdown>
              {person.text || ''}
            </Markdown>
          </div>
        </Link>
      );
    });

    return (
      <div className={classes.join(' ')}>
        {links}
      </div>
    );
  }
}

PeopleSection.propTypes = {
  className: PropTypes.string,
  people: PropTypes.array,
};

PeopleSection.defaultProps = {
  className: undefined,
  people: [],
};
