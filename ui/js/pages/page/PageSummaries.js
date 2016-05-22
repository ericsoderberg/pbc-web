"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import Section from '../../components/Section';
import Text from '../../components/Text';
import Image from '../../components/Image';

export default class PageSummaries extends Component {

  constructor () {
    super();
    this._onActivate = this._onActivate.bind(this);
    this.state = { active: 0, pages: {} };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this._load(nextProps);
  }

  _load (props) {
    props.pageSummaries.forEach(pageSummary => {
      if (! this.state.pages[pageSummary.id]) {
        getItem('pages', pageSummary.id)
        .then(page => {
          let pages = { ...this.state.pages };
          pages[pageSummary.id] = page;
          this.setState({ pages: pages });
        })
        .catch(error => console.log('!!! PageSummaries catch', error));
      }
    });
  }

  _onActivate (index) {
    this.setState({ active: index });
  }

  _renderTile (pageSummary, index) {
    const page = this.state.pages[pageSummary.id] || {};
    let classNames = ['page-summaries__tile'];
    if (index === this.state.active) {
      classNames.push('page-summaries__tile--active');
    }

    let image;
    if (pageSummary.tile) {
      image = <Image image={pageSummary.tile} plain={true} />;
    }

    return (
      <div key={index} className={classNames.join(' ')}
        onClick={this._onActivate.bind(this, index)}>
        {image}
        <h3 className="page-summaries__tile-name">{page.name}</h3>
      </div>
    );
  }

  _renderActive (pageSummary) {
    let image;
    if (pageSummary.image) {
      image = <Image image={pageSummary.image} plain={true} />;
    }
    return (
      <div className="page-summaries__active">
        <div className="page-summaries__active-summary">
          <Text plain={true} text={pageSummary.text} />
          <Link to={pageSummary.page || `/pages/${pageSummary.id}`}>Learn more</Link>
        </div>
        <div className="page-summaries__active-image">
          {image}
        </div>
      </div>
    );
  }

  render () {
    const { color, full, plain } = this.props;

    const tiles = (this.props.pageSummaries || []).map((pageSummary, index) => {
      return this._renderTile(pageSummary, index);
    });
    const active = this._renderActive(this.props.pageSummaries[this.state.active]);

    return (
      <Section color={color} full={full} plain={plain}>
        <div className="page-summaries">
          <div className="page-summaries__tiles">
            {tiles}
          </div>
          {active}
        </div>
      </Section>
    );
  }
};

PageSummaries.propTypes = {
  pageSummaries: PropTypes.array,
  id: PropTypes.string,
  ...Section.propTypes
};
