var require = function(name) {
  return { 'backbone': Backbone, 'underscore': _ }[name];
};
