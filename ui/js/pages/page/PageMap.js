"use strict";
import React, { Component, PropTypes } from 'react';
import { getPageMap } from '../../actions';
import PageHeader from '../../components/PageHeader';
import Loading from '../../components/Loading';
import Button from '../../components/Button';

export default class PageMap extends Component {

  constructor () {
    super();
    this.state = {};
  }

  componentDidMount () {
    this._get(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.params.id !== nextProps.params.id) {
      this.setState({ rows: undefined }, () => this._get(nextProps));
    }
  }

  _get (props) {
    getPageMap(props.params.id)
    .then(map => {
      let rows = [];
      this._relate(map, 'parents', rows, 0);
      rows.reverse();
      rows.push([map]);
      this._relate(map, 'children', rows, rows.length);
      this.setState({ rows: rows });
    })
    .catch(error => console.log('!!! PageMap catch', error));
  }

  _relate (page, relationship, rows, index) {
    (page[relationship] || []).forEach(relation => {
      if (! rows[index]) {
        rows[index] = [];
      }
      rows[index].push(relation);
      this._relate(relation, relationship, rows, index+1);
    });
  }

  _renderMap () {
    const rows = this.state.rows.map((row, index) => {
      const pages = row.map(page => {
        const path = page.path || `/pages/${page._id}`;
        if (this.context.router.isActive(`${path}/map`)) {
          return (
            <Button key={page._id} className="page-map__page"
              right={true} path={path} replaceHistory={true}>
              {page.name}
            </Button>
          );
        } else {
          return (
            <Button key={page._id} className="page-map__page"
              secondary={true} path={`${path}/map`}
              replaceHistory={true}>
              {page.name}
            </Button>
          );
        }
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

  render () {
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
};

PageMap.contextTypes = {
  router: PropTypes.any
};
