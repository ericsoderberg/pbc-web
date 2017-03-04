import React, { Component, PropTypes } from 'react';
import moment from 'moment';

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default class DateSelector extends Component {

  constructor(props) {
    super(props);

    this._onToday = this._onToday.bind(this);
    this._onPrevious = this._onPrevious.bind(this);
    this._onNext = this._onNext.bind(this);

    this.state = this._stateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    const state = this._stateFromProps(nextProps);
    this.setState(state);
  }

  _stateFromProps(props) {
    const { value } = props;
    return { reference: value };
  }

  _day(date) {
    return () => {
      this.props.onChange(date);
    };
  }

  _onToday() {
    const reference = moment().startOf('day');
    this.setState({ reference });
  }

  _onPrevious() {
    const { reference } = this.state;
    const nextReference = moment(reference).subtract(1, 'month');
    this.setState({ reference: nextReference });
  }

  _onNext() {
    const { reference } = this.state;
    const nextReference = moment(reference).add(1, 'month');
    this.setState({ reference: nextReference });
  }

  render() {
    const { value } = this.props;
    const { reference } = this.state;

    const headerCells = WEEK_DAYS.map(day => (
      <th key={day}>{day}</th>
    ));

    const start = moment(reference).startOf('month').startOf('week');
    const end = moment(reference).endOf('month').endOf('week');
    const date = moment(start);
    const rows = [];

    while (date.valueOf() <= end.valueOf()) {
      const days = [];
      for (let i = 0; i < 7; i += 1) {
        const classes = ['date-selector__day'];
        if (date.isSame(value, 'day')) {
          classes.push('date-selector__day--active');
        }
        if (!date.isSame(value, 'month')) {
          classes.push('date-selector__day--other-month');
        }
        days.push(
          <td key={date.valueOf()}>
            <div className={classes.join(' ')}
              onClick={this._day(moment(date))}>
              {date.date()}
            </div>
          </td>,
        );
        date.add(1, 'day');
      }
      rows.push(<tr key={date.valueOf()}>{days}</tr>);
    }

    let today;
    // if (! reference.isSame(moment(), 'month')) {
    //   today = (
    //     <button key="today" type="button"
    //       className="button button--secondary date-selector__today"
    //       onClick={this._onToday}>Today</button>
    //   );
    // }

    return (
      <div className="date-selector">
        <header className="date-selector__header">
          <button type="button"
            className="button button-plain date-selector__previous"
            onClick={this._onPrevious}>&lt;</button>
          <span className="date-selector__title">
            {reference.format('MMMM YYYY')}
          </span>
          <button type="button"
            className="button button-plain date-selector__next"
            onClick={this._onNext}>&gt;</button>
        </header>
        <div className="date-selector__grid">
          <table>
            <thead>
              <tr>{headerCells}</tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>
        {today}
      </div>
    );
  }

}

DateSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired,
};
