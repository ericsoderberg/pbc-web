import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Show from '../../components/Show';
import Section from '../../components/Section';
import Text from '../../components/Text';
import Image from '../../components/Image';

const UserContentsBase = (props) => {
  const { session } = props;
  const user = props.item;

  let image;
  if (user.image) {
    image = <Image image={user.image} avatar={true} />;
  }

  let text;
  if (user.text) {
    text = (
      <Section full={false}>
        <Text text={user.text} />
      </Section>
    );
  }

  let associated;
  if (session && (session.userId.administrator || session.userId._id === user._id)) {
    associated = [
      <Link key="forms"
        className="associated-link"
        to={`/forms?userId=${encodeURIComponent(user._id)}&userId-name=${user.name}`}>
        Forms
      </Link>,
      <Link key="payments"
        className="associated-link"
        to={`/payments?userId=${user._id}&userId-name=${user.name}`}>
        Payments
      </Link>,
    ];

    if (session.userId.administrator) {
      associated.push(
        <Link key="email"
          className="associated-link"
          to={`/email-lists?addresses.address=${user.email}&addresses-name=${user.email}`}>
          Email Lists
        </Link>,
      );
    }

    associated = (
      <div className="associated">
        {associated}
      </div>
    );
  }

  return (
    <div>
      <Section full={false}>
        <div>
          <div className="user__summary">
            {image}
            <div className="user__heading">
              <h1>{user.name}</h1>
              <a href={`mailto:${user.email}`}>{user.email}</a>
            </div>
          </div>
        </div>
      </Section>
      {text}
      {associated}
    </div>
  );
};

UserContentsBase.propTypes = {
  item: PropTypes.object.isRequired,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      domainIds: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
};

UserContentsBase.defaultProps = {
  session: undefined,
};

const select = state => ({
  session: state.session,
});

const UserContents = connect(select)(UserContentsBase);

export default class User extends Show {}

User.defaultProps = {
  category: 'users',
  Contents: UserContents,
};
