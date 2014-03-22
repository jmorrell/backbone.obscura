(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(<%= cjsDependencies %>);
  } else if (typeof define === 'function' && define.amd) {
    define([<%= amdDependencies %>], factory);
  } else {
    root.<%= globalAlias %> = factory(<%= globalDependencies %>);
  }
}(this, function(<%= dependencyExports %>) {
  function _requireDep(name) {
    return {<%= dependencyNameToExportsMapping %>}[name];
  }
