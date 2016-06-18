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
    this.state = {pages: {} };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this._load(nextProps);
  }

  _load (props) {
    props.pages.forEach(pageRef => {
      if (! this.state.pages[pageRef.id]) {
        getItem('pages', pageRef.id, { select: 'name' })
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

    const links = (pages || []).map(pageRef => {
      const page = this.state.pages[pageRef.id] || {};
      let link;
      if (pageRef.image) {
        link = (
          <Link key={pageRef.id} className="page-tile"
            to={page.path || `/pages/${page._id}`}>
            <Image image={pageRef.image} plain={true} />
            <Button right={true}>{page.name}</Button>
          </Link>
        );
      } else {
        link = (
          <Button key={pageRef.id} circle={true}
            path={page.path || `/pages/${page._id}`}>
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
  id: PropTypes.string,
  ...Section.propTypes
};
