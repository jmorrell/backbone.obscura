(function (root, factory) {
  if (typeof exports === <%= quote %>object<%= quote %>) {
    module.exports = factory(<%= cjsDependencies %>);
  }
  else if (typeof define === <%= quote %>function<%= quote %> && define.amd) {
    define([<%= amdDependencies %>], factory);
  }
  else {
    root.<%= globalAlias %> = factory(<%= globalDependencies %>);
  }
}(this, function(<%= dependencyExports %>) {
  function <%= _requireDep %>(name) {
    return {<%= dependencyNameToExportsMapping %>}[name];
  }

  var <%= _bundleExports %> =
