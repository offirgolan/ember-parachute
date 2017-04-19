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

  Array(value = []) {
    return value.join(',');
  },

  Object(value = {}) {
    return value;
  }
};
