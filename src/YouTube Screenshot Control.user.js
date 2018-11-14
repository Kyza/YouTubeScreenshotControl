// ==UserScript==
// @name         YouTube Screenshot Control
// @namespace    https://www.youtube.com/
// @version      1.1.1.0
// @description  Easily take screenshots of YouTube videos.
// @author       Kyza
// @match        *://www.youtube.com/*
// @grant        none
// @downloadURL  https://github.com/KyzaGitHub/YouTubeScreenshotControl/raw/master/src/YouTube%20Screenshot%20Control.user.js
// @updateURL    https://github.com/KyzaGitHub/YouTubeScreenshotControl/raw/master/src/YouTube%20Screenshot%20Control.user.js
// ==/UserScript==

(function() {
    'use strict';

    var firstPoint = true;
    var mouse1X = 0;
    var mouse1Y = 0;
    var mouse2X = 0;
    var mouse2Y = 0;

    var displayedImage = new Image();

    function fadeTo(element, time, endOp, callback) {
        element.style.transitionDuration = (time/1000) + "s";
        setTimeout(() => {
            element.style.opacity = endOp;
        }, 10);

        setTimeout(() => {
            // Make sure the callback is a function.
            if (typeof callback === "function") {
                // Call it, since we have confirmed it is callable.
                callback();
            }
        }, time + 10);
    }


    var keys = {37: 1, 38: 1, 39: 1, 40: 1};

    function preventDefault(e) {
        e = e || window.event;
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.returnValue = false;
    }

    function preventDefaultForScrollKeys(e) {
        if (keys[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }

    function disableScroll() {
        document.body.setAttribute("style", "overflow: hidden;");
        window.scrollTo(0, 0);
    }

    function enableScroll() {
        document.body.setAttribute("style", "");
    }

    function exitFullscreen() {
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } catch (exception) {}
    }



    var downloadURI = function(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // The method to take the screenshot.
    var takeScreenshot = function(element) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        // Change the size here
        canvas.width = parseInt(element.style.width);
        canvas.height = parseInt(element.style.height);
        ctx.drawImage(element, 0, 0, canvas.width, canvas.height);

        showImage(canvas);
    }

    async function AltP(e) {
        var evtobj = window.event? event : e;
        if (evtobj.keyCode == 80 && evtobj.altKey) {
            pause(document.querySelector("video"));
            exitFullscreen();
            takeScreenshot(document.querySelector("video"));
        }
    }

    function pause(video) {
        if (!video.paused && !video.ended) {
            video.click();
        }
    }

    function showImage(canvas) {
        // Grayed out section.
        var grayed = document.createElement("div");
        grayed.setAttribute("style", "z-index: 2000000000; position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; background-color: black; backdrop-filter: blur(5px);");
        grayed.style.opacity = 0;
        document.body.parentNode.appendChild(grayed);

        // Image to display.
        var displayCanvas = document.createElement("canvas");
        //        displayImage.setAttribute("src", canvas.toDataURL("image/png"));
        displayCanvas.setAttribute("style", "z-index: 2000000001; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); filter: drop-shadow(8px 8px 10px black); cursor: crosshair;");
        //        displayImage.style.opacity = 0;

        var context = displayCanvas.getContext("2d");

        displayedImage = new Image();
        displayedImage.src = canvas.toDataURL("image/png");
        displayedImage.onload = () => {
            displayCanvas.setAttribute("width", displayedImage.width);
            displayCanvas.setAttribute("height", displayedImage.height);

            context.drawImage(displayedImage, 0, 0);
        };

        document.body.parentNode.appendChild(displayCanvas);

        disableScroll();

        grayed.onclick = () => {
            // Make sure the user doesn't click again and break the script.
            grayed.onclick = null;
            firstPoint = true;
            hideImage();
        };

        displayCanvas.onclick = function(event) {
            var rect = this.getBoundingClientRect();
            if (firstPoint) {
                mouse1X = event.clientX - rect.left;
                mouse1Y = event.clientY - rect.top;
            } else {
                mouse2X = event.clientX - rect.left;
                mouse2Y = event.clientY - rect.top;

                this.setAttribute("width", Math.abs(this.width - mouse1X - (this.width - mouse2X)));
                this.setAttribute("height", Math.abs(this.height - mouse1Y - (this.height - mouse2Y)));

                context.clearRect(0, 0, canvas.width, canvas.height);

                console.log(mouse1X);
                console.log(mouse2X);
                console.log((mouse1X <= mouse2X ? Math.abs(mouse2X - mouse1X) : Math.abs(mouse1X - mouse2X)));
                console.log(mouse1Y);
                console.log(mouse2Y);
                console.log((mouse1Y <= mouse2Y ? Math.abs(mouse2Y - mouse1Y) : Math.abs(mouse1Y - mouse2Y)));

                context.drawImage(displayedImage,
                                  (mouse1X <= mouse2X ? mouse1X : mouse2X), (mouse1Y <= mouse2Y ? mouse1Y : mouse2Y),
                                  Math.abs(mouse2X - mouse1X), Math.abs(mouse2Y - mouse1Y),
                                  0, 0,
                                  this.width, this.height);

                displayedImage = new Image();
                displayedImage.src = this.toDataURL("image/png");
            }

            firstPoint = !firstPoint;
        };

        fadeTo(grayed, 400, 0.85, () => {});
        fadeTo(displayCanvas, 400, 1, () => {});
    }

    async function hideImage() {
        fadeTo(document.body.parentNode.childNodes[document.body.parentNode.childNodes.length-1], 400, 0, () => {});
        fadeTo(document.body.parentNode.childNodes[document.body.parentNode.childNodes.length-2], 400, 0, () => {
            // Remove the image and the grayed out section.
            document.body.parentNode.removeChild(document.body.parentNode.childNodes[document.body.parentNode.childNodes.length-1]);
            document.body.parentNode.removeChild(document.body.parentNode.childNodes[document.body.parentNode.childNodes.length-1]);

            enableScroll();
        });
    }


    document.onkeydown = AltP;

    var initCompleted = false;
    if (document.getElementsByClassName("ytp-chrome-controls")[0]) {
        init();
    }

    var oldLocation = window.location.href;
    setInterval(function() {
        console.log(initCompleted);
        if (document.getElementsByClassName("ytp-chrome-controls")[0] && !initCompleted) {
            console.log(document.getElementsByClassName("ytp-chrome-controls")[0]);
            // The page changed, make sure to add the control if it isn't there.
            oldLocation = window.location.href;
            init();
        }
    }, 1000);

    function init() {
        // Create the screenshot button.
        var screenshotButton = document.createElement("button");
        screenshotButton.setAttribute("class", "ytp-button");
        screenshotButton.setAttribute("title", "Screenshot Video");
        screenshotButton.setAttribute("aria-pressed", "false");
        screenshotButton.setAttribute("style", "vertical-align: top;");

        // Add the button's image.
        var buttonImage = document.createElement("img");
        buttonImage.setAttribute("src", "https://image.flaticon.com/icons/png/512/54/54217.png");
        buttonImage.setAttribute("width", "55%");
        buttonImage.setAttribute("height", "55%");
        buttonImage.setAttribute("style", "filter: brightness(0) invert(1); vertical-align: middle; display: block; margin-left: auto; margin-right: auto;");
        screenshotButton.appendChild(buttonImage);

        // Add the screenshot button to the controls.
        // ytp-right-controls
        var rightControls = document.getElementsByClassName("ytp-right-controls")[0];
        if (rightControls) {
            rightControls.insertBefore(screenshotButton, rightControls.childNodes[0] || null);
        }

        buttonImage.onclick = () => {
            pause(document.querySelector("video"));
            exitFullscreen();
            takeScreenshot(document.querySelector("video"));
        };

        initCompleted = true;
    }
})();
