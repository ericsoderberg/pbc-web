"use strict";
import React, { Component, PropTypes } from 'react';
import Section from './Section';
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
    this.setState({ playing: false });
  }

  _onResize (event) {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(this._layout, 10);
  }

  _layout () {
    // Remove?
  }

  _onPlay () {
    const audio = this.refs.audio;
    audio.play();
    this.setState({ playing: true,
      start: audio.seekable.start(0), end: audio.seekable.end(0) });
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
    const { file, color, full, plain } = this.props;
    const { playing, volume, start, end, at } = this.state;
    const path = `/api/files/${file._id}/${file.name}`;

    let playControl, positionControl, volumeControl;
    if (playing) {
      playControl = (
        <button className="button audio__control" type="button"
          onClick={this._onPause}>Pause</button>
      );
      positionControl = (
        <div className="audio__position-container">
          <input className="audio__position" type="range" min={start} max={end}
            value={at} onChange={this._onSeek} />
          <label>{friendlyDuration(end - at)}</label>
        </div>
      );
      volumeControl = (
        <div className="audio__volume-container">
          <VolumeIcon />
          <input className="audio__volume" type="range" min={0} max={1}
            step={0.1} value={volume} onChange={this._onVolume} />
        </div>
      );
    } else {
      playControl = (
        <button className="button audio__control" type="button"
          onClick={this._onPlay}>Listen</button>
      );
    }

    return (
      <Section color={color} full={full} plain={plain}>
        <div className="audio">
          {playControl}
          {positionControl}
          {volumeControl}
          <audio ref="audio" preload="metadata">
            <source src={path} type={file.type} />
            No audio with this browser
          </audio>
        </div>
      </Section>
    );
  }
};

Audio.propTypes = {
  full: PropTypes.bool,
  file: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }),
  ...Section.propTypes
};
