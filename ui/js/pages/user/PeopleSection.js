import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Markdown from 'markdown-to-jsx';
import Image from '../../components/Image';
import UserIcon from '../../icons/User';

export default class PeopleSection extends Component {

  render() {
    const { className, people } = this.props;

    const classes = ['people-summaries'];
    if (className) {
      classes.push(className);
    }

    const links = (people || []).map((person) => {
      const user = person.id;
      return { person, user };
    })
      .filter(context => typeof context.user === 'object')
      .map((context) => {
        const { person, user } = context;
        let image;
        if ((person && person.image) || (user && user.image)) {
          image = (
            <Image className="person-summary__image"
              plain={true}
              image={(person && person.image) || (user && user.image)} />
          );
        } else {
          image = <UserIcon className="person-summary__image" />;
        }

        return (
          <Link key={user._id}
            to={`/users/${user._id}`}
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
