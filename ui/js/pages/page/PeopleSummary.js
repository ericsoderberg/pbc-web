"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import markdownToJSX from 'markdown-to-jsx';
import { getItem } from '../../actions';
import Section from '../../components/Section';
import Image from '../../components/Image';

export default class PeopleSummary extends Component {

  constructor () {
    super();
    this.state = { users: [] };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this._load(nextProps);
  }

  _load (props) {
    // When editing, we only have ids, get the rest
    (props.people || []).forEach(person => {
      if (typeof person.id === 'string' && ! person.image &&
        ! this.state.users[person.id]) {
        getItem('users', person.id)
        .then(user => {
          let users = { ...this.state.users };
          users[person.id] = user;
          this.setState({ users: users });
        })
        .catch(error => console.log('!!! PeopleSummary catch', error));
      }
    });
  }

  render () {
    const { color, full, people, plain } = this.props;

    const links = (people || []).map((person, index) => {
      let user;
      if (typeof person.id === 'object') {
       // populated on server
        user = person.id;
      } else {
        // populated via _load
        user = this.state.users[person.id] || {};
      }

      let image;
      if (person.image || user.image) {
        image = (
          <Image className="person-summary__image" plain={true}
            image={person.image || user.image} />
        );
      }

      return (
        <Link key={index} to={`/users/${user._id}`} className="person-summary">
          {image}
          <div className="person-summary__summary">
            <h2>{user.name}</h2>
            {markdownToJSX(person.text || '')}
          </div>
        </Link>
      );
    });

    return (
      <Section color={color} full={full} plain={plain}>
        <div className="people-summaries">
          {links}
        </div>
      </Section>
    );
  }
};

PeopleSummary.propTypes = {
  people: PropTypes.array,
  ...Section.propTypes
};
