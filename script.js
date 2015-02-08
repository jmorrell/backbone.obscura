
var ListItemView = Marionette.ItemView.extend({
  template: '#list-item',
  tagName: 'li',
  className: 'topcoat-list__item',

  events: {
    'click': 'onClick'
  },

  onClick: function() {
    this.model.destroy();
  }
});

var ListView = Marionette.CollectionView.extend({
  className: 'topcoat-list__container',
  tagName: 'ul',
  childView: ListItemView,

  // Marionette's default implementation ignores the index, always
  // appending the new view to the end. Let's be a little more clever.
  appendHtml: function(collectionView, itemView, index){
    if (!index) {
      collectionView.$el.prepend(itemView.el);
    } else {
      $(collectionView.$('li')[index - 1]).after(itemView.el);
    }
  }
});

var PagerView = Marionette.ItemView.extend({
  className: 'pages',
  template: '#pager',

  events: {
    'click .prev': 'onPrev',
    'click .next': 'onNext'
  },

  collectionEvents: {
    'paginated:change:page': 'onRender',
    'paginated:change:numPages': 'onRender',
  },

  onRender: function() {
    this.$('.current').text(this.collection.getPage() + 1);
    this.$('.total').text(this.collection.getNumPages());
    this.$('.prev').prop('disabled', !this.collection.hasPrevPage());
    this.$('.next').prop('disabled', !this.collection.hasNextPage());
  },

  onPrev: function() {
    if (this.collection.hasPrevPage()) {
      this.collection.prevPage();
    }
  },

  onNext: function() {
    if (this.collection.hasNextPage()) {
      this.collection.nextPage();
    }
  }
});

var SupersetControls = Marionette.ItemView.extend({
  events: {
    'click .add-model': 'addModel'
  },

  addModel: function() {
    this.collection.add(getRandomPersonModel(), { at: _.random(0, this.collection.length) });
  }
});

var ObscuraControls = Marionette.ItemView.extend({
  events: {
    'keyup .topcoat-search-input': 'filterOnType',
    'change .per-page input[type=radio]': 'changePagination',
    'change .sort-by input[type=radio]': 'changeSort'
  },

  filterOnType: _.debounce(function(ev) {
    var regex = new RegExp(this.$('.topcoat-search-input').val(), 'i');

    this.collection.filterBy('filter-on-type', function(model) {
      return  regex.test(model.get('name'));
    });
  }, 100),

  changePagination: function(ev) {
    this.collection.setPerPage(this.$('.per-page input:checked').data('per-page'));
  },

  changeSort: function(ev) {
    var $checked = this.$('.sort-by input:checked');
    if ($checked.data('key') === "null") {
      this.collection.removeSort();
    } else {
      this.collection.setSort($checked.data('key'), $checked.data('dir'));
    }
  }
});

var App = new Backbone.Marionette.Application();

App.addRegions({
  supersetList: '.superset-list',
  obscuraList: '.obscura-list',
  pager: '.pager'
});

App.addInitializer(function(options) {
  var initialData = _.range(0, 50).map(getRandomPersonModel);

  var superset = new Backbone.Collection(initialData);
  var proxy = new Backbone.Obscura(superset);

  // default to 5 models per page
  proxy.setPerPage(5);

  var supersetList = new ListView({
    collection: superset
  });

  var obscuraList = new ListView({
    collection: proxy
  });

  var pager = new PagerView({
    collection: proxy
  });

  var supersetContorls = new SupersetControls({
    collection: superset,
    el: '.superset-controls'
  });

  var obscuraControls = new ObscuraControls({
    collection: proxy,
    el: '.obscura-controls'
  });

  App.supersetList.show(supersetList);
  App.obscuraList.show(obscuraList);
  App.pager.show(pager);
});

App.start();

