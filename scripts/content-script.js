// Global Variables
var dataStorage = {};       // Data Variable
var participantNames = [];   // For Key Storage
var timeStamp = [];         // For Time Storage
var interval_id;            // For start and stop Monitoring
var meetingId;             // For storing Meeting ID

// For Push to Talk Feature
$(document).keydown(function (event) {
    // var keycode = (event.keyCode ? event.keyCode : event.which);
    if (event.which == 32) {
        if (event.ctrlKey) {
            $("div[data-tooltip*='camera']").click();
        }
        else {
            $("div[data-tooltip*='microphone']").click();
        }
    }
});

// Function to Fetch List of Participants
function getListOfParticipants() {
    let data = [];
    for (let i of $("[data-participant-id], [data-requested-participant-id]")) {
        let name = i.outerText || i.innerText;
        // Skip if Name is You
        if (name == "You") {
            continue;
        }
        // Remove Unnecessary things from name
        name = name.replace('\n', '');
        name = name.replace('Hide Participant', '');
        name = name.trim();
        data.push(name);
    }
    return data;
}

// Function to Log Participants data with TimeStamp
function logParticipantsData() {
    let now = new Date();
    let currentTime = now.getHours() + ':' + now.getMinutes().toString();
    let data = getListOfParticipants(); // Returns current Name List of Participants
    console.log(data);

    // Loops through Participants list 
    for (let name of data) {
        let time = dataStorage[name] || [];
        time.push(currentTime);
        dataStorage[name] = time;
        if (!participantNames.includes(name)) {
            participantNames.push(name);
        }
    }
    timeStamp.push(currentTime);
    console.log(dataStorage);
}

// Function to get Meeting ID
function getMeetingId() {
    let id = window.location.href;
    id = id.split('/')[3];
    if (id === "") {
        console.log("Not a Meeting");
        return false;
    }
    if (meetingId !== id) {
        clearData();
        console.log("New Meeting");
    }
    meetingId = id;
    return true;
}

// Function to Start Monitoring
function startMonitoring(time = 300000) {
    stopMonitoring();
    // getMeetingId returns false if not a meeting
    if (!getMeetingId()) {
        console.log("Not Starting Service. Because it is not a Meeting.");
        return false;
    }
    logParticipantsData(); // Logs data on Start
    interval_id = setInterval(function () {
        logParticipantsData(); // Logs data on Specific Intervel
    }, time);
    console.log('started');
}

// Function to Stop Monitoring
function stopMonitoring() {
    if (!(interval_id == undefined)) {
        clearInterval(interval_id);
        interval_id = undefined;
    }
    console.log('stoped');
}

// Function to send data to Background script
function sendData() {
    chrome.runtime.sendMessage({ dist: "background", dataValues: dataStorage, participantNames: participantNames, timeValues: timeStamp, meetingId: meetingId }, res => {
        console.log(res);
    });
    console.log('data sent');
}

// Function to clear dataStorage
function clearData() {
    dataStorage = {};
    participantNames = [];
    timeStamp = [];
    console.log('cleared');
}


// Event Listiner
chrome.runtime.onMessage.addListener((request, sender, response) => {
    if (request.dist === "content") {
        console.log(request);
        if (getMeetingId()) {
            let action = request.action;
            if (action === "start") {
                let delay = request.delay;
                delay = parseInt(delay);
                if (isNaN(delay)) {
                    delay = 5;
                }
                let t_mil = delay * 60000;

                startMonitoring(t_mil);
                sendResponse("Started");
            }
            else if (action === "stop") {
                stopMonitoring();
                sendResponse("Stopped");
            }
            else if (action === "save") {
                sendData();
                sendResponse("Downloading");
            }
            else if (action == "clear") {
                clearData();
                sendResponse("Cleared");
            }
        }
        else {
            sendResponse("Not a Meeting");
        }
        response("Received by Content Script");
    }
});

// Function to send data to Popup
function sendResponse(data) {
    chrome.runtime.sendMessage({ dist: "popup", data: data }, (res) => {
        console.log(res);
    });
}