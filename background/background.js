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
        console.log(request.dataValues, request.dataKeys, request.timeValues);
        var dataValues = JSON.stringify(request.dataValues);
        var dataKeys = JSON.stringify(request.dataKeys);
        var timeValues = JSON.stringify(request.timeValues);
        createDocument(dataValues, dataKeys, timeValues);
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
function createDocument(data, key, time) {
    console.log("creating html");

    let now = new Date();
    let currentTime = now.getHours() + ':' + (now.getMinutes().toString());
    let currentDate = now.getFullYear() + '-' + (now.getMonth() + 1).toString() + '-' + now.getDate().toString();

    if (template === "") {
        getTemplate();
    }

    template = template.replace('[%%dataValue%%]', data);
    template = template.replace('[%%dataKey%%]', key);
    template = template.replace('[%%timeValue%%]', time);
    template = template.replace('[%%currentDate%%]', currentDate);
    template = template.replace('[%%currentTime%%]', currentTime);

    console.log("Final Template created");

    filename = "attendance_" + currentDate;
    let blob = new Blob([template], { type: 'text/html;charset=utf-8' });
    let element = document.createElement("a")
    element.download = filename;
    element.href = window.webkitURL.createObjectURL(blob);
    element.click();

}

function getTemplate() {

    var client = new XMLHttpRequest();
    client.open('GET', '/background/template.html');
    client.onreadystatechange = function () {
        template = client.responseText;
        console.log("Template created");
    }
    client.send();

}