const dbg = (obj) => { console.log(obj); return obj; };
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const options = {
	sections: {
		work: {label: "work", duration: 25 * 60},
		shortBreak: {label: "short break", duration: 5 * 60},
		longBreak: {label: "long break", duration: 15 * 60}
	},
	longBreakAfter: 4,
	//colors: ["#00303b", "#ff7777", "#ffce96", "#f1f2da"],
	enableNotifications: true
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

const start = () => {
	if (Notification.permission === "default")
		Notification.requestPermission();

	if (state.remaining === 0) {
		const section = options.sections[getSection(state.index)];
		state.remaining = section.duration;
		dbg(section.label);
	}

	worker.postMessage("start");
	state.running = true;
};

const stop = () => {
	worker.postMessage("stop");
	state.running = false;
};

const tick = () => {
	state.remaining--;
	dbg(state.remaining);
	if (state.remaining === 0) {
		worker.postMessage("stop");
		state.running = false;
		state.index++;

		const section = options.sections[getSection(state.index)];
		new Notification("Time's up!", {
			body: `Next up: ${section.label}`,
			icon: icon.toDataURL("image/png")});
	}
};

worker.addEventListener("message", tick);

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

// dynamic icon
const icon = document.createElement("canvas");
const iconCtx = icon.getContext("2d");
icon.width = icon.height = 64;
iconCtx.rotate(0.3);
iconCtx.fillStyle = "red";
iconCtx.fillRect(20, 0, 40, 40);
iconCtx.fillStyle = "green";
iconCtx.fillRect(30, 20, 10, 10);
const link = document.getElementById("icon");
link.href = icon.toDataURL(link.type);

// save options
localStorage.setItem("tomato-options", JSON.stringify(options));
localStorage.getItem("tomato-options");

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