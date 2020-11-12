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

const worker = new Worker("tick_worker.js");

const getSection = (i) => {
	if (i % 2 === 0)
		return "work";
	else if ((i + 1) % (2 * options.longBreakAfter) === 0)
		return "longBreak";
	else return "shortBreak";
};

const setSection = (i) => {
	state.index = i;
	const section = options.sections[getSection(state.index)];
	state.remaining = section.duration;
};

const start = () => {
	dbg("starting timer");
	worker.postMessage("start");
	state.running = true;

	// Request notification permission
	if (Notification.permission === "default")
		Notification.requestPermission();
};

const stop = () => {
	dbg("stopping timer");
	worker.postMessage("stop");
	state.running = false;
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
		
		// Alert user
		new Notification("Time's up!", {
			body: `Next up: ${options.sections[getSection(state.index)].label}`,
			/*icon: icon.toDataURL("image/png")*/});
	}

	update();
};

const update = () => {
	const section = options.sections[getSection(state.index)];
	const progress = 1 - state.remaining / section.duration;
	const timeLeft = state.remaining >= 60 ? `${Math.round(state.remaining / 60)}min` : `${state.remaining}s`;

	// Update GUI elements
	document.getElementById("current-section").innerText = section.label;
	document.getElementById("next-section").innerText = options.sections[getSection(state.index + 1)].label;
	document.getElementById("progress-bar").style.width = `${progress * 100}%`;
	// TODO: Show remaining time
	//document.getElementById("time-left").innerText = timeLeft;

	// Update page title
	document.title = `${timeLeft} - ${section.label}`;
	
	// Update colors
	const style = document.querySelector(":root").style;
	style.setProperty("--color-background", options.backgroundColor);
	style.setProperty("--color-current", options.sections[getSection(state.index)].color);
	style.setProperty("--color-next", options.sections[getSection(state.index + 1)].color);

	// Update favicon
	const icon = document.createElement("canvas");
	const ctx = icon.getContext("2d");
	const s = icon.width = icon.height = 32;
	ctx.fillStyle = options.backgroundColor;
	ctx.fillRect(0, 0, s, s);
	ctx.fillStyle = section.color;
	ctx.fillRect(0, 0, s * progress, s);
	const link = document.getElementById("icon");
	link.href = icon.toDataURL(link.type);
};

const init = () => {
	if (dbg()) {
		// Shorten durations for debugging
		Object.keys(options.sections).forEach(s => options.sections[s].duration /= 5 * 60);
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

/*
// donut
ctx.lineWidth = 20;
ctx.lineCap = "round";
ctx.strokeStyle = "green";
ctx.arc(50, 50, 25, 2, 4);
ctx.stroke();
ctx.beginPath();
ctx.strokeStyle = "red";
ctx.arc(50, 50, 25, -0.5 * Math.PI, 2);
ctx.stroke();


// save options
localStorage.setItem("tomato-options", JSON.stringify(options));
localStorage.getItem("tomato-options");
*/

// start at current time
// while cirle not done, add next segments
// draw segments backwards
// circle will slowly rotate
// fade out end?

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