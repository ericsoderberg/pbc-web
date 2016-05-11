"use strict";
import React, { Component } from 'react';
import { deleteFile } from '../../actions';
import List from '../../components/List';
import ConfirmRemove from '../../components/ConfirmRemove';

class Item extends Component {

  _onRemove (id) {
    deleteFile(id);
  }

  render () {
    const { className, item: file } = this.props;
    let classNames = ['item__container', className];
    console.log('!!! Files', file);
    return (
      <div className={classNames.join(' ')}>
        <div className="item">
          <span>{file.name || file._id}</span>
          <ConfirmRemove onConfirm={this._onRemove.bind(this, file._id)} />
        </div>
      </div>
    );
  }
};

export default class Files extends List {};

Files.defaultProps = {
  ...List.defaultProps,
  category: 'files',
  Item: Item,
  path: '/files',
  title: 'Files'
};
