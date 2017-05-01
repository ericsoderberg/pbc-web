import React, { Component, PropTypes } from 'react';
import Audio from '../../components/Audio';
import RightIcon from '../../icons/Right';

export default class FilesSection extends Component {

  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { className, files } = this.props;
    const { playIndex } = this.state;

    const classes = ['list files-section'];
    if (className) {
      classes.push(className);
    }

    // In case there are multiple audio files, we chain their playing
    // together. Remember what audio file to play next when one finshes.
    const nextPlayIndex = {};
    let previousFile;
    (files || []).forEach((file, index) => {
      if (file.type && file.type.match(/audio/)) {
        if (previousFile) {
          nextPlayIndex[previousFile._id] = index;
        }
        previousFile = file;
      }
    });

    const items = (files || []).filter(file => file.name).map((file, index) => {
      const key = file._id || index;
      const path = `/files/${file._id}/${file.name}`;
      if (file.type && file.type.match(/audio/)) {
        return (
          <div key={key} className="item__container">
            <Audio className="item" file={file}
              full={false} plain={true} autoPlay={index === playIndex}
              onStart={() => this.setState({ playIndex: undefined })}
              onEnd={() => this.setState({
                playIndex: nextPlayIndex[file._id] })} />
          </div>
        );
      }
      return (
        <a key={key} className="item__container files-section__file" href={path}>
          <div className="item">
            <span className="files-section__file-name">
              {file.label || file.name}
              <RightIcon className="anchor__indicator" />
            </span>
          </div>
        </a>
      );
    });

    return (
      <div className={classes.join(' ')}>
        {items}
      </div>
    );
  }
}

FilesSection.propTypes = {
  className: PropTypes.string,
  files: PropTypes.array,
};

FilesSection.defaultProps = {
  className: undefined,
  files: [],
};
