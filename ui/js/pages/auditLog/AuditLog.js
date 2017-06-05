import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import { loadAuditLog, unloadAuditLog } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Loading from '../../components/Loading';

const Item = props => (
  <div className="search__item">
    <Link className="search__link" to={props.path}>
      {props.item.name}
    </Link>
  </div>
);

Item.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  path: PropTypes.string.isRequired,
};

Item.defaultProps = {
  children: null,
};

class AuditLog extends Component {

  constructor() {
    super();
    this._onScroll = this._onScroll.bind(this);
    this.state = {};
  }

  componentDidMount() {
    const { dispatch } = this.props;
    document.title = 'Audit Log';
    dispatch(loadAuditLog());
    window.addEventListener('scroll', this._onScroll);
  }

  componentWillReceiveProps() {
    this.setState({ loadingMore: false });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadAuditLog());
    window.removeEventListener('scroll', this._onScroll);
  }

  _onMore() {
    const { dispatch, items } = this.props;
    this.setState({ loadingMore: true }, () =>
      dispatch(loadAuditLog({ skip: items.length })));
  }

  _onScroll() {
    const { mightHaveMore } = this.props;
    const { loadingMore } = this.state;
    if (mightHaveMore && !loadingMore) {
      const more = this._moreRef;
      if (more) {
        const rect = more.getBoundingClientRect();
        if (rect.top <= window.innerHeight) {
          this._onMore();
        }
      }
    }
  }

  render() {
    const { items, mightHaveMore } = this.props;
    const { loadingMore } = this.state;

    let contents;
    if (!items) {
      contents = <Loading />;
    } else {
      const recent = moment().subtract(6, 'days');
      contents = items.map((item) => {
        let path;
        switch (item.type) {
          case 'page':
            path = `/pages/${item._id}`;
            break;
          case 'event':
            path = `/events/${item._id}`;
            break;
          case 'formTemplate':
            path = `/form-templates/${item._id}`;
            break;
          case 'user':
            path = `/users/${item._id}`;
            break;
          case 'library':
            path = `/libraries/${item._id}`;
            break;
          case 'message':
            path = `/messages/${item._id}`;
            break;
          default:
            break;
        }

        const modified = moment(item.modified);
        let timestamp;
        if (modified.isAfter(recent)) {
          timestamp = modified.format('ddd h a');
        } else {
          timestamp = modified.format('M/D h a');
        }

        return (
          <li key={item._id}>
            <Link className="item__container" to={path}>
              <div className="item">
                <span className="item__name">
                  {item.name}
                  <span className="audit-log__type tertiary">{item.type}</span>
                </span>
                <span>
                  {(item.userId || {}).name}
                  <span className="audit-log__timestamp">{timestamp}</span>
                </span>
              </div>
            </Link>
          </li>
        );
      });
    }

    let more;
    if (loadingMore) {
      more = <Loading />;
    } else if (mightHaveMore) {
      more = <div ref={(ref) => { this._moreRef = ref; }} />;
    }

    return (
      <main className="search-page">
        <PageHeader responsive={false} title="Audit Log" />
        <ul className="list">
          {contents}
        </ul>
        {more}
      </main>
    );
  }
}

AuditLog.propTypes = {
  dispatch: PropTypes.func.isRequired,
  items: PropTypes.array,
  mightHaveMore: PropTypes.bool,
};

AuditLog.defaultProps = {
  items: undefined,
  mightHaveMore: undefined,
};

const select = (state) => {
  const auditLog = state.auditLog || {};
  return {
    items: auditLog.items,
    mightHaveMore: auditLog.mightHaveMore,
  };
};

export default connect(select)(AuditLog);
