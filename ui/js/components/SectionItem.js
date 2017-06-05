import React from 'react';
import PropTypes from 'prop-types';
import DownIcon from '../icons/DownArrow';
import UpIcon from '../icons/UpArrow';
import BlankIcon from '../icons/Blank';
import TrashIcon from '../icons/Trash';

const SectionItem = (props) => {
  const { children, formState, index, label, property } = props;
  const array = formState.object[property] || [];

  let raise;
  if (index > 0) {
    raise = (
      <button type="button"
        className="button-icon"
        onClick={formState.swapWith(property, index, index - 1)}>
        <UpIcon />
      </button>
    );
  }
  let lower;
  if (index < (array.length - 1)) {
    lower = (
      <button type="button"
        className="button-icon"
        onClick={formState.swapWith(property, index, index + 1)}>
        <DownIcon />
      </button>
    );
  } else {
    lower = (
      <button type="button" className="button-icon">
        <BlankIcon />
      </button>
    );
  }

  return (
    <div>
      <div className="form-item">
        <h5 className="section-item__header">{`${label} ${index + 1}`}</h5>
        <div className="box--row">
          {raise}
          {lower}
          <button type="button"
            className="button-icon"
            onClick={formState.removeAt(property, index)}>
            <TrashIcon />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};

SectionItem.propTypes = {
  children: PropTypes.any.isRequired,
  formState: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  property: PropTypes.string.isRequired,
};

export default SectionItem;
