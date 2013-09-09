
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
  }
};

// Methods on `this._filtered` we will expose to the outside world
var filteredMethods = [
  'filterBy', 'removeFilter', 'resetFilters', 'refilter'
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
  'hasNextPage', 'hasPrevPage', 'nextPage', 'prevPage', 'movePage'
];

// Events fired from `this._paginated` that we will forward
var paginatedEvents = [
  'paginated:change:perPage', 'paginated:change:page'
];

_.each(filteredMethods, function(method) {
  methods[method] = function() {
    return FilteredCollection.prototype[method].apply(this._filtered, arguments);
  };
});

_.each(paginatedMethods, function(method) {
  methods[method] = function() {
    return PaginatedCollection.prototype[method].apply(this._paginated, arguments);
  };
});

_.each(sortedMethods, function(method) {
  methods[method] = function() {
    return SortedCollection.prototype[method].apply(this._sorted, arguments);
  };
});

_.extend(Obscura.prototype, methods, Backbone.Events);

Obscura.FilteredCollection = FilteredCollection;
Obscura.SortedCollection = SortedCollection;
Obscura.PaginatedCollection = PaginatedCollection;

module.exports = Obscura;

