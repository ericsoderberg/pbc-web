
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getPageMap } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Loading from '../../components/Loading';
import Button from '../../components/Button';

export default class PageMap extends Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this._get(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.setState({ rows: undefined }, () => this._get(nextProps));
    }
  }

  _get(props) {
    getPageMap(props.match.params.id)
    .then((map) => {
      const rows = [];
      this._relate(map, 'parents', rows, 0);
      rows.reverse();
      rows.push([map]);
      this._relate(map, 'children', rows, rows.length);
      this.setState({ rows });
    })
    .catch(error => console.error('!!! PageMap catch', error));
  }

  _relate(page, relationship, rows, index) {
    (page[relationship] || []).forEach((relation) => {
      if (!rows[index]) {
        rows[index] = [];
      }
      rows[index].push(relation);
      this._relate(relation, relationship, rows, index + 1);
    });
  }

  _renderMap() {
    const { router } = this.context;
    const rows = this.state.rows.map((row, index) => {
      const pages = row.map((page) => {
        const path = page.path || `/pages/${page._id}`;
        if (router.route.location.pathname === `${path}/map`) {
          return (
            <Button key={page._id}
              className="page-map__page"
              right={true}
              path={path}
              replaceHistory={true}>
              {page.name}
            </Button>
          );
        }
        return (
          <Button key={page._id}
            className="page-map__page"
            secondary={true}
            path={`${path}/map`}
            replaceHistory={true}>
            {page.name}
          </Button>
        );
      });
      return (
        <div key={index} className="page-map__row">
          {pages}
        </div>
      );
    });
    return (
      <div className="page-map">
        {rows}
      </div>
    );
  }

  render() {
    const { rows } = this.state;

    let contents;
    if (rows) {
      contents = this._renderMap();
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <PageHeader title="Page Map" back={true} />
        {contents}
      </main>
    );
  }
}

PageMap.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

PageMap.contextTypes = {
  router: PropTypes.any,
};
