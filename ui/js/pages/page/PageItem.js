"use strict";
import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const PageItem = (props) => {
  const { className, item: page } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={page.path || `/pages/${page._id}`}>
      <div className="item">
        <span className="item__name">{page.name}</span>
      </div>
    </Link>
  );
};

PageItem.propTypes = {
  item: PropTypes.object
};

export default PageItem;
