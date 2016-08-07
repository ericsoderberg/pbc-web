"use strict";
import React, { Component } from 'react';
// import { Link } from 'react-router';
import { getItems, getSite } from '../../actions';
import PageHeader from '../../components/PageHeader';

// const Item = (props) => {
//   const { className, item: page } = props;
//   let classNames = ['item__container', className];
//   return (
//     <Link className={classNames.join(' ')}
//       to={page.path || `/pages/${page._id}`}>
//       <div className="item">
//         <span className="item__name">{page.name}</span>
//       </div>
//     </Link>
//   );
// };

export default class PageGraph extends Component {

  constructor () {
    super();
    this.state = { pages: [] };
  }

  componentDidMount () {
    getSite()
    // allow for no site existing yet
    .then(site => this.setState({ site: site }))
    .catch(error => console.log('!!! PageGraph site catch', error));

    getItems('pages')
    .then(response => this.setState({ pages: response }))
    .catch(error => console.log('!!! PageGraph pages catch', error));
  }

  render () {
    const { pages, site } = this.state;
    let unprocessedPages = pages.slice(0);
    let rows = [];
    let processedPages = {};

    /// TBD: Need to scan page looking for linked pages and build from top
    // down

    unprocessedPages = unprocessedPages.filter(page => {
      if (page._id === site.homePageId) {
        rows.push([page]);
        processedPages[page._id] = page;
        return false;
      } else {
        return true;
      }
    });

    while (unprocessedPages.length > 0) {
      let row = [];
      unprocessedPages = unprocessedPages.filter(page => {
        if (processedPages[page._id]) {
          row.push(page);
          processedPages[page._id] = page;
          return false;
        } else {
          return true;
        }
      });
      if (row.length === 0) {
        // Nothing connected to the home page anymore, just lump the rest.
        row = unprocessedPages;
        unprocessedPages = [];
      }
      rows.push(row);
    }

    const elements = rows.map((row, index) => {
      const pages = row.map(page => {
        return (<span key={page._id}>{page.name}</span>);
      });
      return (
        <div key={index}>
          {pages}
        </div>
      );
    });

    return (
      <main>
        <PageHeader title="Page Graph" />
        {elements}
      </main>
    );
  }
};
