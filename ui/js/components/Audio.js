"use strict";
import React, { Component, PropTypes } from 'react';
import Section from './Section';
import Button from './Button';
import PlayIcon from '../icons/Play';
import PauseIcon from '../icons/Pause';
import VolumeIcon from '../icons/Volume';

function pad(num, size) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

function friendlyDuration (duration) {
  let remaining = duration;
  let result = '';
  if (remaining > 3600) {
    const hours = Math.floor(remaining / 3600);
    result += `${hours}:`;
    remaining -= hours * 3600;
  }
  if (remaining > 60) {
    const minutes = Math.floor(remaining / 60);
    result += `${pad(minutes, 2)}:`;
    remaining -= minutes * 60;
  }
  if (remaining > 0) {
    const seconds = Math.floor(remaining);
    result += `${pad(seconds, 2)}`;
  }
  return result;
}

export default class Audio extends Component {

  constructor () {
    super();
    this._onTimeUpdate = this._onTimeUpdate.bind(this);
    this._onEnded = this._onEnded.bind(this);
    this._onResize = this._onResize.bind(this);
    this._layout = this._layout.bind(this);
    this._onPlay = this._onPlay.bind(this);
    this._onPause = this._onPause.bind(this);
    this._onSeek = this._onSeek.bind(this);
    this._onVolume = this._onVolume.bind(this);
    this.state = { playing: false, volume: 0.7, start: 0, end: 0, at: 0 };
  }

  componentDidMount () {
    const audio = this.refs.audio;
    audio.volume = this.state.volume;
    audio.addEventListener('timeupdate', this._onTimeUpdate);
    audio.addEventListener('ended', this._onEnded);
    window.addEventListener('resize', this._onResize);
    this._layout();
  }

  componentDidUpdate () {
    const { autoPlay } = this.props;
    const { playing } = this.state;
    if (autoPlay && ! playing) {
      this._onPlay();
    }
  }

  componentWillUnmount () {
    const audio = this.refs.audio;
    audio.removeEventListener('timeupdate', this._onTimeUpdate);
    audio.removeEventListener('ended', this._onEnded);
    window.removeEventListener('resize', this._onResize);
  }

  _onTimeUpdate (event) {
    const audio = this.refs.audio;
    this.setState({ at: audio.currentTime });
  }

  _onEnded (event) {
    const { onEnd } = this.props;
    this.setState({ playing: false, at: 0 });
    if (onEnd) {
      onEnd();
    }
  }

  _onResize (event) {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(this._layout, 10);
  }

  _layout () {
    // Remove?
  }

  _onPlay () {
    const { onStart } = this.props;
    const audio = this.refs.audio;
    audio.play();
    this.setState({ playing: true,
      start: audio.seekable.start(0), end: audio.seekable.end(0) });
    if (onStart) {
      onStart();
    }
  }

  _onPause () {
    const audio = this.refs.audio;
    audio.pause();
    this.setState({ playing: false });
  }

  _onSeek (event) {
    const audio = this.refs.audio;
    const value = event.target.value;
    audio.currentTime = value;
    this.setState({ at: value });
  }

  _onVolume (event) {
    const audio = this.refs.audio;
    const value = event.target.value;
    audio.volume = value;
    this.setState({ volume: value });
  }

  render () {
    const { file, className, color, full, plain } = this.props;
    const { playing, volume, start, end, at } = this.state;
    const path = `/api/files/${file._id}/${file.name}`;

    let classes = ['audio'];
    if (plain) {
      classes.push('audio--plain');
    }
    if (className) {
      classes.push(className);
    }

    let label;
    if (file.label) {
      label = <span className="audio__label">{file.label}</span>;
    }

    let playControl;
    if (playing) {
      playControl = (
        <Button icon={<PauseIcon />} onClick={this._onPause} />
      );
    } else {
      playControl = (
        <Button icon={<PlayIcon />} onClick={this._onPlay} />
      );
    }

    let positionControl, volumeControl;
    if (playing || at) {
      positionControl = (
        <div className="audio__position-container">
          <input className="audio__position" type="range" min={start} max={end}
            value={at} onChange={this._onSeek} />
          <span className="audio__duration">{friendlyDuration(end - at)}</span>
        </div>
      );
      volumeControl = (
        <div className="audio__volume-container">
          <VolumeIcon />
          <input className="audio__volume" type="range" min={0} max={1}
            step={0.1} value={volume} onChange={this._onVolume} />
        </div>
      );
    }

    return (
      <Section color={color} full={full} plain={plain}>
        <div className={classes.join(' ')}>
          <audio ref="audio" preload="metadata">
            <source src={path} type={file.type} />
            No audio with this browser
          </audio>
          <span className="audio__control">
            {label}
            {playControl}
          </span>
          {positionControl}
          {volumeControl}
        </div>
      </Section>
    );
  }
};

Audio.propTypes = {
  autoPlay: PropTypes.bool,
  full: PropTypes.bool,
  file: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }),
  onEnd: PropTypes.func,
  onStart: PropTypes.func,
  ...Section.propTypes
};
