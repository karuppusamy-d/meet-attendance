$(document).on("input", "#time", function () {
  $("#timeText")[0].innerText = $("#time")[0].value;
});

$(document).on("click", "#start, #stop, #save, #clear", (e) => {
  delay = $("#time")[0].value;
  chrome.runtime.sendMessage(
    { dist: "content", action: e.target.id, delay: delay },
    (res) => {
      if (!res) {
        $(".status")[0].innerText = "Error Connecting";
      }
    }
  );
});

// Event Listener for Status
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.dist === "popup") {
    $(".status")[0].innerText = request.data;
    sendResponse("Received by Popup Script");
  }
});
