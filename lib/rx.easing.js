var _  = require('underscore');
var Rx = require('rx');

var Observable = Rx.Observable;
var observableProto = Rx.Observable.prototype;
var frame_rate = 30;
var interval_len = 1000/frame_rate;
var timer = Observable
	.timer(0, interval_len)
	.select(function(i) {
		return i * interval_len;
	});

Observable.backIn = _.partial(observable_ease, curry_easing_time(backIn));
Observable.backOut = _.partial(observable_ease, curry_easing_time(backOut));
Observable.backInOut = _.partial(observable_ease, curry_easing_time(backInOut));
Observable.bounceOut = _.partial(observable_ease, curry_easing_time(bounceOut));
Observable.bounceIn = _.partial(observable_ease, curry_easing_time(bounceIn));
Observable.bounceInOut = _.partial(observable_ease, curry_easing_time(bounceInOut));
Observable.circIn = _.partial(observable_ease, curry_easing_time(circIn));
Observable.circOut = _.partial(observable_ease, curry_easing_time(circOut));
Observable.circInOut = _.partial(observable_ease, curry_easing_time(circInOut));
Observable.cubicIn = _.partial(observable_ease, curry_easing_time(cubicIn));
Observable.cubicOut = _.partial(observable_ease, curry_easing_time(cubicOut));
Observable.cubicInOut = _.partial(observable_ease, curry_easing_time(cubicInOut));
Observable.elasticOut = _.partial(observable_ease, curry_easing_time(elasticOut));
Observable.elasticIn = _.partial(observable_ease, curry_easing_time(elasticIn));
Observable.elasticInOut = _.partial(observable_ease, curry_easing_time(elasticInOut));
Observable.expoIn = _.partial(observable_ease, curry_easing_time(expoIn));
Observable.expoOut = _.partial(observable_ease, curry_easing_time(expoOut));
Observable.expoInOut = _.partial(observable_ease, curry_easing_time(expoInOut));
Observable.linear = _.partial(observable_ease, curry_easing_time(linearNone));
Observable.linearNone = _.partial(observable_ease, curry_easing_time(linearNone));
Observable.linearIn = _.partial(observable_ease, curry_easing_time(linearIn));
Observable.linearOut = _.partial(observable_ease, curry_easing_time(linearOut));
Observable.linearInOut = _.partial(observable_ease, curry_easing_time(linearInOut));
Observable.quadIn = _.partial(observable_ease, curry_easing_time(quadIn));
Observable.quadOut = _.partial(observable_ease, curry_easing_time(quadOut));
Observable.quadInOut = _.partial(observable_ease, curry_easing_time(quadInOut));
Observable.quartIn = _.partial(observable_ease, curry_easing_time(quartIn));
Observable.quartOut = _.partial(observable_ease, curry_easing_time(quartOut));
Observable.quartInOut = _.partial(observable_ease, curry_easing_time(quartInOut));
Observable.quintIn = _.partial(observable_ease, curry_easing_time(quintIn));
Observable.quintOut = _.partial(observable_ease, curry_easing_time(quintOut));
Observable.quintInOut = _.partial(observable_ease, curry_easing_time(quintInOut));
Observable.sineIn = _.partial(observable_ease, curry_easing_time(sineIn));
Observable.sineOut = _.partial(observable_ease, curry_easing_time(sineOut));
Observable.sineInOut = _.partial(observable_ease, curry_easing_time(sineInOut));

function observable_ease(easing_func) {
	
	var args = _.toArray(arguments).slice(1),
		begin = args[0],
		end = args[1],
		duration = args[2];
	
	args[1] = end - begin;
	
	return timer
		.takeWithTime(duration)
		.select(easing_func.apply(null, args))
		.concat(Observable.returnValue(end));
}

function curry_easing_time(easing_func) {
	return function() {
		var args = _.toArray(arguments);
		return function(time) {
			return easing_func.apply(null, [time].concat(args));
		}
	}
}

function backIn(time, begin, change, duration, overshoot) {
	if (overshoot == null)  overshoot = 1.70158;
	
	return change * (time /= duration) * time * ((overshoot + 1) * time - overshoot) + begin;
}

function backOut(time, begin, change, duration, overshoot) {
	if (overshoot == null) overshoot = 1.70158;
	
	return change * ((time = time / duration - 1) * time * ((overshoot + 1) * time + overshoot) + 1) + begin;
}

function backInOut(time, begin, change, duration, overshoot) {
	if (overshoot == null) overshoot = 1.70158;
	
	if ((time = time / (duration / 2)) < 1) {
		return change / 2 * (time * time * (((overshoot *= 1.525) + 1) * time - overshoot)) + begin;
	} else {
		return change / 2 * ((time -= 2) * time * (((overshoot *= 1.525) + 1) * time + overshoot) + 2) + begin;
	}
}

function bounceOut(time, begin, change, duration) {
	if ((time /= duration) < 1 / 2.75) {
		return change * (7.5625 * time * time) + begin;
	} else if (time < 2 / 2.75) {
		return change * (7.5625 * (time -= 1.5 / 2.75) * time + 0.75) + begin;
	} else if (time < 2.5 / 2.75) {
		return change * (7.5625 * (time -= 2.25 / 2.75) * time + 0.9375) + begin;
	} else {
		return change * (7.5625 * (time -= 2.625 / 2.75) * time + 0.984375) + begin;
	}
}

function bounceIn(time, begin, change, duration) {
	return change - bounceOut(duration - time, 0, change, duration) + begin;
}

function bounceInOut(time, begin, change, duration) {
	if (time < duration / 2) {
		return bounceIn(time * 2, 0, change, duration) * 0.5 + begin;
	} else {
		return bounceOut(time * 2 - duration, 0, change, duration) * 0.5 + change * 0.5 + begin;
	}
}

function circIn(time, begin, change, duration) {
	return -change * (Math.sqrt(1 - (time = time / duration) * time) - 1) + begin;
}

function circOut(time, begin, change, duration) {
	return change * Math.sqrt(1 - (time = time / duration - 1) * time) + begin;
}

function circInOut(time, begin, change, duration) {
	if ((time = time / (duration / 2)) < 1) {
		return -change / 2 * (Math.sqrt(1 - time * time) - 1) + begin;
	} else {
		return change / 2 * (Math.sqrt(1 - (time -= 2) * time) + 1) + begin;
	}
}

function cubicIn(time, begin, change, duration) {
	return change * (time /= duration) * time * time + begin;
}

function cubicOut(time, begin, change, duration) {
	return change * ((time = time / duration - 1) * time * time + 1) + begin;
}

function cubicInOut(time, begin, change, duration) {
	if ((time = time / (duration / 2)) < 1) {
		return change / 2 * time * time * time + begin;
	} else {
		return change / 2 * ((time -= 2) * time * time + 2) + begin;
	}
}

function elasticOut(time, begin, change, duration, amplitude, period) {
	var overshoot;
	if (amplitude == null) {
		amplitude = null;
	}
	if (period == null) {
		period = null;
	}
	if (time === 0) {
		return begin;
	} else if ((time = time / duration) === 1) {
		return begin + change;
	} else {
		if (!(period != null)) {
			period = duration * 0.3;
		}
		if (!(amplitude != null) || amplitude < Math.abs(change)) {
			amplitude = change;
			overshoot = period / 4;
		} else {
			overshoot = period / (2 * Math.PI) * Math.asin(change / amplitude);
		}
		return (amplitude * Math.pow(2, -10 * time)) * Math.sin((time * duration - overshoot) * (2 * Math.PI) / period) + change + begin;
	}
}

function elasticIn(time, begin, change, duration, amplitude, period) {
	var overshoot;
	if (amplitude == null) {
		amplitude = null;
	}
	if (period == null) {
		period = null;
	}
	if (time === 0) {
		return begin;
	} else if ((time = time / duration) === 1) {
		return begin + change;
	} else {
		if (!(period != null)) {
			period = duration * 0.3;
		}
		if (!(amplitude != null) || amplitude < Math.abs(change)) {
			amplitude = change;
			overshoot = period / 4;
		} else {
			overshoot = period / (2 * Math.PI) * Math.asin(change / amplitude);
		}
		time -= 1;
		return -(amplitude * Math.pow(2, 10 * time)) * Math.sin((time * duration - overshoot) * (2 * Math.PI) / period) + begin;
	}
}

function elasticInOut(time, begin, change, duration, amplitude, period) {
	var overshoot;
	if (amplitude == null) {
		amplitude = null;
	}
	if (period == null) {
		period = null;
	}
	if (time === 0) {
		return begin;
	} else if ((time = time / (duration / 2)) === 2) {
		return begin + change;
	} else {
		if (!(period != null)) {
			period = duration * (0.3 * 1.5);
		}
		if (!(amplitude != null) || amplitude < Math.abs(change)) {
			amplitude = change;
			overshoot = period / 4;
		} else {
			overshoot = period / (2 * Math.PI) * Math.asin(change / amplitude);
		}
		if (time < 1) {
			return -0.5 * (amplitude * Math.pow(2, 10 * (time -= 1))) * Math.sin((time * duration - overshoot) * ((2 * Math.PI) / period)) + begin;
		} else {
			return amplitude * Math.pow(2, -10 * (time -= 1)) * Math.sin((time * duration - overshoot) * (2 * Math.PI) / period) + change + begin;
		}
	}
}

function expoIn(time, begin, change, duration) {
	if (time === 0) {
		return begin;
	}
	return change * Math.pow(2, 10 * (time / duration - 1)) + begin;
}


function expoOut(time, begin, change, duration) {
	if (time === duration) {
		return begin + change;
	}
	return change * (-Math.pow(2, -10 * time / duration) + 1) + begin;
}

function expoInOut(time, begin, change, duration) {
	if (time === 0) {
		return begin;
	} else if (time === duration) {
		return begin + change;
	} else if ((time = time / (duration / 2)) < 1) {
		return change / 2 * Math.pow(2, 10 * (time - 1)) + begin;
	} else {
		return change / 2 * (-Math.pow(2, -10 * (time - 1)) + 2) + begin;
	}
}

function linearNone(time, begin, change, duration) {
	return change * time / duration + begin;
}

function linearIn(time, begin, change, duration) {
	return linearNone(time, begin, change, duration);
}


function linearOut(time, begin, change, duration) {
	return linearNone(time, begin, change, duration);
}

function linearInOut(time, begin, change, duration) {
	return linearNone(time, begin, change, duration);
}

function quadIn(time, begin, change, duration) {
	return change * (time = time / duration) * time + begin;
}

function quadOut(time, begin, change, duration) {
	return -change * (time = time / duration) * (time - 2) + begin;
}

function quadInOut(time, begin, change, duration) {
	if ((time = time / (duration / 2)) < 1) {
		return change / 2 * time * time + begin;
	} else {
		return -change / 2 * ((time -= 1) * (time - 2) - 1) + begin;
	}
}

function quartIn(time, begin, change, duration) {
	return change * (time = time / duration) * time * time * time + begin;
}

function quartOut(time, begin, change, duration) {
	return -change * ((time = time / duration - 1) * time * time * time - 1) + begin;
}

function quartInOut(time, begin, change, duration) {
	if ((time = time / (duration / 2)) < 1) {
		return change / 2 * time * time * time * time + begin;
	} else {
		return -change / 2 * ((time -= 2) * time * time * time - 2) + begin;
	}
}

function quintIn(time, begin, change, duration) {
	return change * (time = time / duration) * time * time * time * time + begin;
}

function quintOut(time, begin, change, duration) {
	return change * ((time = time / duration - 1) * time * time * time * time + 1) + begin;
}

function quintInOut(time, begin, change, duration) {
	if ((time = time / (duration / 2)) < 1) {
		return change / 2 * time * time * time * time * time + begin;
	} else {
		return change / 2 * ((time -= 2) * time * time * time * time + 2) + begin;
	}
}

function sineIn(time, begin, change, duration) {
	return -change * Math.cos(time / duration * (Math.PI / 2)) + change + begin;
}

function sineOut(time, begin, change, duration) {
	return change * Math.sin(time / duration * (Math.PI / 2)) + begin;
}

function sineInOut(time, begin, change, duration) {
	return -change / 2 * (Math.cos(Math.PI * time / duration) - 1) + begin;
}


module.exports = Rx;