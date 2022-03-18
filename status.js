function statusMsg(parent, title, text, cls, timeout) {
  var div = document.createElement("div");
  div.id = "status";
  div.className = "alert alert-" + cls + " alert-dismissible m-2 p-1";
  var strong = document.createElement("strong");
  strong.innerText = title;
  div.appendChild(strong);
  div.append(" " + text);
  parent.appendChild(div);
  setTimeout(function () {
    parent.removeChild(div);
  }, timeout || 3000);
}

function statusSuccess(text) {
  var body = document.getElementsByTagName("body")[0];
  statusMsg(body, "Success!", text, "success", 3000);
}

function statusFail(text) {
  var body = document.getElementsByTagName("body")[0];
  statusMsg(body, "Error!", text, "error", 3000);
}

function initProgressBar(parent, id, text, minVal, maxVal) {
  var progress = document.createElement("div");
  progress.id = id;
  progress.className = "progress rounded p-1 m-2";
  progress.style = "height: 40px;"
  var progress_bar = document.createElement("div");
  progress_bar.id = id + "_bar";
  progress_bar.className = "progress-bar progress-bar-striped bg-info";
  progress_bar.role = "progressbar";
  progress_bar.ariaValueNow = minVal;
  progress_bar.ariaValueMin = minVal;
  progress_bar.ariaValueMax = maxVal;
  progress_bar.innerText = text;
  progress_bar.style = "width: 0%";

  progress.appendChild(progress_bar);
  parent.appendChild(progress);

  return [function (curVal) {
    if (curVal < progress_bar.ariaValueMin) {
      curVal = progress_bar.ariaValueMin;
    }
    if (curVal > progress_bar.ariaValueMax) {
      curVal = progress_bar.ariaValueMax;
    }

    progress_bar.ariaValueNow = curVal;
    var percent = (progress_bar.ariaValueNow / (progress_bar.ariaValueMax - progress_bar.ariaValueMin)) * 100;
    progress_bar.style = "width: " + percent + "%;";
  }, function (text) {
    parent.removeChild(progress);
    var div = document.createElement("div");
    div.className = "alert alert-success m-2 p-1 text-center";
    div.innerText = text;
    parent.appendChild(div);
  }]
}