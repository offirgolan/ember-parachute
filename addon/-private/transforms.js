import Ember from 'ember';

const {
  isPresent,
  makeArray
} = Ember;

export default {
  String(value) {
    return `${value}`;
  },

  Boolean(value) {
    return Boolean(value);
  },

  Number(value) {
    return Number(value);
  },

  Array(value) {
    return makeArray(value).join(',');
  },

  Object(value) {
    return isPresent(value) ? value : {};
  }
};
