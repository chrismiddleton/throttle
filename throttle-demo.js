/**
 * @param {Function} func
 * @param {int} interval
 * @return {Function}
**/
function throttle (func, interval) {
	var waiting = false;
	var lastCallTime = null;
	function handleDoneWaiting () {
		// not waiting anymore - another call must have occurred
		if (!waiting) {
			if (throttle.log) throttle.log("No longer waiting on function " + func.name + ", returning");
			return;
		}
		if (throttle.log) throttle.log("Done waiting to call function " + func.name);
		waiting = false;
		throttled();
	}
	function throttled () {
		if (waiting) return;
		var now = Date.now();
		if (lastCallTime != null) {
			var timeSince = (now - lastCallTime);
			if (timeSince < interval) {
				if (throttle.log) throttle.log("Throttling function " + func.name + 
					": last change too recent (" + timeSince + "ms ago)"
				);
				waiting = true;
				window.setTimeout(handleDoneWaiting, interval);
				return;
			}
		}
		if (throttle.log) throttle.log("Calling function " + func.name);
		lastCallTime = now;
		func();
	}
	return throttled;
}

throttle.log = null;

class ThrottleDemo {

	/**
	 * @param {HTMLElement!} parent
	**/
	constructor (parent) {
		this._timesUpdated = 0;
		this._startTimeInMs = Date.now();
		this._div = parent.appendChild(document.createElement('div'));
		this._updateUnthrottled = this._update.bind(this);
		this._updateThrottled = throttle(this._updateUnthrottled, 1000);
		this._throttling = true;
		this._callUpdate = this._updateThrottled;
		var p = parent.appendChild(document.createElement('p'));
		var input = p.appendChild(document.createElement('input'));
		input.type = 'button';
		input.onclick = this._toggleThrottle.bind(this);
		this._input = input;
		this._handleTickBound = this._handleTick.bind(this);
		window.setTimeout(this._handleTickBound, ThrottleDemo.TICK_INTERVAL);
	}

	_handleTick () {
		this._callUpdate();
		this._render();
		window.setTimeout(this._handleTickBound, ThrottleDemo.TICK_INTERVAL);
	}

	_render () {
		var now = Date.now();
		var secondsElapsed = Math.floor((now - this._startTimeInMs) / 1000);
		this._div.innerHTML = "Updated " + this._timesUpdated + " times in " + secondsElapsed + " seconds.";
		this._input.value = this._throttling ? 'Stop Throttling' : 'Start Throttling';
	}

	_toggleThrottle () {
		this._throttling = !this._throttling;
		if (this._throttling) {
			this._callUpdate = this._updateThrottled;
		} else {
			this._callUpdate = this._updateUnthrottled;
		}
		this._render();
	}

	_update () {
		this._timesUpdated++;
	}

}

ThrottleDemo.TICK_INTERVAL = 40;

window.addEventListener('load', function () {
	new ThrottleDemo(document.body);
	document.getElementById('es6-required-msg-div').style.display = 'none';
});