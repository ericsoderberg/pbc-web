
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FilterIcon from '../icons/Filter';

export default class Filter extends Component {

  constructor() {
    super();
    this._onActivate = this._onActivate.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this.state = { active: false };
  }

  _onActivate() {
    this.setState({ active: true }, () => {
      this._selectRef.focus();
    });
  }

  _onBlur() {
    this.setState({ active: false });
  }

  render() {
    const { allLabel, onChange, value, options } = this.props;
    const { active } = this.state;
    const classNames = ['filter'];
    if (active) {
      classNames.push('filter--active');
    }

    const optionElements = (options || []).map(option => (
      <option key={option.value || option} value={option.value}>
        {option.label || option}
      </option>
    ));
    optionElements.unshift(<option key="_all" value="">{allLabel}</option>);

    return (
      <div className={classNames.join(' ')}>
        <select ref={(ref) => { this._selectRef = ref; }}
          className="filter__select"
          value={value}
          onChange={onChange}
          onBlur={this._onBlur}>
          {optionElements}
        </select>
        <button className="filter__control button-icon"
          onClick={this._onActivate}>
          <FilterIcon />
        </button>
      </div>
    );
  }
}

Filter.propTypes = {
  allLabel: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ])).isRequired,
};

Filter.defaultProps = {
  allLabel: 'All',
  value: '',
};
