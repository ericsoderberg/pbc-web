"use strict";
import React, { Component, PropTypes } from 'react';
import DownIcon from '../../icons/Down';
import UpIcon from '../../icons/Up';
import TrashIcon from '../../icons/Trash';

export default class SectionItem extends Component {
  render () {
    const { children, formState, index, label, property } = this.props;
    const array = formState.object[property] || [];

    let raise;
    if (index > 0) {
      raise = (
        <button type="button" className="button-icon"
          onClick={formState.swapWith(property, index, index-1)}>
          <UpIcon />
        </button>
      );
    };
    let lower;
    if (index < (array.length - 1)) {
      lower = (
        <button type="button" className="button-icon"
          onClick={formState.swapWith(property, index, index+1)}>
          <DownIcon />
        </button>
      );
    }

    return (
      <div>
        <div className="form-item">
          <h5>{`${label} ${index + 1}`}</h5>
          <div className="box--row">
            {raise}
            {lower}
            <button type="button" className="button-icon"
              onClick={formState.removeAt(property, index)}>
              <TrashIcon />
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }
}

SectionItem.defaultProps = {
  formState: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  property: PropTypes.string.isRequired
};
