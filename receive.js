
        const video = document.getElementById('video');
        const morseOutput = document.getElementById('morseOutput');
        const textOutput = document.getElementById('textOutput');

        const MORSE_TO_TEXT = {
            '._': 'A', '_...': 'B', '_._.': 'C', '_..': 'D',
            '.': 'E', '.._.': 'F', '__.': 'G', '....': 'H',
            '..': 'I', '.___': 'J', '_._': 'K', '._..': 'L',
            '__': 'M', '_.': 'N', '___': 'O', '.__.': 'P',
            '__._': 'Q', '._.': 'R', '...': 'S', '_': 'T',
            '.._': 'U', '..._': 'V', '.__': 'W', '_.._': 'X',
            '_.__': 'Y', '__..': 'Z',  
            '_____': '0', '.____': '1', '..___': '2', '...__': '3',
            '...._': '4', '.....': '5', '_....': '6', '__...': '7',
            '___..': '8', '____.': '9'
        };

        let isBright = false;
        let lastTime = null;
        let morseCode = '';

        function decodeMorse(morse) {
            return morse.split(' ').map(code => MORSE_TO_TEXT[code] || '').join('');
        }

        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;

                const track = stream.getVideoTracks()[0];
                const imageCapture = new ImageCapture(track);
                analyzeLight(imageCapture);
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        }

        async function analyzeLight(imageCapture) {
            while (true) {
                try {
                    const bitmap = await imageCapture.grabFrame();
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = bitmap.width;
                    canvas.height = bitmap.height;
                    ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);

                    let brightness = calculateBrightness(ctx, bitmap.width, bitmap.height);

                    let now = Date.now();
                    if (brightness > 100) {
                        if (!isBright) {
                            let duration = lastTime ? now - lastTime : 200;
                            morseCode += duration < 400 ? '.' : '_';
                            lastTime = now;
                        }
                        isBright = true;
                    } else {
                        if (isBright) {
                            morseCode += ' ';
                            lastTime = now;
                        }
                        isBright = false;
                    }

                    morseOutput.innerText = morseCode.trim();
                    textOutput.innerText = decodeMorse(morseCode.trim());

                    await new Promise(res => setTimeout(res, 100));
                } catch (err) {
                    console.error("Error processing frame:", err);
                }
            }
        }

        function calculateBrightness(ctx, width, height) {
            let imageData = ctx.getImageData(0, 0, width, height);
            let pixels = imageData.data;
            let sum = 0;

            for (let i = 0; i < pixels.length; i += 4) {
                sum += pixels[i] + pixels[i + 1] + pixels[i + 2];
            }

            return sum / (pixels.length / 4);
        }




        startCamera();