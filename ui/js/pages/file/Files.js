
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { deleteFile } from '../../actions';
import List from '../../components/List';
import ConfirmRemove from '../../components/ConfirmRemove';

class Item extends Component {

  constructor() {
    super();
    this._onRemove = this._onRemove.bind(this);
  }

  _onRemove() {
    const { item: file } = this.props;
    deleteFile(file._id);
  }

  render() {
    const { className, item: file } = this.props;
    const classNames = ['item__container', className];
    // console.log('!!! Files', file);
    return (
      <div className={classNames.join(' ')}>
        <div className="item">
          <span className="item__name">{file.name || file._id}</span>
          <ConfirmRemove onConfirm={this._onRemove} />
        </div>
      </div>
    );
  }
}

Item.propTypes = {
  className: PropTypes.string,
  item: PropTypes.object.isRequired,
};

Item.defaultProps = {
  className: undefined,
};

export default class Files extends List {}

Files.defaultProps = {
  ...List.defaultProps,
  category: 'files',
  Item,
  path: '/files',
  title: 'Files',
};
