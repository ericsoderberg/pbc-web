"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import Section from '../../components/Section';
import Image from '../../components/Image';

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
      let classNames;
      let contents;
      if (pageRef.image) {
        classNames = ['page-tile'];
        contents = [
          <Image key="image" image={pageRef.image} plain={true} />,
          <label key="name" className="page-tile__name">{page.name}</label>
        ];
      } else {
        classNames = ['button-circle'];
        contents = <span className="button__label">{page.name}</span>;
      }
      return (
        <Link key={pageRef.id} className={classNames.join(' ')}
          to={page.path || `/pages/${page._id}`}>
          {contents}
        </Link>
      );
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
