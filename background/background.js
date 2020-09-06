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

        createDocument(request.dataValues, request.dataKeys, request.timeValues);
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

    let html = template;
    console.log(html.toString());
    console.log(template);


    html = html.replace('[%%dataValue%%]', data);
    html = html.replace('[%%dataKey%%]', key);
    html = html.replace('[%%timeValue%%]', time);
    html = html.replace('[%%currentDate%%]', currentDate);
    html = html.replace('[%%currentTime%%]', currentTime);

    console.log(html);
}

function getTemplate() {

    var client = new XMLHttpRequest();
    client.open('GET', '/background/template.html');
    client.onreadystatechange = function () {
        template = client.responseText;
        // console.log(typeof (template));
        // console.log(template);

    }
    client.send();
}