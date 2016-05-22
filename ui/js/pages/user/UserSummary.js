"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import Section from '../../components/Section';
import Image from '../../components/Image';

export default class UserSummary extends Component {

  constructor (props) {
    super(props);
    this.state = { user: props.user || {} };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.id !== this.props.id) {
      this._load(nextProps);
    }
  }

  _load (props) {
    const { user, id } = props;
    if (id && ! user) {
      getItem('users', id)
      .then(user => this.setState({ user: user }))
      .catch(error => console.log('!!! UserSummary catch', error));
    }
  }

  render () {
    const { color, full, plain } = this.props;
    const { user } = this.state;

    let image;
    if (user.avatar) {
      image = (
        <Image className="user-summary__avatar" plain={true}
          image={user.avatar} />
      );
    }

    return (
      <Section color={color} full={full} plain={plain}>
        <Link to={`/users/${user._id}`} className="user-summary">
          {image}
          <div className="user-summary__summary">
            <h2>{user.name}</h2>
          </div>
        </Link>
      </Section>
    );
  }
};

UserSummary.propTypes = {
  user: PropTypes.object,
  id: PropTypes.string,
  ...Section.propTypes
};
