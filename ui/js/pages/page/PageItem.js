
import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const PageItem = (props) => {
  const { align, className, item: page } = props;
  const classNames = ['item__container', className];
  const itemClassNames = ['item'];
  if (align) {
    itemClassNames.push(`item--${align}`);
  }
  return (
    <Link className={classNames.join(' ')}
      to={page.path || `/pages/${page._id}`}>
      <div className={itemClassNames.join(' ')}>
        <span className="item__name">{page.name}</span>
      </div>
    </Link>
  );
};

PageItem.propTypes = {
  align: PropTypes.oneOf(['start', 'center', 'end']),
  className: PropTypes.string,
  item: PropTypes.object.isRequired,
};

PageItem.defaultProps = {
  align: undefined,
  className: undefined,
};

export default PageItem;
