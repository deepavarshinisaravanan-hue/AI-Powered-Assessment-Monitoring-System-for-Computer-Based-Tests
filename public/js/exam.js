// ===============================
// Assessment Monitoring System
// exam.js
// ===============================

// ---------- Countdown Timer ----------
let totalSeconds = 2 * 60 * 60; // 2 Hours

const timer = document.getElementById("time");

const countdown = setInterval(() => {

    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    timer.innerHTML =
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    if (totalSeconds <= 0) {

        clearInterval(countdown);

        alert("Time is over!");

        window.location.href = "report.html";

    }

    totalSeconds--;

}, 1000);


// ---------- Logout ----------

document.getElementById("logoutBtn").onclick = () => {

    if (confirm("Are you sure you want to logout?")) {

        window.location.href = "login.html";

    }

};


// ---------- Webcam ----------

const video = document.getElementById("video");

async function startCamera() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;

    }

    catch (error) {

        alert("Camera Permission Denied");

    }

}

startCamera();


// ---------- Warning Counter ----------

let warnings = 0;

const warningText = document.getElementById("warningCount");

function addWarning(reason) {

    warnings++;

    warningText.innerHTML = warnings + " / 3";

    alert("Warning : " + reason);

    if (warnings >= 3) {

        alert("Maximum warnings reached.\nExam Submitted.");

        window.location.href = "report.html";

    }

}


// ---------- Tab Switch Detection ----------

document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

        addWarning("Tab Switching Detected");

    }

});


// ---------- Full Screen Detection ----------

document.addEventListener("fullscreenchange", () => {

    if (!document.fullscreenElement) {

        document.getElementById("fullscreenStatus").innerHTML = "OFF";

        document.getElementById("fullscreenStatus").style.color = "red";

        addWarning("Exited Full Screen");

    }

    else {

        document.getElementById("fullscreenStatus").innerHTML = "ON";

        document.getElementById("fullscreenStatus").style.color = "green";

    }

});


// ---------- Disable Right Click ----------

document.addEventListener("contextmenu", (e) => {

    e.preventDefault();

});


// ---------- Disable Common Shortcuts ----------

document.addEventListener("keydown", function (e) {

    if (
        e.key === "F12" ||

        (e.ctrlKey && e.key === "u") ||

        (e.ctrlKey && e.key === "U") ||

        (e.ctrlKey && e.shiftKey && e.key === "I") ||

        (e.ctrlKey && e.shiftKey && e.key === "J") ||

        (e.ctrlKey && e.key === "c") ||

        (e.ctrlKey && e.key === "v")

    ) {

        e.preventDefault();

        addWarning("Restricted Keyboard Shortcut");

    }

});


// ---------- Progress Bar ----------

let progress = 10;

const progressBar = document.getElementById("progressBar");

document.getElementById("nextBtn").onclick = () => {

    if (progress < 100) {

        progress += 10;

        progressBar.style.width = progress + "%";

    }

};

document.getElementById("prevBtn").onclick = () => {

    if (progress > 10) {

        progress -= 10;

        progressBar.style.width = progress + "%";

    }

};


// ---------- Submit ----------

document.getElementById("submitBtn").onclick = () => {

    if (confirm("Submit Exam?")) {

        window.location.href = "report.html";

    }

};


// ---------- Auto Fullscreen ----------

window.onload = () => {

    document.documentElement.requestFullscreen();

};