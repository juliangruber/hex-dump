
# hex-dump

  Simplisitc hex dump for browsers.

## Features

- shows byte offset, hex values and strings
- entropy bar
- text selection with .getSelection
- highlights same values
- lazily loads binaries of arbitrary sizes

## Example

  ![screenshot](screenshot.png)

```js
var Dump = require('hex-dump');

var d = new Dump(chunks, length);
d.appendTo(document.body);
```

  [![view on requirebin](http://requirebin.com/badge.png)](http://requirebin.com/?gist=2faedc03efbc1e973d09)

## Installation

```bash
$ npm install hex-dump
```

## API

### Dump(chunks, length)

  - `chunks` instance of [abstract-chunk-store](https://npmjs.org/package/abstract-chunk-store). The most efficient chunk size to use is `16`.
  - `length` of the content

### #appendTo(el)

### #getSelection(cb)

  If the user has selected some data, call cb with `(err, buf)`, where `buf` is the slice of data selected.

## License

  MIT

