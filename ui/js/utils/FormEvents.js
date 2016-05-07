"use strict";

export default class FormEvents {

  constructor (object, onChange) {
    this._object = object;
    this._onChange = onChange;
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

  changeFile (propertyName) {
    return (event => {
      const files = event.target.files;
      let fileData;
      if (files && files[0]) {
        const file = files[0];
        const reader = new FileReader();

        reader.addEventListener("load", () => {
          fileData = {
            data: reader.result,
            name: file.name,
            size: file.size,
            type: file.type
          };

          let object = { ...this._object };
          object[propertyName] = fileData;
          this._onChange(object);
        });

        reader.readAsDataURL(file);
      }
    });
  }
}
