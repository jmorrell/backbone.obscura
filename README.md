# Backbone.Obscura

Backbone.Obscura is a read-only proxy of a Backbone.Collection that can easily be 
filtered, sorted, and paginated, while still implementing all of the read-only
Backbone.Collection methods. As the underlying collection is changed the proxy 
is efficiently kept in sync, taking into account all of the transformations. All
transformations can be modified or removed at any time.

You can pass the proxy into a Backbone.View and let Backbone.Obscura take care of 
the filtering or paginating logic, leaving your view to only re-render itself as 
the collection changes. This keeps your views simple and [DRY](http://en.wikipedia.org/wiki/Don't_repeat_yourself).
This works particularly well with [Marionette's](https://github.com/marionettejs/backbone.marionette)
[CollectionView](https://github.com/marionettejs/backbone.marionette/blob/master/docs/marionette.collectionview.md) 
and [CompositeView](https://github.com/marionettejs/backbone.marionette/blob/master/docs/marionette.compositeview.md).

#### [Demo](http://jmorrell.github.io/backbone.obscura/example.html)

```javascript
var proxy = new Backbone.Obscura(originalCollection);

// Set the transformations on the original collection
proxy
  .setPerPage(25)
  .setSort('age', 'desc')
  .filterBy(function(model) {
    return model.get('age') > 17 && model.get('age') < 70;
  });

// Read-only Backbone.Collection functions work on the transformed proxy
proxy.toJSON();
proxy.pluck('age');
proxy.at(3);
proxy.first();

// 'add', 'remove', 'change', 'reset' events are all forwarded for models in the proxy
proxy.on('add', function() { /* ... */ });

// Pass the proxy to a view that knows how to react to a changing collection
var view = new CollectionView({ collection: proxy });

// In another view or a controller, you can modify the state of the filters
if (proxy.hasNextPage()) {
  proxy.nextPage();
}

$('button').on('click', function() {
  proxy.reverseSort();
});
```

[![Build Status](https://secure.travis-ci.org/jmorrell/backbone.obscura.png?branch=master)](http://travis-ci.org/jmorrell/backbone.obscura)

### What's with the name?

![Logo](https://raw.github.com/jmorrell/backbone.obscura/master/img/CameraObscura.jpg)

The camera obscura is an optical device that projects an image of its surroundings 
on a screen. In a similar way, we are using a crude projection of the original
collection to "draw" our views.

## Use Cases

* You want to move pagination, filtering code out of your views
* You have several ways of filtering down an in-memory collection (find-as-you-type, value ranges) that all need to work together
* You have a collection that might be updated via push and need a filtered view to react to this change
* You have a centralized place where you manage your app's data, and need to visualize part of this data
* You want to have an additional view that presents a different view on the same data (Top 5, Latest)

## How does it work?

This library is effectively a convenience wrapper around [backbone-filtered-collection](https://github.com/jmorrell/backbone-filtered-collection),
[backbone-sorted-collection](https://github.com/jmorrell/backbone-sorted-collection), 
and [backbone-paginated-collection](https://github.com/jmorrell/backbone-paginated-collection). 
The original libraries are exposed on the `Obscura` object.

```javascript
// backbone-filtered-collection
Backbone.Obscura.FilteredCollection

// backbone-sorted-collection
Backbone.Obscura.SortedCollection

// backbone-paginated-collection
Backbone.Obscura.PaginatedCollection
```

You can think of `Backbone.Obscura` as a composition of these three transforms applied
one after the other.

```javascript
var collection = new Backbone.Collection(/* data */);

var filtered = new FilteredCollection(collection);
var sorted   = new SortedCollection(filtered);
var obscura  = new PaginatedCollection(sorted);
```

## API

  * <a href="#ctor"><code><b>Obscura()</b></code></a>
  * <a href="#superset"><code>proxy<b>.superset()</b></code></a>
  * <a href="#remove-transforms"><code>proxy<b>.removeTransforms()</b></code></a>
  * <a href="#destroy"><code>proxy<b>.destroy()</b></code></a>

#### Filter Methods
  * <a href="#filter-by"><code>proxy<b>.filterBy()</b></code></a>
  * <a href="#remove-filter"><code>proxy<b>.removeFilter()</b></code></a>
  * <a href="#reset-filters"><code>proxy<b>.resetFilters()</b></code></a>
  * <a href="#refilter"><code>proxy<b>.refilter()</b></code></a>
  * <a href="#get-filters"><code>proxy<b>.getFilters()</b></code></a>
  * <a href="#has-filter"><code>proxy<b>.hasFilter()</b></code></a>
  * <a href="#get-filtered-length"><code>proxy<b>.getFilteredLength</b></code></a>

#### Sorting Methods
  * <a href="#set-sort"><code>proxy<b>.setSort()</b></code></a>
  * <a href="#remove-sort"><code>proxy<b>.removeSort()</b></code></a>
  * <a href="#reverse-sort"><code>proxy<b>.reverseSort()</b></code></a>
  
#### Pagination Methods
  * <a href="#set-per-page"><code>proxy<b>.setPerPage()</b></code></a>
  * <a href="#set-page"><code>proxy<b>.setPage()</b></code></a>
  * <a href="#get-per-page"><code>proxy<b>.getPerPage()</b></code></a>
  * <a href="#get-num-pages"><code>proxy<b>.getNumPages()</b></code></a>
  * <a href="#get-page"><code>proxy<b>.getPage()</b></code></a>
  * <a href="#has-next-page"><code>proxy<b>.hasNextPage()</b></code></a>
  * <a href="#has-prev-page"><code>proxy<b>.hasPrevPage()</b></code></a>
  * <a href="#move-page"><code>proxy<b>.movePage()</b></code></a>
  * <a href="#next-page"><code>proxy<b>.nextPage()</b></code></a>
  * <a href="#prev-page"><code>proxy<b>.prevPage()</b></code></a>
  * <a href="#first-page"><code>proxy<b>.firstPage()</b></code></a>
  * <a href="#last-page"><code>proxy<b>.lastPage()</b></code></a>
  * <a href="#remove-pagination"><code>proxy<b>.removePagination()</b></code></a>

#### <a href="#events-section">Events</a>


## Methods

<a name="ctor"></a>
#### new Backbone.Obscura(collection [, options])

Initialize a new Obscura collection by passing in the original collection.

```javascript
var proxy = new Backbone.Obscura(originalCollection);
```

You may also optionally pass an options hash. Currently the only supported option is setting the `perPage` setting of the paginated transform.
```javascript
var proxy = new Backbone.Obscura(originalCollection, { perPage: 25 });
```

<a name="superset"></a>
#### proxy.superset()

Return a reference to the original collection.

```javascript
proxy.superset();
```

<a name="remove-transforms"></a>
#### proxy.removeTransforms()

Remove all filters, pagination settings, and sorting transforms. Afterwards the collection
should be identical to the original collection.

```
proxy.removeTransforms();
```


<a name="destroy"></a>
#### proxy.destroy()

Remove all ties to the superset and stop updating. Will now be garbage 
collected when it falls out of scope.

```
proxy.destroy();
```

### Filter methods

<a name="filter-by"></a>
#### proxy.filterBy([filterName], filter)

Apply a new filter to the set. Takes an optional filter name.

Can be a simple object that defines required key / value pairs.
```javascript
filtered.filterBy('foo and bar filter', { foo: 2, bar: 3 });
```

Or the you can pass a filter function instead of a value.
```javascript
filtered.filterBy('a > 2', { a: function(val) { 
  return val > 2;
}});
```

Or say you wanted to narrow a value down to one of a couple of options:
```javascript
filtered.filterBy('quality', { a: function(val) { 
  return _.contains([ 'better', 'best' ], val);
}});
```

Or you can use an arbitrary filter function on the model itself.

```javascript
filtered.filterBy('age', function(model) {
  return model.get('age') > 10 && model.get('age') < 40;
});
```

<a name="remove-filter"></a>
#### proxy.removeFilter(filterName)

Remove a previously applied filter. Accepts a filter name.

```javascript
proxy.removeFilter('age');
```

<a name="reset-filters"></a>
#### proxy.resetFilters()

Removes all applied filters.

```javascript
proxy.resetFilters();
```

<a name="refilter"></a>
#### proxy.refilter()

If the collections get out of sync (ex: change events have been suppressed) force
the collection to refilter all of the models.

```javascript
proxy.refilter();
```

Can also be forced to run on one model in particular.

```javascript
proxy.refilter(model);
```

<a name="get-filters"></a>
#### filtered.getFilters()

Returns a list of the names of applied filters.

*Note:* If added a filter with no name, it will show up here as `__default`.

```javascript
filtered.getFilters();
```

<a name="has-filter"></a>
#### filtered.hasFilter()

Given a string, return whether or not that filter is currently applied.

```javascript
filtered.hasFilter('name');
```

<a name="get-filtered-length"></a>
#### filtered.getFilteredLength()

Return the length of the filtered set. This is useful when you have also paginated
the collection and want to know how many items are in the unpaginated set.

```javascript
filtered.getFilteredLength();
```

### Sorting methods

<a name="set-sort"></a>
#### proxy.setSort(comparator, direction)

`comparator` accepts:
- nothing or `null`, resets the sorting to the same order as the superset
- a string, sorts by a model key
- a function that accepts a model and returns a value

`direction` must be one of: `"asc"` or `"desc"`. If it's not provided it
will default to `"asc"`.

```javascript
// sort by the 'age' property descending
proxy.setSort('age', 'desc');

// equivalent to this
proxy.setSort(function(model) {
  return model.get('age');
}, 'desc');

// but we can also do arbitrary computation in the closure
proxy.setSort(function(mode) {
  return someComplicatedCalculation(model);
});

// Characters with accents get sorted to the end of the alphabet, 
// so let's sort based on the unaccented version.
proxy.setSort(function(model) {
  return removeAccents(model.get('name'));
});

// Pass nothing as an option to remove all sorting
proxy.setSort();
```

<a name="remove-sort"></a>
#### proxy.removeSort

Remove all sorting. Equivalent to calling `sorted.setSort()`

```javascript
proxy.removeSort();
```

<a name="reverse-sort"></a>
#### proxy.reverseSort

Reverse the sort. The API is chainable, so this can be called directly
after `setSort` if you want the sort to be descending.

If there is no current sort function then this does nothing.

```javascript
// Sort by age descending
proxy.setSort('age').reverseSort();
```

### Pagination methods

<a name="set-per-page"></a>
#### proxy.setPerPage(perPage)

Change the number of models displayed per page. This will reset the current page to 0.

```javascript
proxy.setPerPage(50);
```

<a name="set-page"></a>
#### proxy.setPage(page)

Change the page. If the page is less than 0, it will be set to 0. If it is longer than
the number of pages, the last page will be selected.

```javascript
proxy.setPage(5);
```

<a name="get-per-page"></a>
#### proxy.getPerPage()

Return the current setting for number of models per page.

```javascript
proxy.getPerPage();
```

<a name="get-num-pages"></a>
#### proxy.getNumPages()

Return the current number of pages.

```javascript
proxy.getNumPages();
```

<a name="get-page"></a>
#### proxy.getPage()

Return the current page. E.G. if this returns 0, you're on the first page.

```javascript
proxy.getPage();
```

<a name="has-next-page"></a>
#### proxy.hasNextPage()

Returns true if this is not the last page.

```javascript
proxy.hasNextPage();
```

<a name="has-prev-page"></a>
#### proxy.hasPrevPage()

Returns true if this is not the first page.

```javascript
proxy.hasPrevPage();
```

<a name="move-page"></a>
#### proxy.movePage(delta)

Move `delta` pages forwards or backwards (if `delta` is negative).

```javascript
// will move two pages back
proxy.movePage(-2);
```

<a name="next-page"></a>
#### proxy.nextPage()

Move to the next page. Equivalent to `paginated.movePage(1)`.

```javascript
proxy.nextPage();
```

<a name="prev-page"></a>
#### proxy.prevPage()

Move to the previous page. Equivalent to `paginated.movePage(-1)`.

```javascript
proxy.prevPage();
```

<a name="first-page"></a>
#### paginated.firstPage()

Move to the first page of the collection. Equivalent to `paginated.setPage(0)`.

```javascript
proxy.firstPage();
```

<a name="last-page"></a>
#### paginated.lastPage()

Move to the last page of the collection. Equivalent to `paginated.setPage(paginated.getNumPages() - 1)`.

```javascript
proxy.lastPage();
```

<a name="remove-pagination"></a>
#### proxy.removePagination()

Get rid of any paginated settings.

```javascript
proxy.removePagination();
```

<a name="events-section"></a>
## Events

`add`, `remove`, `change`, `reset` should fire as you expect.

`filtered:add` - Fired when a new filter is added. Passes the filter name.

`filtered:remove` - Fired with a filter is removed. Passes the filter name.

`filtered:reset` - Fired when all of the filters are removed.

`sorted:add` - Trigger when a sort function is set

`sorted:remove` - Trigger when a sort function is removed

`paginated:change:perPage` - Fired whenever the number of models per page is changed. If you
                             remove the pagination settings, `perPage` will be passed as `null`.

`paginated:change:page` - Fired whenever the page is changed.

`paginated:change:numPages` - Fired whenever the number of pages changes.

`obscura:destroy` - Fired when the proxy is destroyed


## Installation

### Usage with Browserify

Install with npm, use with [Browserify](http://browserify.org/)

```
> npm install backbone.obscura
```

and in your code

```javascript
var Obscura = require('backbone.obscura');
```

### Usage with Bower

Install with [Bower](http://bower.io):

```
bower install backbone.obscura
```

The component can be used as a Common JS module, an AMD module, or a global.

### Usage as browser global

You can include `backbone.obscura.js` directly in a script tag. Make 
sure that it is loaded after underscore and backbone. It's exported as 
`Backbone.Obscura`.

```HTML
<script src="underscore.js"></script>
<script src="backbone.js"></script>
<script src="backbone.obscura.js"></script>
```

## Testing

Install [Node](http://nodejs.org) (comes with npm) and Bower.

From the repo root, install the project's development dependencies:

```
npm install
bower install
```

Testing relies on the Karma test-runner. If you'd like to use Karma to
automatically watch and re-run the test file during development, it's easiest
to globally install Karma and run it from the CLI.

```
npm install -g karma
karma start
```

To run the tests in Firefox, just once, as CI would:

```
npm test
```

## Alternative Libraries

There are several libraries that offer similar functionality, but none that offered the combination of features that I wanted.

* JavaScript, not CoffeeScript
* No need to define filters or sorting on initialization
* Ability to use arbitrary functions for filters or sorting
* Transparency, if no transforms are defined, the proxy should be the same as the original collection
* Ability to add and remove multiple filters
* Easy to use with Browserify, but also easy to throw into an AMD project

If this library doesn't meet your needs, maybe one of the following will:

* [Backbone.CollectionFilter](https://github.com/rhysbrettbowen/Backbone.CollectionFilter)
* [Backbone.Projections](https://github.com/andreypopp/backbone.projections)
* [backbone.collectionsubset](https://github.com/anthonyshort/backbone.collectionsubset)
* [Backbone.VirtualCollection](https://github.com/p3drosola/Backbone.VirtualCollection)
* [Backbone.Subset](https://github.com/masylum/Backbone.Subset)

## License

MIT

## Acknowledgements

[Photo](http://www.flickr.com/photos/garunaborbor/8787779395) taken from Flickr, licensed under Creative Commons

[Photo](http://commons.wikimedia.org/wiki/File:Camera_Obscura_box18thCentury.jpg) taken from Wikimedia, and is in the public domain
