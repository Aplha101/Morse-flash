async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } } // Use the back camera
    });
    const videoElement = document.getElementById('video');
    videoElement.srcObject = stream;

    // Add brightness detection logic here (for decoding Morse code)
    detectBrightness(stream);
  } catch (error) {
    console.error("Error accessing camera:", error);
    document.getElementById('output').textContent = "Unable to access the camera.";
  }
}

function detectBrightness(stream) {
  // Set up a canvas for brightness detection
  const video = document.getElementById('video');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const output = document.getElementById('output');
  const morseOutput = document.getElementById('morseOutput');  // Morse code output
  const textOutput = document.getElementById('textOutput');    // English text output

  let morseCode = '';  // To store the detected Morse code
  let startTime = Date.now();
  let lastBrightness = 0;  // To track brightness changes

  setInterval(() => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Analyze brightness by sampling pixel data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let brightnessSum = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      // Calculate brightness from RGB values
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = (r + g + b) / 3;
      brightnessSum += brightness;
    }

    const avgBrightness = brightnessSum / (pixels.length / 4);

    // Check if brightness exceeds a certain threshold (representing light)
    if (avgBrightness > 150) {
      if (lastBrightness <= 150) {
        const duration = Date.now() - startTime;
        if (duration < 500) {
          morseCode += '.'; // Dot detected
        } else if (duration < 1500) {
          morseCode += '_'; // Dash detected
        }
        startTime = Date.now(); // Reset time for next signal
        morseOutput.textContent = `Morse Code: ${morseCode}`; // Update Morse code display
      }
    } else {
      if (lastBrightness > 150 && morseCode.length > 0) {
        // End of signal (space between letters or words)
        if (Date.now() - startTime > 1500) {
          morseCode += ' '; // Space between words
          morseOutput.textContent = `Morse Code: ${morseCode}`; // Update Morse code display
          // Convert Morse code to text
          const translatedText = morseToText(morseCode.trim());
          textOutput.textContent = `English Translation: ${translatedText}`;
        }
      }
    }

    lastBrightness = avgBrightness;

  }, 100); // Check every 100 ms
}

// Convert Morse code to English
function morseToText(morseCode) {
  const MORSE_CODE_MAP = {
    '._': 'A', '_...': 'B', '_._.': 'C', '_..': 'D', '.': 'E', '.._.': 'F', '__.': 'G',
    '....': 'H', '..': 'I', '.___': 'J', '_._': 'K', '._..': 'L', '__': 'M', '_.': 'N',
    '___': 'O', '.__.': 'P', '__._': 'Q', '._.': 'R', '...': 'S', '_': 'T', '.._': 'U',
    '..._': 'V', '.__': 'W', '_.._': 'X', '_.__': 'Y', '__..': 'Z', '_____': '0', '.____': '1',
    '..___': '2', '...__': '3', '...._': '4', '.....': '5', '_....': '6', '__...': '7', '___..': '8',
    '____.': '9', ' ': ' '
  };

  return morseCode.split(' ').map(symbol => MORSE_CODE_MAP[symbol] || '').join('');
}

// Start the camera on page load
startCamera();
