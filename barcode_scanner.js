function initBarcodeReader() {
  window.NP.codeReader = new ZXing.BrowserBarcodeReader();
}

function initInputDevices() {
  window.NP.codeReader.getVideoInputDevices().then((videoInputDevices) => {
    const sourceSelect = document.getElementById('sourceSelect')
    window.NP.selectedDeviceId = videoInputDevices[0].deviceId
    if (videoInputDevices.length > 0) {
      videoInputDevices.forEach((element) => {
        const sourceOption = document.createElement('option')
        sourceOption.text = element.label
        sourceOption.value = element.deviceId
        sourceSelect.appendChild(sourceOption)
      })

      sourceSelect.onchange = () => {
        window.NP.selectedDeviceId = sourceSelect.value;
      }

      document.getElementById('sourceSelectPanel').style.display = 'block';
      document.getElementById('sourceNoDevices').style.display = 'none';
    } else {
      document.getElementById('sourceNoDevices').style.display = 'block';
      document.getElementById('sourceSelectPanel').style.display = 'none';
    }
  }).catch((err) => {
    window.alert(err);
  })
}

async function scanBarcode() {
  try {
    var result = await window.NP.codeReader.decodeOnceFromVideoDevice(window.NP.selectedDeviceId, 'video');
    window.NP.codeReader.reset();

    return result.text;
  } catch(e) {
    return "";
  }
}

function cancelScanning() {
  window.NP.codeReader.reset();
}

function isTokenCorrect(token) {
  return token.length > 2 && /^[A-Za-z\d]+$/.test(token);
}
