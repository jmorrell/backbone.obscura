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

  });

});




