"use strict";
import React, { Component } from 'react';

const HELP =
`# Heading
## Heading
* list item
*italic*
**bold**
[link label](link url)
> quote
`;

export default class TextHelp extends Component {

  constructor () {
    super();
    this._onToggle = this._onToggle.bind(this);
    this.state = { active: false };
  }

  _onToggle (event) {
    this.setState({ active: ! this.state.active });
  }

  render () {
    const { active } = this.state;
    let classNames = ['text-help'];
    if (active) {
      classNames.push('text-help--active');
    }
    return (
      <div className={classNames.join(' ')}>
        <span onClick={this._onToggle}>syntax</span>
        <pre className='text-help__drop'>{HELP}</pre>
      </div>
    );
  }
};
