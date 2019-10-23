class EventListener {
	constructor(events) {
		this.listeners = {};
		for(var i = 0; i < events.length; i++) {
			this.listeners[events[i]] = [];
		}
	}

	addEventListener(event, func) {
		this.listeners[event].push(func);
	}

	callListeners(event) {
		for(var i = 0; i < this.listeners[event].length; i++) {
			this.listeners[event][i]();
		}
	}

	removeEventListener(event, func) {
		for (var i = 0; i < this.listeners[event].length; i++) {
			if(this.listeners[event][i] == func) {
				this.listeners[event].splice(i, 1);
				break;
			}
		}
	}
}