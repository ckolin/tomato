const dbg = (obj) => {
	const debug = location.hash === "#debug";
	if (debug && obj != null)
		console.log(obj);
	return obj == null ? debug : obj;
};

const options = {
	sections: {
		work: {label: "WORK", duration: 25 * 60, color: "#f7b58c"},
		shortBreak: {label: "SHORT BREAK", duration: 5 * 60, color: "#84739c"},
		longBreak: {label: "LONG BREAK", duration: 15 * 60, color: "#ffefff"}
	},
	longBreakAfter: 4,
	backgroundColor: "#181010"
};

const state = {
	index: 0,
	remaining: 0,
	running: false
};

// Register web worker
const worker = new Worker("tick_worker.js");

// Register empty service worker for notifications
let serviceWorker;
navigator.serviceWorker.register("empty_worker.js");
navigator.serviceWorker.ready.then(res => serviceWorker = res);

const getSection = (i) => {
	if (i % 2 === 0)
		return "work";
	else if ((i + 1) % (2 * options.longBreakAfter) === 0)
		return "longBreak";
	else return "shortBreak";
};

const setSection = (i) => {
	stop();

	state.index = i;
	const section = options.sections[getSection(state.index)];
	state.remaining = section.duration;

	update();
};

const start = () => {
	dbg("starting timer");
	worker.postMessage("start");
	state.running = true;
	update();

	// Request notification permission
	if (Notification.permission === "default")
		Notification.requestPermission();
};

const stop = () => {
	dbg("stopping timer");
	worker.postMessage("stop");
	state.running = false;
	update();
};

const toggle = () => state.running ? stop() : start();

const tick = () => {
	state.remaining--;
	dbg(`${state.remaining} sec remaining`);

	// Check if section has finished
	if (state.remaining === 0) {
		// Stop the timer
		stop();

		// Move to next section
		setSection(state.index + 1);		
		
		// Show notification
		serviceWorker.showNotification("Time is up!", {
			body: `${options.sections[getSection(state.index)].label} is next.`,
			/*icon: icon.toDataURL("image/png")*/});

		// Play audio
		new Audio("yeehaw_by_shawshank73_from_freesound.mp3").play();
	}

	update();
};

const update = () => {
	const current = options.sections[getSection(state.index)];
	const next = options.sections[getSection(state.index + 1)];
	const progress = 1 - state.remaining / current.duration;
	let timeLeft = state.remaining >= 60 ? `${Math.round(state.remaining / 60)}` : `${state.remaining}`;

	// Update GUI elements
	document.getElementById("current-section").innerText = current.label;
	document.getElementById("next-section").innerText = next.label;
	document.getElementById("progress-bar").style.width = `${progress * 100}%`;
	document.getElementById("time-left").innerText = state.running ? timeLeft : "";

	// Update page title
	document.title = state.running ? `${timeLeft} - ${current.label}` : current.label;
	
	// Update colors
	const style = document.querySelector(":root").style;
	if (state.running) {
		style.setProperty("--color-background", options.backgroundColor);
		style.setProperty("--color-current", current.color);
	} else {
		style.setProperty("--color-background", current.color);
		style.setProperty("--color-current", options.backgroundColor);
	}
	style.setProperty("--color-next", next.color);

	// Update favicon
	const icon = document.createElement("canvas");
	const ctx = icon.getContext("2d");
	const s = icon.width = icon.height = 32;
	ctx.fillStyle = options.backgroundColor;
	ctx.fillRect(0, 0, s, s);
	ctx.fillStyle = current.color;
	ctx.fillRect(0, 0, Math.round(s * progress), s);
	const link = document.getElementById("icon");
	link.href = icon.toDataURL(link.type);
};

const init = () => {
	if (dbg()) {
		// Shorten durations for debugging
		Object.keys(options.sections).forEach(s => options.sections[s].duration /= 60);
	}

	// Listen to timer
	worker.addEventListener("message", tick);

	// Register spacebar shortcut
	document.addEventListener("keyup", e => {
		if (e.key === " ")
			toggle();
	});

	// Show first section
	setSection(state.index);
	update();
};

init();

// save options
//localStorage.setItem("tomato-options", JSON.stringify(options));
//localStorage.getItem("tomato-options");

// button to pause/unpause and start next sequence
// spacebar as a shortcut
// notification
// remaining time displayed in title and on page
// settings that can be toggled
// work, short break, long break
// store settings in localstorage
// dark/light theme from system setting?
// favicon that shows progress

// web worker for time updates