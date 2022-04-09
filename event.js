function addNewCell(new_row, cell_idx, width) {
  var new_cell = new_row.insertCell();
  new_cell.className = "col-" + width;

  var container = document.createElement("div");
  container.className = "container";
  new_cell.appendChild(container);

  var row_container = document.createElement("div");
  row_container.className = "row";
  container.appendChild(row_container);

  return row_container;
}

function addTableRow() {
  var table = document.getElementById("run_positions").getElementsByTagName('tbody')[0];
  var new_row = table.insertRow();
  new_row.className = "container";
  if (window.NP.max_row_idx < new_row.rowIndex) {
    window.NP.max_row_idx = new_row.rowIndex;
  } else {
    window.NP.max_row_idx += 1;
  }

  const new_row_idx = window.NP.max_row_idx;

  var cell_0 = addNewCell(new_row, 0, 2);
  var cell_1 = addNewCell(new_row, 1, 3);
  var cell_2 = addNewCell(new_row, 2, 8);
  var cell_3 = addNewCell(new_row, 3, 1);

  var input = document.createElement("input");
  input.id = "cell_" + new_row_idx + "_" + 0;
  input.type = "text";
  input.className = "form-control col"
  input.placeholder = "NP-1";
  input.onchange = function() {
    localStorage.setItem(this.id, this.value);
  };
  cell_0.appendChild(input);

  var scan_position_button = document.createElement("button");
  scan_position_button.id = "btn_" + new_row_idx + "_" + 0;
  scan_position_button.innerText = "S";
  scan_position_button.className = "btn btn-primary rounded col-md-auto";
  scan_position_button.onclick=function () {
    appendNewBarcode(new_row_idx, 0);
  };
  cell_0.appendChild(scan_position_button);

  var input = document.createElement("input");
  input.id = "cell_" + new_row_idx + "_" + 1;
  input.type = "text";
  input.className = "form-control col"
  input.placeholder = "A123123112";
  input.onchange = function() {
    localStorage.setItem(this.id, this.value);
  };
  cell_1.appendChild(input);

  var scan_token_button = document.createElement("button");
  scan_token_button.id = "btn_" + new_row_idx + "_" + 1;
  scan_token_button.innerText = "S";
  scan_token_button.className = "btn btn-primary rounded col-md-auto";
  scan_token_button.onclick= function () {
    appendNewBarcode(new_row_idx, 1);
  };
  cell_1.appendChild(scan_token_button);

  var input = document.createElement("input");
  input.id = "cell_" + new_row_idx + "_" + 2;
  input.type = "text";
  input.className = "form-control col"
  input.placeholder = "";
  input.oninput = function() {
    localStorage.setItem(this.id, this.value);
  };
  cell_2.appendChild(input);

  var remove_button = document.createElement("button");
  remove_button.id = "remove_btn_" + new_row_idx;
  remove_button.innerText = "Удалить";
  remove_button.className = "btn btn-danger";
  remove_button.onclick = function () {
    var i = this.parentNode.parentNode.parentNode.parentNode.rowIndex;
    table.deleteRow(i - 1);

    let idx = this.id.split("_")[2];
    localStorage.removeItem("cell_" + idx + "_0");
    localStorage.removeItem("cell_" + idx + "_1");
    localStorage.removeItem("cell_" + idx + "_2");
  };
  cell_3.appendChild(remove_button);
}

function removeTableRow(row_idx) {
  var btn = document.getElementById("remove_btn_" + row_idx);
  btn.onclick();
}

async function appendNewBarcode(row_idx, cell_idx) {
  var btn = document.getElementById('btn_' + row_idx + "_" + cell_idx);
  btn.className = "btn rounded col-md-auto btn-danger";
  btn.onclick = function () {
    cancelScanning();

    this.className = "btn rounded col-md-auto btn-primary";
    this.onclick = function () {
      appendNewBarcode(row_idx, cell_idx);
    }
  }

  var token = await scanBarcode();
  console.log(token);

  if (isTokenCorrect(token)) {
    btn.className = "btn rounded col-md-auto btn-primary";
    btn.onclick = function () {
      appendNewBarcode(row_idx, cell_idx);
    }

    console.log(window.NP.participants[token]);
    var cell = document.getElementById('cell_' + row_idx + "_" + cell_idx);
    cell.value = token;
    cell.onchange();

    if (window.NP.participants != null) {
      var full_name = window.NP.participants[token];
      if (full_name != null) {
        var cell = document.getElementById('cell_' + row_idx + "_" + 2);
        cell.value = full_name;
      }
    } else {
      console.log("Need to register new participant");
    }

    if (cell_idx == 0) {
      await appendNewBarcode(row_idx, 1);
    }
  } else {
    statusFail("Token " + token + " is incorrect");
  }
}

function restoreValues() {
  var unique_rows = new Set();
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (/^cell_\d+_\d+$/.test(key)) {
      unique_rows.add(parseInt(key.split("_")[1]));
    }
  }

  var max_row_idx = -1;
  for (var item of unique_rows) {
    if (item > max_row_idx) {
      max_row_idx = item;
    }
  }

  for (var row_idx = 0; row_idx < max_row_idx; row_idx++) {
    addTableRow();
  }

  for (var row_idx = 1; row_idx < max_row_idx + 1; row_idx++) {
    if (!unique_rows.has(row_idx)) {
      removeTableRow(row_idx);
    }
  }

  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (/^cell_\d+_\d+$/.test(key)) {
      var cell = document.getElementById(key);
      try {
        cell.value = localStorage.getItem(key);
      }
      catch(e) {
        
      }
    }
  }
}

function generateFileContent() {
  var content = [];
  for (var i = 1; i <= window.NP.max_row_idx; i++) {
    var row;
    try {
      row = [
        document.getElementById("cell_" + i + "_0").value,
        document.getElementById("cell_" + i + "_1").value,
        document.getElementById("cell_" + i + "_2").value
      ];
    } catch (e) {
      console.log("No " + i + " value");
    }
    if (row != null) {
      content.push(row);
    }
  }

  return content;
}

function generateFile() {
  const content = generateFileContent();

  const lines = content.map(
    (cur_val) => {
      return cur_val.join("\t");
    }
  );

  var event_name = localStorage.getItem("event_name");
  var tsv = lines.join("\n");
  const file = new File([tsv], 'nizhnyprud_' + event_name + '_results.tsv', {
    type: 'text/tab-separated-values',
  });

  return file;
}

function downloadFile(file) {
  const link = document.createElement('a')
  const url = URL.createObjectURL(file)

  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function uploadFile(exts) {
  return new Promise(resolve => {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = exts;
    input.onchange = (e) => {
      var file = e.target.files[0]; 
      var filename = file.name;

      var reader = new FileReader();
      reader.readAsText(file,'UTF-8');

      reader.onload = readerEvent => {
          var content = readerEvent.target.result;
          resolve([filename, content]);
      }
    }
    input.click();
  });
  
}

function saveResults() {
  const file = generateFile();
  downloadFile(file);
}

function parseStopwatch(file_content) {
  var lines = file_content.split(/\r?\n/);
  var data = [];

  var idx = 0;

  Object.values(lines).forEach(line => {
    if (!line) {
      return;
    }

    var chunks = line.split(',');
    if (!chunks) {
      return;
    }
    
    if (chunks.length != 3) {
      return;
    }

    const pos = parseInt(chunks[0]);

    if (!Number.isNaN(pos)) {
      data.push({
        position: pos + 1,
        time: chunks[2],
      });
    }
  });

  return data;
}

function parsePastEvent(file_content) {
  var lines = file_content.split(/\r?\n/);
  var data = [];

  var idx = 0;

  Object.values(lines).forEach(line => {
    if (!line) {
      return;
    }

    var chunks = line.split('\t');
    if (!chunks) {
      return;
    }
    
    if (chunks.length != 3) {
      return;
    }

    const pos = parseInt(chunks[0].trim());

    if (!Number.isNaN(pos)) {
      data.push({
        position: pos,
        token: chunks[1].trim(),
        details: chunks[2].trim(),
      });
    }
  });

  return data;
}

async function prepareResults() {
  const [filename, stopwatch_content] = await uploadFile("txt");
  const records = parseStopwatch(stopwatch_content);

  const content = generateFileContent();

  var lines = []
  for (var i = 0; i < content.length; i++) {
    const pos = parseInt(content[i][0]);
    if (!Number.isNaN(pos)) {
      const record = records.find((v) => { return v.position == pos; })
      const row = [content[i][0], content[i][1], content[i][2], record.time];
      lines.push(row);
    }
  }

  return lines;
}

function isEventNameCorrect(event_name) {
  return (/^\d{4}-\d{2}-\d{2}$/.test(event_name));
}

function startEvent() {
  var event_name = document.getElementById("event_name").value;
  if (isEventNameCorrect(event_name)) {
    localStorage.setItem("event_name", event_name);
    window.location.reload();
  }
}

async function preparePastEvent() {
  const [filename, past_event_content] = await uploadFile("txt");
  const event_name = filename.split('_')[1];
  
  if (isEventNameCorrect(event_name)) {
    localStorage.setItem("event_name", event_name);
  }

  const records = parsePastEvent(past_event_content);
  const sorted_records = records.sort(function (lhs, rhs) {
    if (lhs.position < rhs.position) {
      return -1;
    }
    if (lhs.position < rhs.position) {
      return 1;
    }

    return 0;
  });

  return sorted_records;
}
