const SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;

const MORSE_CODE_MAP = {
  'A': '._',
  'B': '_...',
  'C': '_._.',
  'D': '_..',
  'E': '.',
  'F': '.._.',
  'G': '__.',
  'H': '....',
  'I': '..',
  'J': '.___',
  'K': '_._',
  'L': '._..',
  'M': '__',
  'N': '_.',
  'O': '___',
  'P': '.__.',
  'Q': '__._',
  'R': '._.',
  'S': '...',
  'T': '_',
  'U': '.._',
  'V': '..._',
  'W': '.__',
  'X': '_.._',
  'Y': '_.__',
  'Z': '__..',
  '0': '_____',
  '1': '.____',
  '2': '..___',
  '3': '...__',
  '4': '...._',
  '5': '.....',
  '6': '_....',
  '7': '__...',
  '8': '___..',
  '9': '____.',
  ' ': ' '
};

function textToMorse(text) {
  return text.toUpperCase().split('').map(char => MORSE_CODE_MAP[char] || '').join(' ');
}

if (SUPPORTS_MEDIA_DEVICES) {
  navigator.mediaDevices.enumerateDevices().then(devices => {
    const cameras = devices.filter(device => device.kind === 'videoinput');

    if (cameras.length === 0) {
      console.error('No camera found on this device.');
      return;
    }

    const camera = cameras.find(cam => cam.label.toLowerCase().includes('back')) || cameras[cameras.length - 1];

    navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: camera.deviceId,
        facingMode: "environment",
        height: { ideal: 1080 },
        width: { ideal: 1920 }
      }
    }).then(stream => {
      const track = stream.getVideoTracks()[0];

      if (!('torch' in track.getSettings())) {
        console.warn('Torch is not supported on this device.');
        return;
      }

      let loopEnabled = false;

      function flashMorseCode(morseCode) {
        let index = 0;

        function flashNext() {
          if (index >= morseCode.length) {
            if (loopEnabled) {
              setTimeout(() => flashMorseCode(morseCode), 1000);
            }
            return;
          }

          let symbol = morseCode[index];
          index++;

          if (symbol === '.') {
            track.applyConstraints({ advanced: [{ torch: true }] });
            setTimeout(() => {
              track.applyConstraints({ advanced: [{ torch: false }] });
              setTimeout(flashNext, 200);
            }, 200);
          } else if (symbol === '_') {
            track.applyConstraints({ advanced: [{ torch: true }] });
            setTimeout(() => {
              track.applyConstraints({ advanced: [{ torch: false }] });
              setTimeout(flashNext, 200);
            }, 600);
          } else if (symbol === ' ') {
            setTimeout(flashNext, 800);
          } else {
            flashNext();
          }
        }

        flashNext();
      }

      document.querySelector('.flash').addEventListener('click', () => {
        let morseCode = document.getElementById('morseInput').value.trim();
        flashMorseCode(morseCode);
      });

      document.querySelector('.loop-toggle').addEventListener('click', function() {
        loopEnabled = !loopEnabled;
        this.textContent = loopEnabled ? 'Loop: ON' : 'Loop: OFF';
      });

      document.querySelector('.convert').addEventListener('click', () => {
        let text = document.getElementById('textInput').value.trim();
        let morseCode = textToMorse(text);
        document.getElementById('morseInput').value = morseCode;
      });

    }).catch(error => {
      console.error('Error accessing camera:', error);
    });
  });


} else {
  console.error('Media devices are not supported in this browser.');
}