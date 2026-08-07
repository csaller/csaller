import QRCode from 'qrcode';

const canvas = document.getElementById('qrCanvas');
const input = document.getElementById('qrInput');
const downloadButton = document.getElementById('downloadBtn');
const emptyState = document.getElementById('emptyState');
const context = canvas.getContext('2d');
const emptyMessage = 'Enter input to create a QR code.';
let renderId = 0;

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  canvas.style.width = '100%';
  canvas.style.height = '100%';
}

async function renderQrCode(value) {
  const currentRenderId = ++renderId;

  if (!value.trim()) {
    clearCanvas();
    emptyState.textContent = emptyMessage;
    emptyState.classList.remove('is-hidden');
    downloadButton.disabled = true;
    return;
  }

  await QRCode.toCanvas(canvas, value, {
    width: 1000,
    margin: 4,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  if (currentRenderId !== renderId) return;

  canvas.style.width = '100%';
  canvas.style.height = '100%';
  emptyState.classList.add('is-hidden');
  downloadButton.disabled = false;
}

function downloadPng() {
  canvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'qr-code.png';
    link.click();

    URL.revokeObjectURL(url);
  }, 'image/png');
}

input.addEventListener('input', () => {
  renderQrCode(input.value).catch(() => {
    clearCanvas();
    emptyState.textContent = 'The QR code failed.';
    emptyState.classList.remove('is-hidden');
    downloadButton.disabled = true;
  });
});

downloadButton.addEventListener('click', downloadPng);

clearCanvas();
