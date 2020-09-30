console.log("popup script loaded");

$(document).on('input', '#time', function () {
    $("#timeText")[0].innerText = $("#time")[0].value;
});

$(document).on('click', '#start, #stop, #save, #reset', (e) => {
    delay = $("#time")[0].value;
    chrome.runtime.sendMessage({ action: e.target.id, delay: delay }, res => {
        console.log(res);
    });
})

