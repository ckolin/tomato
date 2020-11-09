const dbg = (obj) => { console.log(obj); return obj; };
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const options = {
	durations: {
		work: 25,
		shortBreak: 5,
		longBreak: 15
	},
	enableNotifications: true
};

ctx.lineWidth = 20;
ctx.lineCap = "round";
ctx.strokeStyle = "green";
ctx.arc(50, 50, 25, 2, 4);
ctx.stroke();
ctx.beginPath();
ctx.strokeStyle = "red";
ctx.arc(50, 50, 25, -0.5 * Math.PI, 2);
ctx.stroke();

let count = 0;
const worker = new Worker("worker.js");
worker.addEventListener("message", e => document.title = ++count);
worker.postMessage("start");

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
// dark/light theme from system setting

// web worker for time updates