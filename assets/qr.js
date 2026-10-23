import QRCode from 'qrcode';

const canvas = document.getElementById('qrCanvas');
const input = document.getElementById('qrInput');
const downloadButton = document.getElementById('downloadBtn');
const emptyState = document.getElementById('emptyState');
const context = canvas.getContext('2d');
const SIZE = 1000;
let renderId = 0;

const modes = {
  qr: { emptyMessage: 'Enter input to create a QR code.', filename: 'qr-code.png' },
  ean13: { emptyMessage: 'Enter 12 or 13 digits to create an EAN-13 barcode.', filename: 'ean-13.png' },
};

// EAN-13 encoding tables. L digits are 7-module patterns; R is the complement
// of L and G is R reversed. The first digit selects which of L/G encodes digits 2-7.
const L_CODES = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const R_CODES = L_CODES.map((code) => [...code].map((bit) => (bit === '0' ? '1' : '0')).join(''));
const G_CODES = R_CODES.map((code) => [...code].reverse().join(''));
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

function getMode() {
  return document.querySelector('input[name="mode"]:checked').value;
}

function checkDigit(digits) {
  const sum = [...digits].reduce((total, digit, i) => total + Number(digit) * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}

// Returns the 13 digits (check digit appended when 12 are given) or throws on invalid input.
function normalizeEan13(value) {
  const digits = value.trim();

  if (!/^\d{12,13}$/.test(digits)) throw new Error('EAN-13 needs 12 or 13 digits.');
  if (digits.length === 12) return digits + checkDigit(digits);
  if (Number(digits[12]) !== checkDigit(digits.slice(0, 12))) throw new Error('Invalid EAN-13 check digit.');

  return digits;
}

function ean13Modules(digits) {
  const parity = PARITY[digits[0]];
  let modules = '101';

  for (let i = 0; i < 6; i++) {
    modules += (parity[i] === 'L' ? L_CODES : G_CODES)[digits[i + 1]];
  }
  modules += '01010';
  for (let i = 7; i < 13; i++) {
    modules += R_CODES[digits[i]];
  }

  return modules + '101';
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  canvas.style.width = '100%';
  canvas.style.height = '100%';
}

function showMessage(message) {
  clearCanvas();
  emptyState.textContent = message;
  emptyState.classList.remove('is-hidden');
  downloadButton.disabled = true;
}

function drawEan13(digits) {
  const modules = ean13Modules(digits);
  const quietZone = 9;
  const moduleWidth = Math.floor(SIZE / (modules.length + quietZone * 2));
  const barsWidth = modules.length * moduleWidth;
  const left = Math.round((SIZE - barsWidth) / 2);
  const barHeight = Math.round(barsWidth * 0.6);
  const fontSize = moduleWidth * 9;
  const guardExtra = Math.round(fontSize / 2);
  const top = Math.round((SIZE - barHeight - fontSize) / 2);
  const isGuard = (i) => i < 3 || (i >= 45 && i < 50) || i >= 92;

  clearCanvas();
  context.fillStyle = '#000000';
  for (let i = 0; i < modules.length; i++) {
    if (modules[i] === '1') {
      context.fillRect(left + i * moduleWidth, top, moduleWidth, barHeight + (isGuard(i) ? guardExtra : 0));
    }
  }

  // Human-readable digits: first digit in the left quiet zone, then two groups of six.
  const textY = top + barHeight + fontSize * 0.9;
  context.font = `${fontSize}px 'JetBrains Mono', monospace`;
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  context.fillText(digits[0], left - moduleWidth * 5, textY);
  context.fillText(digits.slice(1, 7), left + (3 + 21) * moduleWidth, textY);
  context.fillText(digits.slice(7), left + (50 + 21) * moduleWidth, textY);
}

async function render() {
  const currentRenderId = ++renderId;
  const mode = getMode();
  const value = input.value;

  if (!value.trim()) {
    showMessage(modes[mode].emptyMessage);
    return;
  }

  if (mode === 'ean13') {
    let digits;
    try {
      digits = normalizeEan13(value);
    } catch (error) {
      showMessage(error.message);
      return;
    }
    drawEan13(digits);
  } else {
    await QRCode.toCanvas(canvas, value, {
      width: SIZE,
      margin: 4,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  }

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
    link.download = modes[getMode()].filename;
    link.click();

    URL.revokeObjectURL(url);
  }, 'image/png');
}

function update() {
  render().catch(() => showMessage('The code failed.'));
}

input.addEventListener('input', update);
document.querySelectorAll('input[name="mode"]').forEach((radio) => radio.addEventListener('change', update));
downloadButton.addEventListener('click', downloadPng);

clearCanvas();
