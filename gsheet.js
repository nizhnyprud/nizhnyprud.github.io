/**
 *  On load, called to load the google auth2 library and API client library.
 */
 function handleClientLoad(success_callback, fail_callback, before_callback) {
  gapi.load('client:auth2', () => {initClient(success_callback, fail_callback, before_callback);});
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient(success_callback, fail_callback, before_callback) {
  var CLIENT_ID = '788445116277-mvh79aip6tbke5m34apbag2uppk9r2fe.apps.googleusercontent.com';
  var API_KEY = 'AIzaSyDgPY0auUUH8DLhdIc6naGOQPncYQkMlsY';
  var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
  var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    gapi.auth2.getAuthInstance().isSignedIn.listen((s) => updateSigninStatus(s, success_callback, fail_callback, before_callback));

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get(), success_callback, fail_callback, before_callback);
  }, function (error) {
    console.error(error);
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn, success_callback, fail_callback, before_callback) {
  if (before_callback != null) {
    before_callback();
  }

  if (isSignedIn) {
    if (success_callback != null) {
      statusSuccess("Авторизация успешна");
      success_callback();
    }
  } else {
    if (fail_callback != null) {
      statusFail("Необходимо авторизоваться");
      fail_callback();
    }
  }
}

async function getAllSheetsTitles(spreadsheetId) {
  var response = await gapi.client.sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId,
  });

  return response.result.sheets.map((sheet) => { return sheet.properties.title; });
}

async function getLastEventTitle(spreadsheetId) {
  var titles = await getAllSheetsTitles(spreadsheetId);
  titles = titles.filter(title => /^\d{4}-\d{2}-\d{2}$/.test(title)).map(title => {
    var tokens = title.split("-");
    return {
      year: parseInt(tokens[0]),
      month: parseInt(tokens[1]),
      date: parseInt(tokens[2]),
    }
  });

  var max_year = Math.max.apply(Math, titles.map(r => r.year));
  titles = titles.filter(r => r.year == max_year);
  var max_month = Math.max.apply(Math, titles.map(r => r.month));
  titles = titles.filter(r => r.month == max_month);
  var max_date = Math.max.apply(Math, titles.map(r => r.date));

  return max_year + "-" + String(max_month).padStart(2, '0') + "-" + String(max_date).padStart(2, '0');
}

async function drawLastEventResults(spreadsheetId, parent) {
  var title = await getLastEventTitle(spreadsheetId);

  var response_header = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: title + "!A1:F1",
  });

  var headers = response_header.result.values[0];

  var table = document.createElement("table");
  table.className = "table table-sm align-middle caption-top";
  parent.appendChild(table);
  
  var caption  =document.createElement("caption");
  caption.className = "fs-4 text-center";
  caption.innerText = "Результаты забега от " + title;
  table.appendChild(caption);

  var thead = document.createElement("thead");
  table.appendChild(thead);

  var tr = document.createElement("tr");
  tr.className = "table-dark";
  thead.appendChild(tr);

  for (idx = 0; idx < headers.length; idx++) {
    var th = document.createElement("th");
    th.scope = "col";
    th.innerText = headers[idx];
    tr.appendChild(th);
  }

  var tbody = document.createElement("tbody");
  table.appendChild(tbody);

  var response_values = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: title + "!A2:F",
  });

  var lines = response_values.result.values;

  for (i = 0; i < lines.length; i++) {
    var tr = document.createElement("tr");
    tbody.appendChild(tr);

    if (lines[i][1] == "Неизвестный") {
      tr.style = "background: whitesmoke;";
      tr.className = "text-muted";
    }
    else {
      tr.className = "text-muted";
    }
    for (j = 0; j < headers.length; j++) {
      var td = document.createElement("td");
      td.scope = "col";
      if (lines[i][j]) {
        td.innerText = lines[i][j];
      }

      if (j >= 3) {
        td.className = "text-center";
      }

      tr.appendChild(td);
    }
  }

  window.NP.range = title;
}

async function modifyEventResult(spreadsheetId, range) {
  var values = [
    [
      "Title6", "Date6", "Caption6", "Body6"
    ],
    [
      "Title7", "Date7", "Caption7", "Body7"
    ],
  ];
  var body = {
    values: values
  };
  var response = await gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId,
    range: window.NP.range,
    valueInputOption: "USER_ENTERED",
    resource: body
  });

  console.log(response);
}

async function getAllParticipants(spreadsheetId) {
  var response_values = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: "Participants!B2:C",
  });

  var lines = response_values.result.values;

  var participants = {};
  for (i = 0; i < lines.length; i++) {
    participants[lines[i][0]] = lines[i][1];
  }

  return participants;
}
