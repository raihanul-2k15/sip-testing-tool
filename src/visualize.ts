// window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

export const initVisualizer = function (mediaStream: MediaStream, canvas: HTMLCanvasElement) {
    const audioCtx = new AudioContext();
    const audioSrc = audioCtx.createMediaStreamSource(mediaStream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;

    audioSrc.connect(analyser);
    // analyser.connect(audioCtx.destination);

    const cwidth = canvas.width,
        cheight = canvas.height - 2,
        barCount = 8,
        desiredMaxFreq = 8000,
        gap = 2,
        barWidth = (cwidth - (barCount - 1) * gap) / barCount,
        binsPerBar = Math.round((analyser.frequencyBinCount * (desiredMaxFreq / (audioCtx.sampleRate / 2))) / barCount),
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    function renderFrame() {
        ctx.clearRect(0, 0, cwidth, cheight);

        const amplitudes = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(amplitudes);
        const heights = getBarHeights(amplitudes);

        for (let i = 0; i < barCount; i++) {
            const h = heights[i];
            ctx.fillStyle = '#0f0';
            ctx.fillRect(i * (barWidth + gap), cheight - (h / 255) * cheight, barWidth, cheight); //the meter
        }
        requestAnimationFrame(renderFrame);
    }
    renderFrame();

    function getBarHeights(amplitudes: Uint8Array): number[] {
        const heights: number[] = [];
        for (let i = 0; i < barCount; i++) {
            let total = 0;
            for (let j = 0; j < binsPerBar; j++) {
                total += amplitudes[i * binsPerBar + j];
            }
            heights.push(total / binsPerBar);
        }
        return heights;
    }
};
