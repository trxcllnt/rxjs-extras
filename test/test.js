var Rx = require('rx');
require('../lib/rx');
require('../lib/rx.easing');

Rx.Observable.backIn(0, 1000, 2431).subscribe(function(val) {
	console.log(val);
});