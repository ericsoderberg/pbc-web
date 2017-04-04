import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { getAuditLog } from '../../actions';
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

export default class AuditLog extends Component {

  constructor() {
    super();
    this._get = this._get.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this.state = { loading: true };
  }

  componentDidMount() {
    document.title = 'Audit Log';
    this._get();
    window.addEventListener('scroll', this._onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this._onScroll);
  }

  _get() {
    getAuditLog()
    .then(items => this.setState({
      items, loading: false, mightHaveMore: (items.length === 20),
    }))
    .catch(error => console.error('!!! AuditLog catch', error));
  }

  _onMore() {
    this.setState({ loadingMore: true }, () => {
      const skip = this.state.items.length;
      getAuditLog({ skip })
      .then((response) => {
        const items = this.state.items.concat(response);
        this.setState({
          items,
          loadingMore: false,
          mightHaveMore: (response.length === 20),
        });
      })
      .catch(error => console.error('!!! AuditLog more catch', error));
    });
  }

  _onScroll() {
    const { mightHaveMore, loadingMore } = this.state;
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
    const { items, loading, loadingMore, mightHaveMore } = this.state;

    let contents;
    if (loading) {
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
