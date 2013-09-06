
var _ = require('underscore');
var Backbone = require('backbone');
var proxyCollection = require('backbone-collection-proxy');

var FilteredCollection = require('backbone-filtered-collection');
var SortedCollection = require('backbone-sorted-collection');
var PaginatedCollection = require('backbone-paginated-collection');

// Methods on `this._paginated` we will expose to the outside world
var paginatedMethods = [
  'setPerPage', 'setPage', 'getPerPage', 'getNumPages', 'getPage',
  'hasNextPage', 'hasPrevPage', 'nextPage', 'prevPage', 'movePage'
];

// Methods on `this._sorted` we will expose to the outside world
var sortedMethods = [ 'setSort', 'reverseSort', 'removeSort' ];

// Methods on `this._filtered` we will expose to the outside world
var filteredMethods = [
  'filterBy', 'removeFilter', 'resetFilters', 'refilter'
];

// Events fired from `this._sorted` that we will forward
var sortedEvents = [
  'sorted:add', 'sorted:remove'
];

// Events fired from `this._filtered` that we will forward
var filteredEvents = [
  'filtered:add', 'filtered:remove', 'filtered:reset'
];

var paginatedEvents = [
  'paginated:change:perPage', 'paginated:change:page'
];

function proxyEvents(from, eventNames) {
  _.each(eventNames, function(eventName) {
    this.listenTo(from, eventName, function() {
      var args = _.toArray(arguments);
      args.unshift(eventName);
      this.trigger.apply(this, args);
    });
  }, this);
}

function Pinhole(superset, options) {
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

_.extend(Pinhole.prototype, methods, Backbone.Events);

Pinhole.FilteredCollection = FilteredCollection;
Pinhole.SortedCollection = SortedCollection;
Pinhole.PaginatedCollection = PaginatedCollection;

module.exports = Pinhole;

