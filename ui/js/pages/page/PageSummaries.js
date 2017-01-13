"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import Image from '../../components/Image';
import Button from '../../components/Button';

export default class PageSummaries extends Component {

  constructor () {
    super();
    this.state = { pages: {} };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this._load(nextProps);
  }

  _load (props) {
    // When editing, we have id's but not names, get the names we need
    (props.pages || []).forEach(pageRef => {
      if (typeof pageRef.id === 'string' &&
        ! this.state.pages[pageRef.id]) {
        getItem('pages', pageRef.id, { select: 'name path' })
        .then(page => {
          let pages = { ...this.state.pages };
          pages[pageRef.id] = page;
          this.setState({ pages: pages });
        })
        .catch(error => console.log('!!! PageSummaries catch', error));
      }
    });
  }

  render () {
    const { className, pages } = this.props;

    let classes = ['page-summaries'];
    if (className) {
      classes.push(className);
    }

    const links = (pages || []).map((pageRef, index) => {
      let page;
      if (typeof pageRef.id === 'object') {
       // populated on server
        page = pageRef.id;
      } else {
        // populated via _load
        page = this.state.pages[pageRef.id] || {};
      }
      let path = page.path ? `/${page.path}` : `/pages/${page._id}`;
      const style = { transitionDelay: `${100 + (100 * index)}ms` };
      let link;
      if (pageRef.image) {
        link = (
          <Link key={index} className="page-tile page-summary" to={path}
            style={style}>
            <Image image={pageRef.image} plain={true} />
            <Button>{page.name}</Button>
          </Link>
        );
      } else {
        link = (
          <Button key={index} className="page-summary"
            circle={true} path={path} style={style}>
            {page.name}
          </Button>
        );
      }
      return link;
    });

    return (
      <div className={classes.join(' ')}>
        {links}
      </div>
    );
  }
};

PageSummaries.propTypes = {
  pages: PropTypes.array
};
