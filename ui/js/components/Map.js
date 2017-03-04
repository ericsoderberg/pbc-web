// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Leaflet from 'leaflet';
import { getGeocode } from '../actions';

const TILES_URL = 'https://api.mapbox.com/styles/v1/ericsoderberg/' +
'ciy3410qp006p2smnq39o2zk4/tiles/256/{z}/{x}/{y}?access_token=' +
'pk.eyJ1IjoiZXJpY3NvZGVyYmVyZyIsImEiOiJjaXkzMnp4eDkwMDVvMnFxamxiMGZ1d3hwIn0.' +
'a2hwxKcOlZ86rUekW_YuRw';

export default class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      busy: false,
      lat: props.latitude,
      lon: props.longitude,
      mergedAddress: this._mergeAddresses(props),
    };
  }

  componentDidMount() {
    const mapElement = this._mapRef;
    const options = {
      touchZoom: false,
      scrollWheelZoom: false,
      dragging: false,
      zoom: 11,
      zoomControl: false,
    };
    const map = Leaflet.map(mapElement, options);
    this.setState({ map }, this._load);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      lat: nextProps.latitude,
      lon: nextProps.longitude,
      mergedAddress: this._mergeAddresses(nextProps),
    }, this._load);
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  _load() {
    if (!this.state.lat || !this.state.lon) {
      this._getGeocode();
    } else {
      this._setMap();
    }
  }

  // _renderPopup () {
  //   const { address, title } = this.props;
  //   const { mergedAddress } = this.state;
  //   const header = title ? `<h5>${title}</h5>` : '';
  //   return `<div className="map__tip">
  //       ${header}
  //       <a href="maps://?daddr=${encodeURIComponent(mergedAddress)}">${address}</a>
  //     </div>`;
  // }

  _setMap() {
    const { map, lat, lon } = this.state;
    map.setView([lat, lon]);
    Leaflet.tileLayer(TILES_URL, {
      attribution: '© Mapbox © OpenStreetMap',
    }).addTo(map);
    // const circle =
    Leaflet.circleMarker([lat, lon], {
      radius: 8,
      stroke: true,
      weight: 6,
      color: '#E3A235',
      fill: false,
      // opacity: 0.8,
      // fillOpacity: 0.8
    }).addTo(map);
    // circle.bindPopup(this._renderPopup()).openPopup();
  }

  _parseAddress(address) {
    return address.split(',').map(p => p.trim());
  }

  _mergeAddresses(props) {
    // TODO: refactor this address merging stuff
    const { address, baseAddress } = props;
    const baseParts = this._parseAddress(baseAddress);
    const parts = this._parseAddress(address);
    const merged = [];
    let index = 0;
    while (index < baseParts.length) {
      merged[index] = parts[index] || baseParts[index];
      index += 1;
    }
    return merged.join(', ');
  }

  _getGeocode() {
    const { mergedAddress } = this.state;
    getGeocode(mergedAddress)
    .then(places => (this._unmounted ? Promise.reject('unmounted') : places))
    .then((places) => {
      const place = places[0];
      this.setState({ lat: place.lat, lon: place.lon }, this._setMap);
    })
    .catch(error => console.error('!!! getGeocode catch', error));
  }

  render() {
    const { className } = this.props;
    const { address, busy, lat, mergedAddress } = this.state;
    const classNames = ['map'];
    if (className) {
      classNames.push(className);
    }
    let addressElement;
    if (!busy && !lat) {
      addressElement = <div className="map__address">{address}</div>;
    }
    return (
      <div className={classNames.join(' ')}>
        <a className="map__link"
          href={`maps://?daddr=${encodeURIComponent(mergedAddress)}`} />
        <div ref={(ref) => { this._mapRef = ref; }} id="map"
          className="map__map">
          {addressElement}
        </div>
      </div>

    );
  }
}

Map.propTypes = {
  address: PropTypes.string.isRequired,
  baseAddress: PropTypes.string,
  className: PropTypes.string,
  latitude: PropTypes.string,
  longitude: PropTypes.string,
  // title: PropTypes.string,
};

Map.defaultProps = {
  // TODO: genericize
  baseAddress: '3505 Middlefield Road, Palo Alto, CA 94306',
  className: undefined,
  latitude: undefined,
  longitude: undefined,
  // title: undefined,
};
