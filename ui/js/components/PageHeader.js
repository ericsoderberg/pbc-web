"use strict";
import React, { Component, PropTypes } from 'react';
import { getSite } from '../actions';
import BackIcon from '../icons/Back';

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
    this.context.router.goBack();
  }

  render () {
    const { title, searchText, onSearch, actions, form, back, homer } = this.props;
    const { site } = this.state;
    let classes = ["page-header"];
    if (form) {
      classes.push("page-header--form");
    }

    let backControl;
    if (homer) {
      let classNames = ['button--header'];
      let contents;
      if (site && site.logo) {
        contents = <img className="page-header__logo" src={site.logo.data} />;
        classNames.push('button--icon');
      } else {
        contents = 'Home';
      }
      backControl = (
        <button className={classNames.join(' ')} onClick={this._onHome}>
          {contents}
        </button>
      );
    } else if (back) {
      backControl = (
        <button className="button--header button--icon" onClick={this._onBack}>
          <BackIcon />
        </button>
      );
    }

    let search;
    if (onSearch) {
      search = (
        <input className="page-header__search"
          placeholder="Search"
          value={searchText} onChange={onSearch} />
      );
    }

    return (
      <header className={classes.join(' ')}>
        {backControl}
        <span className="page-header__main">
          <h1 className="page-header__title">{title}</h1>
          {search}
        </span>
        {actions}
      </header>
    );
  }
};

PageHeader.propTypes = {
  actions: PropTypes.node,
  back: PropTypes.bool,
  color: PropTypes.string,
  form: PropTypes.bool,
  homer: PropTypes.bool,
  onSearch: PropTypes.func,
  searchText: PropTypes.string,
  title: PropTypes.string.isRequired
};

PageHeader.contextTypes = {
  router: PropTypes.any
};
