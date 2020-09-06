console.log("Content script loaded");

// Global Variables
var dataStorage = {};       // Data Variable
var participantKeys = [];   // For Key Storage
var timeStamp = [];         // For Time Storage
var interval_id;            // For start and stop Monitoring

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
        let id = (i.dataset.participantId || i.dataset.requestedParticipantId || i.dataset.initialParticipantId).split('/')[3].toString();
        let name = i.outerText || i.innerText;
        if (name == "You") {
            continue;
        }
        let obj = { "name": name, "id": id }
        data.push(obj);
    }
    // console.log(data);
    return data;
}

// Function to Log Participants data with TimeStamp
function logParticipantsData() {
    let now = new Date();
    let currentTime = now.getHours() + ':' + now.getMinutes().toString();
    // let meeting_id = $("[data-unresolved-meeting-id]").getAttribute('data-unresolved-meeting-id').toString();
    let data = getListOfParticipants();
    for (let i of data) {
        let id = i.id;
        if (dataStorage[id] == undefined) {
            dataStorage[id] = i;
        }
        if (!participantKeys.includes(id)) {
            participantKeys.push(id);
        }
        let time = dataStorage[id]["timeStamp"] || [];
        time.push(currentTime);
        timeStamp.push(currentTime);
        dataStorage[id]["timeStamp"] = time;
    }
    console.log(dataStorage);
}

// Function to Start Monitoring
function startMonitoring(time = 300000) {
    stopMonitoring();
    interval_id = setInterval(function () {
        logParticipantsData();
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

// Function to send data
function sendData() {
    chrome.runtime.sendMessage({ action: "download", dataValues: dataStorage, dataKeys: participantKeys, timeValues: timeStamp }, res => {
        console.log(res);
    });
    console.log('data sent');
}

// Function to clear dataStorage
function clearData() {
    dataStorage = {};
    participantKeys = [];
    timeStamp = [];
    console.log('cleared');
}


// Event Listiner
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);
    let action = request.action;
    if (action === "start") {
        let delay = request.delay;
        delay = parseInt(delay);
        if (isNaN(delay)) {
            delay = 5;
        }
        let t_mil = delay * 60000;

        startMonitoring(t_mil);
    }
    else if (action === "stop") {
        stopMonitoring();
    }
    else if (action === "save") {
        sendData();
    }
    else if (action == "reset") {
        clearData();
    }
    sendResponse("Received by Content Script");
})
