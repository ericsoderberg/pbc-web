"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import Section from '../../components/Section';
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
    props.pages.forEach(pageRef => {
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
    const { color, full, plain, pages } = this.props;

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
      let link;
      if (pageRef.image) {
        link = (
          <Link key={index} className="page-tile" to={path}>
            <Image image={pageRef.image} plain={true} />
            <Button>{page.name}</Button>
          </Link>
        );
      } else {
        link = (
          <Button key={index} circle={true} path={path}>
            {page.name}
          </Button>
        );
      }
      return link;
    });

    return (
      <Section color={color} full={full} plain={plain}>
        <div className="page-summaries">
          {links}
        </div>
      </Section>
    );
  }
};

PageSummaries.propTypes = {
  pages: PropTypes.array,
  ...Section.propTypes
};
