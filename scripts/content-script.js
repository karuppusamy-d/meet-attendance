console.log("content script Loaded");
$(document).keydown(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    console.log("Key pressed" + keycode);
    if (keycode == 32) {
        $("div[data-tooltip*='Turn on microphone']").click();
    }
});
