// Posts a message for every second that passes
let interval, start, counted;
self.addEventListener("message", e => {
	if (e.data === "start") {
		counted = 0;
		start = Date.now();
		interval = setInterval(() => {
			const count = Math.floor((Date.now() - start) / 1000);
			const gap = count - counted; // Calculate missed seconds
			counted = count;
			for (let i = 0; i < gap; i++)
				postMessage("tick");
		}, 500);
	} else if (e.data === "stop") {
		clearInterval(interval);
	}
});