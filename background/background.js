// For Declearative Content
chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
  chrome.declarativeContent.onPageChanged.addRules([
    {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostEquals: "developer.chrome.com" },
        }),
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()],
    },
  ]);
});

// Event Listener
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.dist === "background") {
    createDocument(
      request.dataValues,
      request.participantNames,
      request.timeValues,
      request.meetingId
    );
    sendResponse("Received by background script");
  } else if (request.dist === "content") {
    // To send back your response  to the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, request);
    });
    sendResponse("Received by background script");
  }
});

// function for HTML Creation
async function createDocument(dataValues, key, timeValues, meetingId) {
  var template = "";
  let now = new Date();
  let currentTime = now.toLocaleTimeString("en-US", { time: "medium" });
  let currentDate = now.toLocaleDateString("en-IN", { dateStyle: "medium" });

  var thead = "";
  var tbody = "";

  // Time Value Header Create
  for (let el of timeValues) {
    thead += "<th>" + el + "</th>\n";
  }

  // Data Value Create
  for (let el of key) {
    let sn = "<td>" + (key.indexOf(el) + 1) + "</td>";
    let name = "<td>" + el + "</td>";
    let t = dataValues[el];
    let tdata = "";
    for (let i of timeValues) {
      if (t.includes(i)) {
        tdata += '<td class="present">' + "<p>P</p>" + "</td>";
      } else {
        tdata += '<td class="absent">' + "A" + "</td>";
      }
    }
    tbody += "<tr>" + sn + name + tdata + "</tr>";
  }

  template = await getTemplate;

  template = template.replace("[%%title%%]", currentDate + " " + currentTime);
  template = template.replace("[%%date%%]", currentDate);
  template = template.replace("[%%time%%]", currentTime);
  template = template.replace("[%%meetID%%]", meetingId);
  template = template.replace("[%%tableHead%%]", thead);
  template = template.replace("[%%tableBody%%]", tbody);

  filename = "attendance_" + currentDate + ".html";
  var blob = new Blob([template], { type: "text/html;charset=utf-8" });
  let url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: filename,
  });
}

const getTemplate = new Promise((resolve, reject) => {
  var client = new XMLHttpRequest();
  client.open("GET", "/background/template.html");
  client.onreadystatechange = (_) => {
    if (client.readyState === 4) {
      resolve(client.responseText);
    }
  };
  client.send();
});
