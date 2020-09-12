console.log("Background Script loaded");

// For Declearative Content
chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'developer.chrome.com' },
        })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
});

// Event Listener
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("Data Received");
    console.log(request);
    if (request.action === "download") {
        console.log("Download Section");
        console.log(request.dataValues, request.participantNames, request.timeValues, request.meetingId);
        createDocument(request.dataValues, request.participantNames, request.timeValues, request.meetingId);
    }
    else {
        // To send back your response  to the current tab
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, request, function (response) {
                console.log(response);
            });

        })
    }
    sendResponse("Done");
}
);

// Variable for Template
var template = "";

// function for HTML Creation
function createDocument(dataValues, key, timeValues, meetingId) {
    let now = new Date();
    let currentTime = now.getHours() + ':' + (now.getMinutes().toString());
    let currentDate = now.getFullYear() + '-' + (now.getMonth() + 1).toString() + '-' + now.getDate().toString();

    var thead = "";
    var tbody = "";

    // Time Value Header Create
    for (let el of timeValues) {
        thead += '<th>' + el + '</th>\n';
    }

    // Data Value Create
    for (let el of key) {
        let sn = '<td>' + (key.indexOf(el) + 1) + '</td>';
        let name = '<td>' + el + '</td>';
        let t = dataValues[el];
        let tdata = "";
        for (let i of timeValues) {
            if (t.includes(i)) {
                tdata += '<td class="present">' + "<p>P</p>" + '</td>';
            }
            else {
                tdata += '<td class="absent">' + "A" + '</td>';
            }
        }
        tbody += '<tr>' + sn + name + tdata + '</tr>';
    }

    if (template === "") {
        getTemplate();
        // TODO : Need Some Code For Waiting untill template loads
    }
    console.log("HTML creation started");

    template = template.replace('[%%title%%]', (currentDate + " " + currentTime));
    template = template.replace('[%%date%%]', currentDate);
    template = template.replace('[%%time%%]', currentTime);
    template = template.replace('[%%meetID%%]', meetingId);
    template = template.replace('[%%tableHead%%]', thead);
    template = template.replace('[%%tableBody%%]', tbody);


    console.log("Final Template created");

    filename = "attendance_" + currentDate + ".html";
    var blob = new Blob([template], { type: 'text/html;charset=utf-8' });
    let url = URL.createObjectURL(blob);
    chrome.downloads.download({
        url: url,
        filename: filename
    });
}
var client;
function getTemplate() {
    client = new XMLHttpRequest();
    client.open('GET', '/background/template.html');
    client.onreadystatechange = function () {
        template = client.responseText;
        console.log("Template created");
    }
    client.send();
}