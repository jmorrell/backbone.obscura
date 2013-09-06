# backbone.pinhole

[![Build Status](https://secure.travis-ci.org/user/backbone.pinhole.png?branch=master)](http://travis-ci.org/user/backbone.pinhole)

TODO

```javascript
// TODO
```

## Methods

### new Backbone.Pinhole



## Installation

### Usage with Browserify

Install with npm, use with [Browserify](http://browserify.org/)

```
> npm install backbone.pinhole
```

and in your code

```javascript
var Pinhole = require('backbone.pinhole');
```

### Usage with Bower

Install with [Bower](http://bower.io):

```
bower install backbone.pinhole
```

The component can be used as a Common JS module, an AMD module, or a global.

### Usage as browser global

You can include `backbone.pinhole.js` directly in a script tag. Make 
sure that it is loaded after underscore and backbone. It's exported as 
`Backbone.Pinhole`.

```HTML
<script src="underscore.js"></script>
<script src="backbone.js"></script>
<script src="backbone.pinhole.js"></script>
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

## License

MIT
