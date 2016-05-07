"use strict";

export default class FormEvents {

  constructor (object, onChange) {
    this._object = object;
    this._onChange = onChange;
  }

  set (object) {
    this._object = object;
  }

  change (propertyName) {
    return (event => {
      let object = { ...this._object };
      object[propertyName] = event.target.value;
      this._onChange(object);
    });
  }

  toggle (propertyName) {
    return (event => {
      let object = { ...this._object };
      object[propertyName] = ! object[propertyName];
      this._onChange(object);
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

        let nextObject = { ...this._object };
        nextObject[propertyName] = fileData;
        this._onChange(nextObject);
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
