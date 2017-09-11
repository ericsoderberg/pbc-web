import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: payment, session } = props;
  const classNames = ['item__container', className];
  const amountClassNames = ['payment__item-amount'];
  if (!payment.received) {
    amountClassNames.push('error');
  }
  let name;
  if (session.userId.administrator ||
    (session.userId.domainIds && session.userId.domainIds.length > 0)) {
    name = (
      <span className="box--row">
        <span>{payment.name || (payment.userId || {}).name}</span>
        <span className="tertiary">{(payment.formTemplateId || {}).name}</span>
      </span>
    );
  } else {
    name = (
      <span>{(payment.formTemplateId || { name: '?' }).name}</span>
    );
  }
  return (
    <Link className={classNames.join(' ')}
      to={`/payments/${payment._id}/edit`}>
      <div className="item">
        {name}
        <span className="box--row">
          <span className="secondary">
            {moment(payment.sent).format('MMM Do YYYY')}
          </span>
          <span className={amountClassNames.join(' ')}>$ {payment.amount}</span>
        </span>
      </div>
    </Link>
  );
};

Item.propTypes = {
  className: PropTypes.string,
  item: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

Item.defaultProps = {
  className: undefined,
};

export default class Payments extends List {}

Payments.defaultProps = {
  ...List.defaultProps,
  category: 'payments',
  filters: [{
    property: 'formTemplateId',
    category: 'form-templates',
    allLabel: 'All templates',
  }, {
    property: 'userId', category: 'users', allLabel: 'Anyone',
  }],
  Item,
  path: '/payments',
  populate: true,
  sort: '-modified',
  title: 'Payments',
};
