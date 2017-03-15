
import React, { Component, PropTypes } from 'react';
import { getItem } from '../../actions';
import Audio from '../../components/Audio';

export default class FilesSection extends Component {

  constructor() {
    super();
    this.state = { files: [] };
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._load(nextProps);
  }

  _load(props) {
    // When editing, we only have ids, get the rest
    (props.files || []).forEach((file) => {
      if (typeof file.id === 'string' && !file.name &&
        !this.state.files[file.id]) {
        getItem('files', file.id)
        .then((fileResponse) => {
          const files = { ...this.state.files };
          files[file.id] = fileResponse;
          this.setState({ files });
        })
        .catch(error => console.error('!!! FilesSummary catch', error));
      }
    });
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

    const items = (files || []).map((file, index) => {
      if (!file._id) {
        // populated via _load
        file = this.state.files[file.id] || {};
      }
      const key = file._id || index;
      const path = `/file/${file._id}/${file.name}`;
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
          <div className="item"><span>{file.label || file.name}</span></div>
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
