// ==UserScript==
// @name         YouTube Video Screenshot Control
// @namespace    https://www.youtube.com/
// @version      1.0
// @description  Easily take screenshots of YouTube videos.
// @author       Kyza
// @match        *://www.youtube.com/*
// @grant        none
// @downloadURL  https://github.com/KyzaGitHub/YouTubeScreenshotControl/raw/master/src/YouTube%20Video%20Screenshot%20Control.user.js
// @updateURL    https://github.com/KyzaGitHub/YouTubeScreenshotControl/raw/master/src/YouTube%20Video%20Screenshot%20Control.user.js
// ==/UserScript==

(function() {
    'use strict';

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
            document.exitFullscreen();
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
        grayed.style.opacity = 0;
        document.body.parentNode.appendChild(grayed);

        // Image to display.
        var displayImage = document.createElement("img");
        displayImage.setAttribute("src", canvas.toDataURL("image/png"));
        displayImage.setAttribute("style", "z-index: 2000000001; position: absolute; left: 50%; top: 50%; width: 60%; height: auto; transform: translate(-50%, -50%); filter: drop-shadow(8px 8px 10px black);");
        displayImage.style.opacity = 0;
        document.body.parentNode.appendChild(displayImage);

        disableScroll();

        grayed.onclick = () => {
            // Make sure the user doesn't click again and break the script.
            grayed.onclick = null;
            hideImage();
        };

        displayImage.onclick = () => {
            downloadURI(canvas.toDataURL("image/png"), "screenshot.png");
        };

        fadeTo(grayed, 400, 0.85, () => {});
        fadeTo(displayImage, 400, 1, () => {});
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
//    buttonImage.setAttribute("align", "middle middle");
    buttonImage.setAttribute("style", "filter: brightness(0) invert(1); vertical-align: middle; display: block; margin-left: auto; margin-right: auto;");
    screenshotButton.appendChild(buttonImage);

    // Add the screenshot button to the controls.
    // ytp-right-controls
    var rightControls = document.getElementsByClassName("ytp-right-controls")[0];
    rightControls.insertBefore(screenshotButton, rightControls.childNodes[0] || null);

//    screenshotButton.onclick = () => {
//        pause(document.querySelector("video"));
//        takeScreenshot(document.querySelector("video"));
//    };
    buttonImage.onclick = () => {
        pause(document.querySelector("video"));
        document.exitFullscreen();
        takeScreenshot(document.querySelector("video"));
    };

})();