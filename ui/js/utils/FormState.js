"use strict";
import moment from 'moment';

export default class FormState {

  constructor (object, onChange) {
    this.object = object;
    this._onChange = onChange;
  }

  set (propertyName, value) {
    let nextObject = { ...this.object };
    if (typeof propertyName === 'object') {
      nextObject = { ...nextObject, ...propertyName };
    } else {
      nextObject[propertyName] = value;
    }
    this._onChange(nextObject);
  }

  change (propertyName) {
    return (event => {
      // handle DateChange onChange which just sends the value, not an event
      let value = (event.target ? event.target.value : event);
      if (moment.isMoment(value)) {
        value = value.toISOString();
      }
      this.set(propertyName, value);
    });
  }

  toggle (propertyName) {
    return (event => {
      this.set(propertyName, ! this.object[propertyName]);
    });
  }

  toggleIn (propertyName, value) {
    return (event => {
      value = value || (event.target ? event.target.value : event);
      let array = (this.object[propertyName] || []).slice(0);
      const index = array.indexOf(value);
      if (-1 === index) {
        array.push(value);
      } else {
        array.splice(index, 1);
      }
      this.set(propertyName, array);
    });
  }

  _processFiles (files, propertyName) {
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.addEventListener("load", () => {
        const fileData = {
          data: reader.result,
          name: file.name,
          size: file.size,
          type: file.type
        };

        this.set(propertyName, fileData);
      });

      reader.readAsDataURL(file);
    }
  }

  changeFile (propertyName) {
    return (event => {
      const files = event.target.files;
      this._processFiles(files, propertyName);
    });
  }

  dropFile (propertyName) {
    return (event => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      this._processFiles(files, propertyName);
    });
  }

  // array properties

  addTo (propertyName, value = {}) {
    return event => {
      let array = (this.object[propertyName] || []).slice(0);
      if (typeof value === 'function') {
        array.push(value());
      } else {
        array.push(value);
      }
      this.set(propertyName, array);
    };
  }

  changeAt (propertyName, index) {
    return event => {
      // handle Section onChange which just sends the value, not an event
      let value = (event.target ? event.target.value : event);
      let array = (this.object[propertyName] || []).slice(0);
      array[index] = value;
      this.set(propertyName, array);
    };
  }

  swapWith (propertyName, index, nextIndex) {
    return () => {
      let array = (this.object[propertyName] || []).slice(0);
      const value = array[index];
      array[index] = array[nextIndex];
      array[nextIndex] = value;
      this.set(propertyName, array);
    };
  }

  removeAt (propertyName, index) {
    return () => {
      let array = (this.object[propertyName] || []).slice(0);
      array.splice(index, 1);
      this.set(propertyName, array);
    };
  }
}
