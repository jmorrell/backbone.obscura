
var _ = require('underscore');
var Backbone = require('backbone');

var FilteredCollection = require('backbone-filtered-collection');
var SortedCollection = require('backbone-sorted-collection');
var PaginatedCollection = require('backbone-paginated-collection');
var proxyCollection = require('backbone-collection-proxy');
var proxyEvents = require('./src/proxy-events.js');

function Obscura(superset, options) {
  this._superset = superset;

  this._filtered = new FilteredCollection(superset, options);
  this._sorted = new SortedCollection(this._filtered, options);
  this._paginated = new PaginatedCollection(this._sorted, options);

  proxyCollection(this._paginated, this);
  proxyEvents.call(this, this._filtered, filteredEvents);
  proxyEvents.call(this, this._sorted, sortedEvents);
  proxyEvents.call(this, this._paginated, paginatedEvents);
}

var methods = {

  superset: function() {
    return this._superset;
  },

  removeTransforms: function() {
    this._filtered.resetFilters();
    this._sorted.removeSort();
    this._paginated.removePagination();
    return this;
  },

  destroy: function() {
    this.stopListening();
    this._filtered.destroy();
    this._sorted.destroy();
    this._paginated.destroy();
    this.length = 0;

    this.trigger('obscura:destroy');
  }

};

// Methods on `this._filtered` we will expose to the outside world
var filteredMethods = [
  'filterBy', 'removeFilter', 'resetFilters', 'refilter', 'hasFilter',
  'getFilters'
];

// Events fired from `this._filtered` that we will forward
var filteredEvents = [
  'filtered:add', 'filtered:remove', 'filtered:reset'
];

// Methods on `this._sorted` we will expose to the outside world
var sortedMethods = [ 'setSort', 'reverseSort', 'removeSort' ];

// Events fired from `this._sorted` that we will forward
var sortedEvents = [
  'sorted:add', 'sorted:remove'
];

// Methods on `this._paginated` we will expose to the outside world
var paginatedMethods = [
  'setPerPage', 'setPage', 'getPerPage', 'getNumPages', 'getPage',
  'hasNextPage', 'hasPrevPage', 'nextPage', 'prevPage', 'movePage',
  'removePagination', 'firstPage', 'lastPage'
];

// Events fired from `this._paginated` that we will forward
var paginatedEvents = [
  'paginated:change:perPage', 'paginated:change:page', 'paginated:change:numPages'
];

// Extend obscura with each of the above methods, passing the call to the underlying
// collection.
//
// The return value is checked because some of the methods return `this` to allow
// chaining, and returning the internal collection would break the abstraction. In
// the cases where it would return the internal collection, we can return a reference
// to the Obscura proxy, which gives it the expected behavior.

_.each(filteredMethods, function(method) {
  methods[method] = function() {
    var result = FilteredCollection.prototype[method].apply(this._filtered, arguments);
    return result === this._filtered ? this : result;
  };
});

_.each(paginatedMethods, function(method) {
  methods[method] = function() {
    var result = PaginatedCollection.prototype[method].apply(this._paginated, arguments);
    return result === this._paginated ? this : result;
  };
});

_.each(sortedMethods, function(method) {
  methods[method] = function() {
    var result = SortedCollection.prototype[method].apply(this._sorted, arguments);
    return result === this._sorted ? this : result;
  };
});

_.extend(Obscura.prototype, methods, Backbone.Events);

Obscura.FilteredCollection = FilteredCollection;
Obscura.SortedCollection = SortedCollection;
Obscura.PaginatedCollection = PaginatedCollection;

module.exports = Obscura;

