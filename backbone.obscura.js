(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('underscore'), require('backbone'));
  }
  else if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone'], factory);
  }
  else {
    root.Backbone.Obscura = factory(root['_'], root['Backbone']);
  }
}(this, function(_, Backbone) {
  function _requireDep(name) {
    return {'underscore': _, 'backbone': Backbone}[name];
  }

  var _bundleExports =
(function (define) {
    function _require(index) {
        var module = _require.cache[index];
        if (!module) {
            var exports = {};
            module = _require.cache[index] = {
                id: index,
                exports: exports
            };
            _require.modules[index].call(exports, module, exports);
        }
        return module.exports;
    }
    _require.cache = [];
    _require.modules = [
        function (module, exports) {
            var _ = _requireDep('underscore');
            var Backbone = _requireDep('backbone');
            var FilteredCollection = _require(2);
            var SortedCollection = _require(5);
            var PaginatedCollection = _require(4);
            var proxyCollection = _require(1);
            var proxyEvents = _require(7);
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
                    superset: function () {
                        return this._superset;
                    },
                    getFilteredLength: function () {
                        return this._filtered.length;
                    },
                    removeTransforms: function () {
                        this._filtered.resetFilters();
                        this._sorted.removeSort();
                        this._paginated.removePagination();
                        return this;
                    },
                    destroy: function () {
                        this.stopListening();
                        this._filtered.destroy();
                        this._sorted.destroy();
                        this._paginated.destroy();
                        this.length = 0;
                        this.trigger('obscura:destroy');
                    }
                };
            var filteredMethods = [
                    'filterBy',
                    'removeFilter',
                    'resetFilters',
                    'refilter',
                    'hasFilter',
                    'getFilters'
                ];
            var filteredEvents = [
                    'filtered:add',
                    'filtered:remove',
                    'filtered:reset'
                ];
            var sortedMethods = [
                    'setSort',
                    'reverseSort',
                    'removeSort'
                ];
            var sortedEvents = [
                    'sorted:add',
                    'sorted:remove'
                ];
            var paginatedMethods = [
                    'setPerPage',
                    'setPage',
                    'getPerPage',
                    'getNumPages',
                    'getPage',
                    'hasNextPage',
                    'hasPrevPage',
                    'nextPage',
                    'prevPage',
                    'movePage',
                    'removePagination',
                    'firstPage',
                    'lastPage'
                ];
            var paginatedEvents = [
                    'paginated:change:perPage',
                    'paginated:change:page',
                    'paginated:change:numPages'
                ];
            var unsupportedMethods = [
                    'add',
                    'create',
                    'remove',
                    'set',
                    'reset',
                    'sort',
                    'parse',
                    'sync',
                    'fetch',
                    'push',
                    'pop',
                    'shift',
                    'unshift'
                ];
            _.each(filteredMethods, function (method) {
                methods[method] = function () {
                    var result = FilteredCollection.prototype[method].apply(this._filtered, arguments);
                    return result === this._filtered ? this : result;
                };
            });
            _.each(paginatedMethods, function (method) {
                methods[method] = function () {
                    var result = PaginatedCollection.prototype[method].apply(this._paginated, arguments);
                    return result === this._paginated ? this : result;
                };
            });
            _.each(sortedMethods, function (method) {
                methods[method] = function () {
                    var result = SortedCollection.prototype[method].apply(this._sorted, arguments);
                    return result === this._sorted ? this : result;
                };
            });
            _.each(unsupportedMethods, function (method) {
                methods[method] = function () {
                    throw new Error('Backbone.Obscura: Unsupported method: ' + method + 'called on read-only proxy');
                };
            });
            _.extend(Obscura.prototype, methods, Backbone.Events);
            Obscura = Backbone.Collection.extend(Obscura.prototype);
            Obscura.FilteredCollection = FilteredCollection;
            Obscura.SortedCollection = SortedCollection;
            Obscura.PaginatedCollection = PaginatedCollection;
            module.exports = Obscura;
        },
        function (module, exports) {
            var _ = _requireDep('underscore');
            var Backbone = _requireDep('backbone');
            var blacklistedMethods = [
                    '_onModelEvent',
                    '_prepareModel',
                    '_removeReference',
                    '_reset',
                    'add',
                    'initialize',
                    'sync',
                    'remove',
                    'reset',
                    'set',
                    'push',
                    'pop',
                    'unshift',
                    'shift',
                    'sort',
                    'parse',
                    'fetch',
                    'create',
                    'model',
                    'off',
                    'on',
                    'listenTo',
                    'listenToOnce',
                    'bind',
                    'trigger',
                    'once',
                    'stopListening'
                ];
            var eventWhiteList = [
                    'add',
                    'remove',
                    'reset',
                    'sort',
                    'destroy',
                    'sync',
                    'request',
                    'error'
                ];
            function proxyCollection(from, target) {
                function updateLength() {
                    target.length = from.length;
                }
                function pipeEvents(eventName) {
                    var args = _.toArray(arguments);
                    var isChangeEvent = eventName === 'change' || eventName.slice(0, 7) === 'change:';
                    if (eventName === 'reset') {
                        target.models = from.models;
                    }
                    if (_.contains(eventWhiteList, eventName)) {
                        if (_.contains([
                                'add',
                                'remove',
                                'destroy'
                            ], eventName)) {
                            args[2] = target;
                        } else if (_.contains([
                                'reset',
                                'sort'
                            ], eventName)) {
                            args[1] = target;
                        }
                        target.trigger.apply(this, args);
                    } else if (isChangeEvent) {
                        if (target.contains(args[1])) {
                            target.trigger.apply(this, args);
                        }
                    }
                }
                var methods = {};
                _.each(_.functions(Backbone.Collection.prototype), function (method) {
                    if (!_.contains(blacklistedMethods, method)) {
                        methods[method] = function () {
                            return from[method].apply(from, arguments);
                        };
                    }
                });
                _.extend(target, Backbone.Events, methods);
                target.listenTo(from, 'all', updateLength);
                target.listenTo(from, 'all', pipeEvents);
                target.models = from.models;
                updateLength();
                return target;
            }
            module.exports = proxyCollection;
        },
        function (module, exports) {
            var _ = _requireDep('underscore');
            var Backbone = _requireDep('backbone');
            var proxyCollection = _require(1);
            var createFilter = _require(3);
            function invalidateCache() {
                this._filterResultCache = {};
            }
            function invalidateCacheForFilter(filterName) {
                for (var cid in this._filterResultCache) {
                    if (this._filterResultCache.hasOwnProperty(cid)) {
                        delete this._filterResultCache[cid][filterName];
                    }
                }
            }
            function addFilter(filterName, filterObj) {
                if (this._filters[filterName]) {
                    invalidateCacheForFilter.call(this, filterName);
                }
                this._filters[filterName] = filterObj;
                this.trigger('filtered:add', filterName);
            }
            function removeFilter(filterName) {
                delete this._filters[filterName];
                invalidateCacheForFilter.call(this, filterName);
                this.trigger('filtered:remove', filterName);
            }
            function execFilterOnModel(model) {
                if (!this._filterResultCache[model.cid]) {
                    this._filterResultCache[model.cid] = {};
                }
                var cache = this._filterResultCache[model.cid];
                for (var filterName in this._filters) {
                    if (this._filters.hasOwnProperty(filterName)) {
                        if (!cache.hasOwnProperty(filterName)) {
                            cache[filterName] = this._filters[filterName].fn(model);
                        }
                        if (!cache[filterName]) {
                            return false;
                        }
                    }
                }
                return true;
            }
            function execFilter() {
                var filtered = [];
                if (this._superset) {
                    filtered = this._superset.filter(_.bind(execFilterOnModel, this));
                }
                this._collection.reset(filtered);
                this.length = this._collection.length;
            }
            function onAddChange(model) {
                this._filterResultCache[model.cid] = {};
                if (execFilterOnModel.call(this, model)) {
                    if (!this._collection.get(model.cid)) {
                        var index = this.superset().indexOf(model);
                        var filteredIndex = null;
                        for (var i = index - 1; i >= 0; i -= 1) {
                            if (this.contains(this.superset().at(i))) {
                                filteredIndex = this.indexOf(this.superset().at(i)) + 1;
                                break;
                            }
                        }
                        filteredIndex = filteredIndex || 0;
                        this._collection.add(model, { at: filteredIndex });
                    }
                } else {
                    if (this._collection.get(model.cid)) {
                        this._collection.remove(model);
                    }
                }
                this.length = this._collection.length;
            }
            function onModelAttributeChange(model) {
                this._filterResultCache[model.cid] = {};
                if (!execFilterOnModel.call(this, model)) {
                    if (this._collection.get(model.cid)) {
                        this._collection.remove(model);
                    }
                }
            }
            function onAll(eventName, model, value) {
                if (eventName.slice(0, 7) === 'change:') {
                    onModelAttributeChange.call(this, arguments[1]);
                }
            }
            function onModelRemove(model) {
                if (this.contains(model)) {
                    this._collection.remove(model);
                }
                this.length = this._collection.length;
            }
            function Filtered(superset) {
                this._superset = superset;
                this._collection = new Backbone.Collection(superset.toArray());
                proxyCollection(this._collection, this);
                this.resetFilters();
                this.listenTo(this._superset, 'reset sort', execFilter);
                this.listenTo(this._superset, 'add change', onAddChange);
                this.listenTo(this._superset, 'remove', onModelRemove);
                this.listenTo(this._superset, 'all', onAll);
            }
            var methods = {
                    defaultFilterName: '__default',
                    filterBy: function (filterName, filter) {
                        if (!filter) {
                            filter = filterName;
                            filterName = this.defaultFilterName;
                        }
                        addFilter.call(this, filterName, createFilter(filter));
                        execFilter.call(this);
                        return this;
                    },
                    removeFilter: function (filterName) {
                        if (!filterName) {
                            filterName = this.defaultFilterName;
                        }
                        removeFilter.call(this, filterName);
                        execFilter.call(this);
                        return this;
                    },
                    resetFilters: function () {
                        this._filters = {};
                        invalidateCache.call(this);
                        this.trigger('filtered:reset');
                        execFilter.call(this);
                        return this;
                    },
                    superset: function () {
                        return this._superset;
                    },
                    refilter: function (arg) {
                        if (typeof arg === 'object' && arg.cid) {
                            onAddChange.call(this, arg);
                        } else {
                            invalidateCache.call(this);
                            execFilter.call(this);
                        }
                        return this;
                    },
                    getFilters: function () {
                        return _.keys(this._filters);
                    },
                    hasFilter: function (name) {
                        return _.contains(this.getFilters(), name);
                    },
                    destroy: function () {
                        this.stopListening();
                        this._collection.reset([]);
                        this._superset = this._collection;
                        this.length = 0;
                        this.trigger('filtered:destroy');
                    }
                };
            _.extend(Filtered.prototype, methods, Backbone.Events);
            module.exports = Filtered;
        },
        function (module, exports) {
            var _ = _requireDep('underscore');
            function convertKeyValueToFunction(key, value) {
                return function (model) {
                    return model.get(key) === value;
                };
            }
            function convertKeyFunctionToFunction(key, fn) {
                return function (model) {
                    return fn(model.get(key));
                };
            }
            function createFilterObject(filterFunction, keys) {
                if (!_.isArray(keys)) {
                    keys = null;
                }
                return {
                    fn: filterFunction,
                    keys: keys
                };
            }
            function createFilterFromObject(filterObj) {
                var keys = _.keys(filterObj);
                var filterFunctions = _.map(keys, function (key) {
                        var val = filterObj[key];
                        if (_.isFunction(val)) {
                            return convertKeyFunctionToFunction(key, val);
                        }
                        return convertKeyValueToFunction(key, val);
                    });
                var filterFunction = function (model) {
                    for (var i = 0; i < filterFunctions.length; i++) {
                        if (!filterFunctions[i](model)) {
                            return false;
                        }
                    }
                    return true;
                };
                return createFilterObject(filterFunction, keys);
            }
            function createFilter(filter, keys) {
                if (_.isFunction(filter)) {
                    return createFilterObject(filter, keys);
                }
                if (_.isObject(filter)) {
                    return createFilterFromObject(filter);
                }
            }
            module.exports = createFilter;
        },
        function (module, exports) {
            var _ = _requireDep('underscore');
            var Backbone = _requireDep('backbone');
            var proxyCollection = _require(1);
            function getPageLimits() {
                var start = this.getPage() * this.getPerPage();
                var end = start + this.getPerPage();
                return [
                    start,
                    end
                ];
            }
            function updatePagination() {
                var pages = getPageLimits.call(this);
                this._collection.reset(this.superset().slice(pages[0], pages[1]));
            }
            function updateNumPages() {
                var currentNumPages = this._totalPages;
                var length = this.superset().length;
                var perPage = this.getPerPage();
                var totalPages = length % perPage === 0 ? length / perPage : Math.floor(length / perPage) + 1;
                var numPagesChanged = this._totalPages !== totalPages;
                this._totalPages = totalPages;
                if (numPagesChanged) {
                    this.trigger('paginated:change:numPages', { numPages: totalPages });
                }
                if (this.getPage() >= totalPages) {
                    this.setPage(totalPages - 1);
                    return true;
                }
            }
            function recalculatePagination() {
                if (updateNumPages.call(this)) {
                    return;
                }
                updatePagination.call(this);
            }
            function difference(arrayA, arrayB) {
                var maxLength = _.max([
                        arrayA.length,
                        arrayB.length
                    ]);
                for (var i = 0, j = 0; i < maxLength; i += 1, j += 1) {
                    if (arrayA[i] !== arrayB[j]) {
                        if (arrayB[i - 1] === arrayA[i]) {
                            j -= 1;
                        } else if (arrayB[i + 1] === arrayA[i]) {
                            j += 1;
                        } else {
                            return arrayA[i];
                        }
                    }
                }
            }
            function onAddRemove(model, collection, options) {
                if (updateNumPages.call(this)) {
                    return;
                }
                var pages = getPageLimits.call(this);
                var start = pages[0], end = pages[1];
                var toAdd = difference(this.superset().slice(start, end), this._collection.toArray());
                var toRemove = difference(this._collection.toArray(), this.superset().slice(start, end));
                if (toRemove) {
                    this._collection.remove(toRemove);
                }
                if (toAdd) {
                    this._collection.add(toAdd, { at: this.superset().indexOf(toAdd) - start });
                }
            }
            function Paginated(superset, options) {
                this._superset = superset;
                this._collection = new Backbone.Collection(superset.toArray());
                this._page = 0;
                this.setPerPage(options && options.perPage ? options.perPage : null);
                proxyCollection(this._collection, this);
                this.listenTo(this._superset, 'add remove', onAddRemove);
                this.listenTo(this._superset, 'reset sort', recalculatePagination);
            }
            var methods = {
                    removePagination: function () {
                        this.setPerPage(null);
                        return this;
                    },
                    setPerPage: function (perPage) {
                        this._perPage = perPage;
                        recalculatePagination.call(this);
                        this.setPage(0);
                        this.trigger('paginated:change:perPage', {
                            perPage: perPage,
                            numPages: this.getNumPages()
                        });
                        return this;
                    },
                    setPage: function (page) {
                        var lowerLimit = 0;
                        var upperLimit = this.getNumPages() - 1;
                        page = page > lowerLimit ? page : lowerLimit;
                        page = page < upperLimit ? page : upperLimit;
                        page = page < 0 ? 0 : page;
                        this._page = page;
                        updatePagination.call(this);
                        this.trigger('paginated:change:page', { page: page });
                        return this;
                    },
                    getPerPage: function () {
                        return this._perPage || this.superset().length || 1;
                    },
                    getNumPages: function () {
                        return this._totalPages;
                    },
                    getPage: function () {
                        return this._page;
                    },
                    hasNextPage: function () {
                        return this.getPage() < this.getNumPages() - 1;
                    },
                    hasPrevPage: function () {
                        return this.getPage() > 0;
                    },
                    nextPage: function () {
                        this.movePage(1);
                        return this;
                    },
                    prevPage: function () {
                        this.movePage(-1);
                        return this;
                    },
                    firstPage: function () {
                        this.setPage(0);
                    },
                    lastPage: function () {
                        this.setPage(this.getNumPages() - 1);
                    },
                    movePage: function (delta) {
                        this.setPage(this.getPage() + delta);
                        return this;
                    },
                    superset: function () {
                        return this._superset;
                    },
                    destroy: function () {
                        this.stopListening();
                        this._collection.reset([]);
                        this._superset = this._collection;
                        this._page = 0;
                        this._totalPages = 0;
                        this.length = 0;
                        this.trigger('paginated:destroy');
                    }
                };
            _.extend(Paginated.prototype, methods, Backbone.Events);
            module.exports = Paginated;
        },
        function (module, exports) {
            var _ = _requireDep('underscore');
            var Backbone = _requireDep('backbone');
            var proxyCollection = _require(1);
            var reverseSortedIndex = _require(6);
            function lookupIterator(value) {
                return _.isFunction(value) ? value : function (obj) {
                    return obj.get(value);
                };
            }
            function modelInsertIndex(model) {
                if (!this._comparator) {
                    return this._superset.indexOf(model);
                } else {
                    if (!this._reverse) {
                        return _.sortedIndex(this._collection.toArray(), model, lookupIterator(this._comparator));
                    } else {
                        return reverseSortedIndex(this._collection.toArray(), model, lookupIterator(this._comparator));
                    }
                }
            }
            function onAdd(model) {
                var index = modelInsertIndex.call(this, model);
                this._collection.add(model, { at: index });
            }
            function onRemove(model) {
                if (this.contains(model)) {
                    this._collection.remove(model);
                }
            }
            function onChange(model) {
                if (this.contains(model) && this._collection.indexOf(model) !== modelInsertIndex.call(this, model)) {
                    this._collection.remove(model);
                    onAdd.call(this, model);
                }
            }
            function sort() {
                if (!this._comparator) {
                    this._collection.reset(this._superset.toArray());
                    return;
                }
                var newOrder = this._superset.sortBy(this._comparator);
                this._collection.reset(this._reverse ? newOrder.reverse() : newOrder);
            }
            function Sorted(superset) {
                this._superset = superset;
                this._reverse = false;
                this._comparator = null;
                this._collection = new Backbone.Collection(superset.toArray());
                proxyCollection(this._collection, this);
                this.listenTo(this._superset, 'add', onAdd);
                this.listenTo(this._superset, 'remove', onRemove);
                this.listenTo(this._superset, 'change', onChange);
                this.listenTo(this._superset, 'reset', sort);
            }
            var methods = {
                    setSort: function (comparator, direction) {
                        this._reverse = direction === 'desc' ? true : false;
                        this._comparator = comparator;
                        sort.call(this);
                        if (!comparator) {
                            this.trigger('sorted:remove');
                        } else {
                            this.trigger('sorted:add');
                        }
                        return this;
                    },
                    reverseSort: function () {
                        this._reverse = !this._reverse;
                        sort.call(this);
                        return this;
                    },
                    removeSort: function () {
                        this.setSort();
                        return this;
                    },
                    superset: function () {
                        return this._superset;
                    },
                    destroy: function () {
                        this.stopListening();
                        this._collection.reset([]);
                        this._superset = this._collection;
                        this.length = 0;
                        this.trigger('sorted:destroy');
                    }
                };
            _.extend(Sorted.prototype, methods, Backbone.Events);
            module.exports = Sorted;
        },
        function (module, exports) {
            var _ = _requireDep('underscore');
            function lookupIterator(value) {
                return _.isFunction(value) ? value : function (obj) {
                    return obj[value];
                };
            }
            function reverseSortedIndex(array, obj, iterator, context) {
                iterator = iterator == null ? _.identity : lookupIterator(iterator);
                var value = iterator.call(context, obj);
                var low = 0, high = array.length;
                while (low < high) {
                    var mid = low + high >>> 1;
                    iterator.call(context, array[mid]) < value ? high = mid : low = mid + 1;
                }
                return low;
            }
            module.exports = reverseSortedIndex;
        },
        function (module, exports) {
            var _ = _requireDep('underscore');
            function proxyEvents(from, eventNames) {
                _.each(eventNames, function (eventName) {
                    this.listenTo(from, eventName, function () {
                        var args = _.toArray(arguments);
                        args.unshift(eventName);
                        this.trigger.apply(this, args);
                    });
                }, this);
            }
            module.exports = proxyEvents;
        }
    ];
    return  _require(0);
}());

  return _bundleExports;
}));