import React, { PropTypes } from 'react';
import Show from '../../components/Show';
import Section from '../../components/Section';
import Text from '../../components/Text';
import Image from '../../components/Image';

const UserContents = (props) => {
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
    </div>
  );
};


UserContents.propTypes = {
  item: PropTypes.object.isRequired,
};

export default class User extends Show {}

User.defaultProps = {
  category: 'users',
  Contents: UserContents,
};
