import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: payment } = props;
  const classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/payments/${payment._id}/edit`}>
      <div className="item">
        <span className="item__name">{(payment.userId || {}).name}</span>
        <span className="secondary">
          {moment(payment.sent).format('MMM Do YYYY')}
        </span>
      </div>
    </Link>
  );
};

Item.propTypes = {
  className: PropTypes.string,
  item: PropTypes.object.isRequired,
};

Item.defaultProps = {
  className: undefined,
};

export default class Payments extends List {}

Payments.defaultProps = {
  ...List.defaultProps,
  category: 'payments',
  Item,
  path: '/payments',
  populate: true,
  sort: '-modified',
  title: 'Payments',
};
