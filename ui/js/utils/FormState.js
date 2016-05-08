"use strict";

export default class FormState {

  constructor (object, onChange) {
    this.object = object;
    this._onChange = onChange;
  }

  _update (propertyName, value) {
    let nextObject = { ...this.object };
    nextObject[propertyName] = value;
    this._onChange(nextObject);
  }

  change (propertyName) {
    return (event => {
      // handle DateChange onChange which just sends the value, not an event
      const value = (event.target ? event.target.value : event);
      this._update(propertyName, value);
    });
  }

  toggle (propertyName) {
    return (event => {
      this._update(propertyName, ! this.object[propertyName]);
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

        this._update(propertyName, fileData);
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
}
