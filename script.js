const dbg = (obj) => {
	const debug = location.hash === "#debug";
	if (debug && obj != null)
		console.log(obj);
	return obj == null ? debug : obj;
};

const options = {
	blocks: {
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
if (navigator.serviceWorker) {
	navigator.serviceWorker.register("empty_worker.js");
	navigator.serviceWorker.ready.then(res => serviceWorker = res);
}

const getBlock = (i) => {
	if (i % 2 === 0)
		return "work";
	else if ((i + 1) % (2 * options.longBreakAfter) === 0)
		return "longBreak";
	else return "shortBreak";
};

const setBlock = (i) => {
	stop();

	state.index = i;
	const block = options.blocks[getBlock(state.index)];
	state.remaining = block.duration;

	update();
};

const skip = () => {
	setBlock(state.index + 1);
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

	// Check if block has finished
	if (state.remaining === 0) {
		// Stop the timer
		stop();

		// Move to next block
		setBlock(state.index + 1);		
		
		// Show notification if possible
		if (serviceWorker && serviceWorker.showNotification) {
			serviceWorker.showNotification("Time is up!", {
				body: `${options.blocks[getBlock(state.index)].label} is next.`
			});
		}

		// Play audio
		new Audio("assets/alert.mp3").play();
	}

	update();
};

const update = () => {
	const current = options.blocks[getBlock(state.index)];
	const next = options.blocks[getBlock(state.index + 1)];
	const progress = 1 - state.remaining / current.duration;
	const minutes = Math.floor(state.remaining / 60);
	const seconds = state.remaining - minutes * 60;
	let timeLeft = `${pad(minutes)}:${pad(seconds)}`;

	// Update GUI elements
	document.getElementById("current-block").innerText = current.label;
	document.getElementById("next-block").innerText = next.label;
	document.getElementById("progress-bar").style.width = `${progress * 100}%`;
	document.getElementById("time-left").innerText = timeLeft;
	document.getElementById("play-icon").style.display = state.running ? "none" : "initial";
	document.getElementById("pause-icon").style.display = state.running ? "initial" : "none";

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
	const u = s / 8;
	ctx.fillStyle = options.backgroundColor;
	ctx.fillRect(0, 0, s, s); // Background
	ctx.fillStyle = current.color;
	ctx.fillRect(0, 0, Math.round((s - u) * progress), s); // Progress bar
	ctx.fillStyle = next.color;
	ctx.fillRect(s - u, 0, u, s); // Next block indicator
	const link = document.getElementById("icon");
	link.href = icon.toDataURL(link.type);
};

const pad = (n) => n < 10 ? `0${n}` : `${n}`;

const init = () => {
	if (dbg()) {
		// Shorten durations for debugging
		Object.keys(options.blocks).forEach(s => options.blocks[s].duration /= 60);
	}

	// Listen to timer
	worker.addEventListener("message", tick);

	// Register shortcuts
	document.addEventListener("keyup", e => {
		if (e.key === "k")
			toggle();
		else if (e.key === "l")
			skip();
		else if (e.key === "o")
			editOptions();
	});

	// Show first block
	setBlock(state.index);
	update();
};

init();