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

let count = 0;
const worker = new Worker("worker.js");
worker.addEventListener("message", e => document.title = ++count);
worker.postMessage("start");
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