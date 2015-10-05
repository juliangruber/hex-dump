
# hex-dump

  Simplisitc hex dump for browsers.

## Example

  [![view on requirebin](http://requirebin.com/badge.png)](http://requirebin.com/?gist=2faedc03efbc1e973d09)

```js
var Dump = require('hex-dump');

var d = new Dump(chunks, length);
d.appendTo(document.body);
```

## Installation

```bash
$ npm install hex-dump
```

## API

### Dump(chunks, length)

  - `chunks` instance of [abstract-chunk-store](https://npmjs.org/package/abstract-chunk-store). The most efficient chunk size to use is `16`.
  - `length` of the content

### #appendTo(el)

## License

  MIT

