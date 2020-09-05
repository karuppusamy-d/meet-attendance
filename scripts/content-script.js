// Global Variables
var dataStorage = {};   // Data Variable
var interval_id;        // For start and stop Monitoring

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

// Function for Fetching List of Participants
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
    return data;
}

// Function for Loging Participants data with TimeStamp
function logParticipantsData() {
    let now = new Date();
    let currentTime = now.getHours() + ':' + now.getMinutes().toString();
    // let meeting_id = (document.querySelector('[data-unresolved-meeting-id]').getAttribute('data-unresolved-meeting-id')).toString();
    let data = getListOfParticipants();
    for (let i of data) {
        let id = i.id;
        if (dataStorage[id] == undefined) {
            dataStorage[id] = i;
        }
        let timeStamp = dataStorage[id]["timeStamp"] || [];
        timeStamp.push(currentTime);
        dataStorage[id]["timeStamp"] = timeStamp;
    }
    console.log(dataStorage);
}

// Function for Start Monitoring
function startMonitoring(time = 300000) {
    stopMonitoring();
    interval_id = setInterval(function () {
        logParticipantsData();
    }, time);
}

// Function for Stop Monitoring
function stopMonitoring() {
    if (!(interval_id == undefined)) {
        clearInterval(interval_id);
        interval_id = undefined;
    }
}

// Function for clearing dataStorage
function clearData() {
    dataStorage = {};
}
