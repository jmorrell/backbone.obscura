var assert = chai.assert;

describe('Backbone.Obscura', function() {

  var superset, proxy;
  var mockData = _.map(_.range(500), function(i) { return { n: i }; });

  beforeEach(function() {
    superset = new Backbone.Collection(mockData);
    proxy = new Backbone.Obscura(superset);
  });

  describe('With no options', function() {

    it('should be the same length as the superset', function() {
      assert(proxy.length === superset.length);
    });

    it('should be equal to the superset', function() {
      assert(_.isEqual(proxy.toJSON(), superset.toJSON()));
    });

    it('superset() returns the superset', function() {
      assert(proxy.superset() === superset);
    });

    it('adding a model', function() {
      var newModel = new Backbone.Model({ n: 9001 });
      var called = false;

      proxy.on('add', function(model, collection, options) {
        assert(model === newModel);
        assert(collection === proxy);
        assert(options.at === 300);
        called = true;
      });

      superset.add(newModel, { at: 300 });
      assert(called);
    });

  });

  describe('paginated, sort, and filter', function() {

    it('should paginate', function() {
      proxy.setPerPage(50);
      assert(proxy.getNumPages() === 10);
      assert(proxy.getPage() === 0);
    });

    it('should paginate and sort', function() {
      proxy.setPerPage(50);
      proxy.setSort('n', 'desc');

      assert(_.isEqual(proxy.pluck('n'), _.range(499, 449, -1)));
    });

    it('should paginate, sort, and filter', function() {
      proxy.filterBy('only even', function(model) {
        return model.get('n') % 2 === 0;
      });
      proxy.setPerPage(50);
      proxy.setSort('n', 'desc');

      assert(_.isEqual(proxy.pluck('n'), _.range(498, 398, -2)));
    });

    it('should paginate, sort, and filter when chained', function() {
      proxy
        .setPerPage(50)
        .setSort('n', 'desc')
        .filterBy('only even', function(model) {
          return model.get('n') % 2 === 0;
        });

      assert(_.isEqual(proxy.pluck('n'), _.range(498, 398, -2)));

      proxy
        .setSort('n', 'asc')
        .setPerPage(10)
        .removeFilter('only even')
        .filterBy('only odd', function(model) {
          return model.get('n') % 2 === 1;
        });

      assert(_.isEqual(proxy.pluck('n'), _.range(1, 20, 2)));
    });

    it('should all go away with `removeTransforms`', function() {
      proxy
        .setPerPage(50)
        .setSort('n', 'desc')
        .filterBy('only even', function(model) {
          return model.get('n') % 2 === 0;
        })
        .removeTransforms();

      assert(_.isEqual(proxy.toJSON(), superset.toJSON()));
    });

    it('superset() returns the superset', function() {
      proxy
        .setPerPage(50)
        .setSort('n', 'desc')
        .filterBy('only even', function(model) {
          return model.get('n') % 2 === 0;
        });

      assert(proxy.superset() === superset);
    });

    it('adding a model puts it in the correct place', function() {
      proxy
        .setPerPage(50)
        .setSort('n', 'desc')
        .filterBy('only even', function(model) {
          return model.get('n') % 2 === 0;
        });

      var newModel = new Backbone.Model({ n: 502 });

      var called = false;
      proxy.on('add', function(model, collection, options) {
        called = true;
        assert(model === newModel);
        assert(collection === proxy);
        assert(options.at === 0);
      });

      // Add it to the superset in a location that has nothing to
      // do with the desired final location
      superset.add(newModel, { at: 300 });

      assert(called);
      assert(proxy.first() === newModel);
    });

  });

  describe("destroying the proxy", function() {

    beforeEach(function() {
      proxy
        .setPerPage(50)
        .setSort('n', 'desc')
        .filterBy('only even', function(model) {
          return model.get('n') % 2 === 0;
        });

    });

    it('should have 0 length', function() {
      proxy.destroy();
      assert(proxy.length === 0);
    });

    it('should have no pages', function() {
      proxy.destroy();
      assert(proxy.getNumPages() === 0);
    });

    it('should not repond to changes in the superset', function() {
      proxy.destroy();

      superset.add({ n: 9000 });

      assert(proxy.length === 0);
      assert(proxy.getNumPages() === 0);
    });

    it('should emit no events', function() {
      proxy.destroy();

      var called = false;
      proxy.on('all', function(e) {
        called = true;
      });

      superset.add({ n: 9000 });
      superset.remove(superset.first());
      superset.reset([{ n: 1 }]);

      assert(!called);
    });

    it('should fire an event on destruction', function() {
      var called = false;
      proxy.on('obscura:destroy', function() {
        called = true;
      });

      proxy.destroy();
      assert(called);
    });

    it('should fire no other events on destruction', function() {
      var called = false;
      proxy.on('all', function(e) {
        if (e !== 'obscura:destroy') {
          called = true;
        }
      });

      proxy.destroy();
      assert(!called);
    });

    it('should emit no events after', function() {
      proxy.destroy();

      var called = false;
      proxy.on('all', function(e) {
        called = true;
      });

      superset.add({ n: 9000 });
      superset.remove(superset.first());
      superset.reset([{ n: 1 }]);

      assert(!called);
    });

  });

});




