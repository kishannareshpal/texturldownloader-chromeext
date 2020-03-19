import * as $ from 'jquery';

let pasted = false;
$('.input-clipboard').on('focus', function () {
  if (!pasted) {
    pasted = document.execCommand('paste');
    const clipboardtext = $('.input-clipboard').val().toString();
    if (isValidURL(clipboardtext)) {
      $('.input').val(clipboardtext);
    }
  }
  $('.input').trigger('focus').trigger('select'); 
})


$(".content").on({
  'focus': function () {
    $('.input').select();
  },

  "keyup": function (event) {
    const keycode: number = (event.keyCode ? event.keyCode : event.which);
    const value = $(".input").val().toString();
    if(keycode == 13){ 
      // Return/enter key was pressed.
      $(".button").attr('disabled', 'true');
      tryToDownload();
    }

    if (!isEmptyOrSpaces(value)) {
      $(".button").removeAttr('disabled');
    } else {
      $(".button").attr('disabled', 'true');
    }
  }
}, ".input")

$(".button").click(function () {
  $(".button").attr('disabled', 'true');
  $(".input").attr('disabled', 'true');
  tryToDownload();
})


function tryToDownload() {
  const url = $('.input').val();
  let msg = {
    kind: "download",
    from: "browser_action",
    content: url
  }
  chrome.runtime.sendMessage(msg);
}



/**
 * Keep listening for messages.
 * This is where i receive the error messages while using {@link chrome.download.downloads} on background script.
 */
chrome.runtime.onMessage.addListener(gotMessage);
/**
 * The method used for when a message is received in this .ts file
 */
function gotMessage(response) {
  if (response.kind == "downloadnotification") {
    // Try download
    if (response.isDownloading) { 
      // Downloading...
      notifyBriefly(true, "Download started..", 3000);

    } else {
      // Failed...
      notifyBriefly(false, "The provided URL is Invalid.")
    }
  }

  $(".button").removeAttr("disabled")
  $(".input").removeAttr("disabled").select();
}


/**
 * Notify using the notification <p> tag in popup.html, with some basic anim.
 * @param isSuccess if the notification type is success, so it uses the proper coloring palette
 * @param message the description of the notification to be shown.
 * @param timeoutInMillis disappearing timeout set in milliseconds. defaults to 2200ms (2.2s)
 */
function notifyBriefly(isSuccess: boolean, message: string, timeoutInMillis?: number) {
  if (timeoutInMillis == undefined) timeoutInMillis = 2200;

  $('.notification').html(message);
  const className = isSuccess ? "success" : "error";
  $('.notification').removeClass("inv")
  $('.notification').addClass([className, "vis"]);
  setTimeout(() => {
    $('.notification').removeClass([className, "vis"]);
    $('.notification').addClass("inv")
    $('.notification').html(null);
  }, timeoutInMillis);
}




/**
 * checks if string is empty, null, undefined or if it made of spaces only.
 * @param str string to be checked.
 * @returns true, otherwise false.
 */
function isEmptyOrSpaces(str: string): Boolean {
  return str === null || str === undefined || str.match(/^ *$/) !== null;
}

/**
 * checks if given string is a valid url.
 * @param str url string
 * @returns true, otherwise false.
 */
function isValidURL(str: string): Boolean {
  const m = str.match(/[(-http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig);
  return m != null;
}