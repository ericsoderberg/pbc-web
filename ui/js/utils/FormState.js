import moment from 'moment-timezone';

export default class FormState {

  constructor(object, onChange) {
    this.object = object;
    this._onChange = onChange;
  }

  set(propertyName, value) {
    let nextObject = { ...this.object };
    if (typeof propertyName === 'object') {
      nextObject = { ...nextObject, ...propertyName };
    } else {
      nextObject[propertyName] = value;
    }
    this._onChange(nextObject);
  }

  change(propertyName) {
    return (event) => {
      // handle DateChange onChange which just sends the value, not an event
      let value = (event.target ? event.target.value : event);
      if (moment.isMoment(value)) {
        value = value.toISOString();
      }
      this.set(propertyName, value);
    };
  }

  toggle(propertyName) {
    return () => {
      this.set(propertyName, !this.object[propertyName]);
    };
  }

  toggleIn(propertyName, valueArg) {
    return (event) => {
      const value = valueArg || (event.target ? event.target.value : event);
      const array = (this.object[propertyName] || []).slice(0);
      const index = array.indexOf(value);
      if (index === -1) {
        array.push(value);
      } else {
        array.splice(index, 1);
      }
      this.set(propertyName, array);
    };
  }

  _processFiles(files, propertyName) {
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        const fileData = {
          data: reader.result,
          name: file.name,
          size: file.size,
          type: file.type,
        };

        this.set(propertyName, fileData);
      });

      reader.readAsDataURL(file);
    }
  }

  changeImageFile(propertyName) {
    return (event) => {
      const files = event.target.files;
      this._processFiles(files, propertyName);
    };
  }

  dropImageFile(propertyName) {
    return (event) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      this._processFiles(files, propertyName);
    };
  }

  // array properties

  addTo(propertyName, value = {}) {
    return () => {
      const array = (this.object[propertyName] || []).slice(0);
      if (typeof value === 'function') {
        array.push(value());
      } else {
        array.push(value);
      }
      this.set(propertyName, array);
    };
  }

  changeAt(propertyName, index) {
    return (event) => {
      // handle Section onChange which just sends the value, not an event
      const value = (event.target ? event.target.value : event);
      const array = (this.object[propertyName] || []).slice(0);
      array[index] = value;
      this.set(propertyName, array);
    };
  }

  swapWith(propertyName, index, nextIndex) {
    return () => {
      const array = (this.object[propertyName] || []).slice(0);
      const value = array[index];
      array[index] = array[nextIndex];
      array[nextIndex] = value;
      this.set(propertyName, array);
    };
  }

  removeAt(propertyName, index) {
    return () => {
      const array = (this.object[propertyName] || []).slice(0);
      array.splice(index, 1);
      this.set(propertyName, array);
    };
  }
}
