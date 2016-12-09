"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import Section from '../../components/Section';

export default class FilesSummary extends Component {

  constructor () {
    super();
    this.state = { files: [] };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this._load(nextProps);
  }

  _load (props) {
    // When editing, we only have ids, get the rest
    (props.files || []).forEach(file => {
      if (typeof file.id === 'string' && ! file.name &&
        ! this.state.files[file.id]) {
        getItem('files', file.id)
        .then(file => {
          let files = { ...this.state.files };
          files[file.id] = file;
          this.setState({ files });
        })
        .catch(error => console.log('!!! FilesSummary catch', error));
      }
    });
  }

  render () {
    const { color, full, files, plain } = this.props;

    const links = (files || []).map((file, index) => {
      if (! file._id) {
        // populated via _load
        file = this.state.files[file.id] || {};
      }

      return (
        <a key={file._id} href={`/file/${file._id}/${file.name}`}
          className="file-summary">
          {file.name}
        </a>
      );
    });

    return (
      <Section color={color} full={full} plain={plain}>
        <div className="file-summaries">
          {links}
        </div>
      </Section>
    );
  }
};

FilesSummary.propTypes = {
  files: PropTypes.array,
  ...Section.propTypes
};
