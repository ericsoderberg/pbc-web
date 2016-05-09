// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { getGeocode } from '../actions';
import Leaflet from 'leaflet';

export default class Map extends Component {

  constructor (props) {
    super(props);
    this.state = {
      busy: false,
      lat: props.lat,
      lon: props.lon,
      mergedAddress: this._mergeAddresses(props)
    };
  }

  componentDidMount () {
    const mapElement = this.refs.map;
    const options = { touchZoom: false, scrollWheelZoom: false, zoom: 14 };
    const map = Leaflet.map(mapElement, options);
    this.setState({ map: map }, this._load);
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      lat: nextProps.lat,
      lon: nextProps.lon,
      mergedAddress: this._mergeAddresses(nextProps)
    }, this._load);
  }

  _load () {
    if (! this.state.lat || ! this.state.lon) {
      this._getGeocode();
    } else {
      this._setMap();
    }
  }

  _renderPopup () {
    const { address, title } = this.props;
    const { mergedAddress } = this.state;
    return `<div className="map__tip">
        <h5>${title}</h5>
        <a href="maps://?daddr=${encodeURIComponent(mergedAddress)}">${address}</a>
      </div>`;
  }

  _setMap (mapSize) {
    const { map, lat, lon } = this.state;
    console.log('!!! _setMap', lat, lon);
    map.setView([lat, lon], 14);
    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy;OpenStreetMap, &copy;CartoDB'
    }).addTo(map);
    const circle = Leaflet.circleMarker([lat, lon], {
      color: '#FF8D6D',
      opacity: 0.8,
      fillOpacity: 0.8
    }).addTo(map);
    circle.bindPopup(this._renderPopup()).openPopup();
  }

  _parseAddress () {
    const { address } = this.props;
    return address.split(',').map(p => p.trim());
  }

  _mergeAddresses (props) {
    // TODO: refactor this address merging stuff
    const { address, baseAddress } = props;
    let baseParts = this._parseAddress(baseAddress);
    let parts = this._parseAddress(address);
    let merged = [];
    let index = 0;
    while (index < baseParts.length) {
      merged[index] = parts[index] || baseParts[index];
      index += 1;
    }
    return merged.join(', ');
  }

  _getGeocode () {
    const { mergedAddress } = this.state;
    getGeocode(mergedAddress)
    .then(places => {
      const place = places[0];
      this.setState({ lat: place.lat, lon: place.lon }, this._setMap);
    })
    .catch(error => console.log('!!! getGeocode catch', error));
  }

  render () {
    const { full } = this.props;
    let classNames = ['page-map__container'];
    if (full) {
      classNames.push('page-map__container--full');
    }
    let address;
    if (! this.state.busy && ! this.state.lat) {
      address = (
        <div className="map__address">
          {this.props.address}
        </div>
      );
    }
    return (
      <div className={classNames.join(' ')}>
        <div ref="map" id="map" className="page-map">
          {address}
        </div>
      </div>
    );
  }

};

Map.propTypes = {
  address: PropTypes.string.isRequired,
  baseAddress: PropTypes.string,
  full: PropTypes.bool,
  latitude: PropTypes.string,
  longitude: PropTypes.string,
  title: PropTypes.string
};

Map.defaultProps = {
  baseAddress: '3505 Middlefield Road, Palo Alto, CA 94306'
};
