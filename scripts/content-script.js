// Global Variables
var dataStorage = {}; // Data Variable
var participantNames = []; // For Key Storage
var timeStamp = []; // For Time Storage
var interval_id; // For start and stop Monitoring
var meetingId; // For storing Meeting ID

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
    name = name.replace("\n", "");
    name = name.replace("Hide Participant", "");
    name = name.trim();
    data.push(name);
  }
  return data;
}

// Function to Log Participants data with TimeStamp
function logParticipantsData() {
  let now = new Date();
  let currentTime = now.getHours() + ":" + now.getMinutes().toString();
  let data = getListOfParticipants(); // Returns current Name List of Participants

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
}

// Function to get Meeting ID
function getMeetingId() {
  // Get Meeting ID
  let id = window.location.href;
  id = id.split("/")[3];

  // If meeting id is not found
  if (!id) {
    return false;
  }

  // Clear Meeting ID if meeting is changed
  if (meetingId !== id) {
    clearData();
  }
  meetingId = id;
  return true;
}

// Function to Start Monitoring
function startMonitoring(time = 300000) {
  stopMonitoring();
  // getMeetingId returns false if not a meeting
  if (!getMeetingId()) {
    return false;
  }
  // Log Participants data with TimeStamp on specified interval
  logParticipantsData();
  interval_id = setInterval(function () {
    logParticipantsData();
  }, time);
}

// Function to Stop Monitoring
function stopMonitoring() {
  if (!(interval_id == undefined)) {
    clearInterval(interval_id);
    interval_id = undefined;
  }
}

// Function to send data to Background script
function sendData() {
  chrome.runtime.sendMessage({
    dist: "background",
    dataValues: dataStorage,
    participantNames: participantNames,
    timeValues: timeStamp,
    meetingId: meetingId,
  });
}

// Function to clear dataStorage
function clearData() {
  dataStorage = {};
  participantNames = [];
  timeStamp = [];
}

// Event Listiner
chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.dist === "content") {
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
      } else if (action === "stop") {
        stopMonitoring();
        sendResponse("Stopped");
      } else if (action === "save") {
        sendData();
        sendResponse("Downloading");
      } else if (action == "clear") {
        clearData();
        sendResponse("Cleared");
      }
    } else {
      sendResponse("Not a Meeting");
    }
    response("Received by Content Script");
  }
});

// Function to send data to Popup
function sendResponse(data) {
  chrome.runtime.sendMessage({ dist: "popup", data: data });
}
