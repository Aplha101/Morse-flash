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

    // Check if brightness exceeds a certain threshold
    if (avgBrightness > 150) {
      output.textContent = "Light detected (Dot or Dash)";
    } else {
      output.textContent = "No light detected";
    }
  }, 100);
}

// Start the camera on page load
startCamera();