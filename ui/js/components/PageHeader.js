"use strict";
import React, { Component, PropTypes } from 'react';
import { getSite } from '../actions';
import BackIcon from '../icons/Back';
import Search from './Search';

export default class PageHeader extends Component {

  constructor () {
    super();
    this._onHome = this._onHome.bind(this);
    this._onBack = this._onBack.bind(this);
    this.state = {};
  }

  componentDidMount () {
    getSite()
    .then(site => {
      this.setState({ site: site });
    });
  }

  _onHome () {
    this.context.router.push('/');
  }

  _onBack () {
    const { back } = this.props;
    if (typeof back === 'string') {
      this.context.router.push(back);
    } else {
      this.context.router.goBack();
    }
  }

  render () {
    const { title, searchText, onSearch, actions, form, back, homer,
      focusOnSearch } = this.props;
    const { site } = this.state;
    let classes = ["page-header"];
    if (form) {
      classes.push("page-header--form");
    }

    let logo;
    if (this.props.logo && site && site.logo) {
      logo = <img className="page-header__logo logo" src={site.logo.data} />;
    }

    let backControl;
    if (homer) {
      let contents;
      let className;
      if (site && site.logo) {
        contents = <img className="page-header__logo" src={site.logo.data} />;
        className = 'button-icon';
      } else {
        contents = 'Home';
        className = 'button-header';
      }
      backControl = (
        <button className={className} onClick={this._onHome}>
          {contents}
        </button>
      );
    } else if (back) {
      backControl = (
        <button className="button-icon" onClick={this._onBack}>
          <BackIcon />
        </button>
      );
    }

    let search;
    if (onSearch) {
      search = (
        <Search ref="search" responsive={false}
          value={searchText} onChange={onSearch}
          focusOnMount={focusOnSearch} />
      );
    }

    let h1;
    if (title) {
      h1 = <h1 className="page-header__title">{title}</h1>;
    }

    let main;
    if (title || search || ! logo) {
      main = (
        <span className="page-header__main">
          {h1}
          {search}
        </span>
      );
    }

    return (
      <header className={classes.join(' ')}>
        {backControl}
        {logo}
        {main}
        {actions}
      </header>
    );
  }
};

PageHeader.propTypes = {
  actions: PropTypes.node,
  back: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  color: PropTypes.string,
  focusOnSearch: PropTypes.bool,
  form: PropTypes.bool,
  homer: PropTypes.bool,
  logo: PropTypes.bool,
  onSearch: PropTypes.func,
  searchText: PropTypes.string,
  title: PropTypes.string
};

PageHeader.contextTypes = {
  router: PropTypes.any
};
