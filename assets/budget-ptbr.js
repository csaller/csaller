'use strict';

// ── Helpers ───────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');

const toInputDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const fmtDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  const meses = ['jan.','fev.','mar.','abr.','mai.','jun.','jul.','ago.','set.','out.','nov.','dez.'];
  return `${parseInt(d, 10)} de ${meses[parseInt(m, 10) - 1]} de ${y}`;
};

const fmtMoney = (n) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);

const esc = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ── Defaults ──────────────────────────────────────────────────────────────────
const today = new Date();
const plus30 = new Date(today);
plus30.setDate(plus30.getDate() + 30);

const yearStr = String(today.getFullYear());

const DEFAULTS = {
  paySchedule: '50% antecipado na assinatura do contrato.\n50% na entrega e aceite final.',
  payMethod:   'Transferência bancária / PIX / Wise.\nDados para pagamento enviados após assinatura.',
  currency:    'BRL (Real Brasileiro).\nNotas fiscais emitidas em até 24h após cada etapa.',
  latePay:     'Faturas em atraso por mais de 7 dias\nincorrem em multa de 2% ao mês.',
  notes:
    'Esta proposta é válida por 30 dias a partir da data de emissão. ' +
    'Alterações de escopo solicitadas após o início do projeto serão avaliadas e orçadas separadamente. ' +
    'Custos de serviços de terceiros (AWS, domínios, licenças) não estão incluídos neste orçamento ' +
    'e serão cobrados pelo valor de custo ou gerenciados diretamente pelo cliente. ' +
    'Todos os entregáveis passam à propriedade do cliente após o pagamento integral.',
};

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  ref:         `CS-${yearStr}-001`,
  issueDate:   toInputDate(today),
  validUntil:  toInputDate(plus30),
  clientCo:    '',
  clientCt:    '',
  clientEm:    '',
  clientAd:    '',
  projectName: '',
  duration:    '',
  startDate:   'A definir após acordo',
  delivery:    'Remoto · Assíncrono',
  scope:       '',
  items: [
    { name: '', desc: '', qty: '', unitPrice: '' },
    { name: '', desc: '', qty: '', unitPrice: '' },
    { name: '', desc: '', qty: '', unitPrice: '' },
  ],
  discountPct: 0,
  taxPct:      0,
  paySchedule: DEFAULTS.paySchedule,
  payMethod:   DEFAULTS.payMethod,
  currency:    DEFAULTS.currency,
  latePay:     DEFAULTS.latePay,
  notes:       DEFAULTS.notes,
};

// ── Calculations ──────────────────────────────────────────────────────────────
function computeTotals() {
  const subtotal = state.items.reduce((sum, item) => {
    const qty   = parseFloat(item.qty)       || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const discountAmt   = subtotal * (state.discountPct / 100);
  const afterDiscount = subtotal - discountAmt;
  const taxAmt        = afterDiscount * (state.taxPct / 100);
  const total         = afterDiscount + taxAmt;
  return { subtotal, discountAmt, taxAmt, total };
}

// ── Preview rendering ─────────────────────────────────────────────────────────
function setBind(key, value) {
  document.querySelectorAll(`[data-bind="${key}"]`).forEach((el) => {
    el.textContent = value ?? '';
  });
}

function renderPreview() {
  setBind('ref',           state.ref || 'CS-XXXX-XXX');
  setBind('issueDateFmt',  fmtDate(state.issueDate));
  setBind('validUntilFmt', fmtDate(state.validUntil));

  setBind('clientCo', state.clientCo || 'Nome / Empresa do Cliente');
  setBind('clientCt', state.clientCt || 'Pessoa de Contato');
  setBind('clientEm', state.clientEm || 'contato@empresa.com.br');
  setBind('clientAd', state.clientAd || 'Endereço / Cidade, Estado, Brasil');

  setBind('projectName', state.projectName || 'Nome do Projeto / Serviço');
  setBind('duration',    state.duration    || 'X semanas / meses');
  setBind('startDate',   state.startDate   || 'A definir após acordo');
  setBind('delivery',    state.delivery    || 'Remoto · Assíncrono');
  setBind('scope',       state.scope       || 'Descreva o escopo aqui.');

  setBind('paySchedule', state.paySchedule);
  setBind('payMethod',   state.payMethod);
  setBind('currency',    state.currency);
  setBind('latePay',     state.latePay);
  setBind('notes',       state.notes);

  renderTable();
  renderTotals();
}

function renderTable() {
  const tbody = document.getElementById('previewTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.items
    .map((item) => {
      const qty   = parseFloat(item.qty)       || 0;
      const price = parseFloat(item.unitPrice) || 0;
      const total = qty * price;
      return `
        <tr>
          <td>
            <div class="doc-item-name">${esc(item.name) || '<em style="color:#bbb;font-weight:400">Nome do serviço</em>'}</div>
            ${item.desc ? `<div class="doc-item-desc">${esc(item.desc)}</div>` : ''}
          </td>
          <td>${esc(item.qty) || '—'}</td>
          <td>${item.unitPrice ? fmtMoney(parseFloat(item.unitPrice)) : '—'}</td>
          <td>${total > 0 ? fmtMoney(total) : '—'}</td>
        </tr>`;
    })
    .join('');
}

function renderTotals() {
  const el = document.getElementById('previewTotals');
  if (!el) return;

  const { subtotal, discountAmt, taxAmt, total } = computeTotals();

  el.innerHTML = `
    <div class="doc-totals-block">
      <div class="doc-total-row">
        <span class="label">Subtotal</span>
        <span class="value">${fmtMoney(subtotal)}</span>
      </div>
      ${state.discountPct > 0 ? `
      <div class="doc-total-row">
        <span class="label">Desconto (${state.discountPct}%)</span>
        <span class="value">− ${fmtMoney(discountAmt)}</span>
      </div>` : ''}
      ${state.taxPct > 0 ? `
      <div class="doc-total-row">
        <span class="label">Impostos (${state.taxPct}%)</span>
        <span class="value">${fmtMoney(taxAmt)}</span>
      </div>` : ''}
      <div class="doc-total-row total-final">
        <span class="label">Total</span>
        <span class="value">${fmtMoney(total)}</span>
      </div>
    </div>`;
}

// ── Line items form ───────────────────────────────────────────────────────────
function renderItemForms() {
  const container = document.getElementById('itemsContainer');
  if (!container) return;

  container.innerHTML = state.items
    .map(
      (item, i) => `
      <div class="b-item" data-idx="${i}">
        <div class="b-item-top">
          <div class="b-field">
            <label class="b-label">Nome do serviço</label>
            <input class="b-input" data-item="${i}" data-field="name"
              type="text" value="${esc(item.name)}" placeholder="ex.: Arquitetura de Sistemas"/>
          </div>
          <button class="b-item-remove" data-remove="${i}" title="Remover item">✕</button>
        </div>
        <div class="b-item-desc-row b-field">
          <label class="b-label">Descrição (opcional)</label>
          <input class="b-input" data-item="${i}" data-field="desc"
            type="text" value="${esc(item.desc)}" placeholder="Breve descrição..."/>
        </div>
        <div class="b-item-bottom">
          <div class="b-field">
            <label class="b-label">Qtd / Horas</label>
            <input class="b-input" data-item="${i}" data-field="qty"
              type="number" min="0" step="0.5" value="${esc(item.qty)}" placeholder="0"/>
          </div>
          <div class="b-field">
            <label class="b-label">Valor unitário (BRL)</label>
            <input class="b-input" data-item="${i}" data-field="unitPrice"
              type="number" min="0" step="0.01" value="${esc(item.unitPrice)}" placeholder="0,00"/>
          </div>
        </div>
      </div>`
    )
    .join('');

  container.querySelectorAll('[data-item]').forEach((input) => {
    input.addEventListener('input', () => {
      const idx   = parseInt(input.dataset.item, 10);
      const field = input.dataset.field;
      state.items[idx][field] = input.value;
      renderTable();
      renderTotals();
    });
  });

  container.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.remove, 10);
      if (state.items.length > 1) {
        state.items.splice(idx, 1);
        renderItemForms();
        renderTable();
        renderTotals();
      }
    });
  });
}

// ── Form init & bindings ──────────────────────────────────────────────────────
function initForm() {
  const bindings = [
    ['f-ref',        'ref'],
    ['f-issue',      'issueDate'],
    ['f-valid',      'validUntil'],
    ['f-client-co',  'clientCo'],
    ['f-client-ct',  'clientCt'],
    ['f-client-em',  'clientEm'],
    ['f-client-ad',  'clientAd'],
    ['f-proj-name',  'projectName'],
    ['f-proj-dur',   'duration'],
    ['f-proj-start', 'startDate'],
    ['f-proj-del',   'delivery'],
    ['f-proj-scope', 'scope'],
    ['f-discount',   'discountPct'],
    ['f-tax',        'taxPct'],
    ['f-pay-sched',  'paySchedule'],
    ['f-pay-method', 'payMethod'],
    ['f-pay-curr',   'currency'],
    ['f-pay-late',   'latePay'],
    ['f-notes',      'notes'],
  ];

  bindings.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.value = state[key];

    el.addEventListener('input', () => {
      state[key] = el.type === 'number'
        ? parseFloat(el.value) || 0
        : el.value;
      renderPreview();
    });
  });

  document.getElementById('addItemBtn').addEventListener('click', () => {
    state.items.push({ name: '', desc: '', qty: '', unitPrice: '' });
    renderItemForms();
    renderTable();
    renderTotals();
    const container = document.getElementById('itemsContainer');
    container.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  document.getElementById('downloadBtn').addEventListener('click', () => {
    window.print();
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderItemForms();
  initForm();
  renderPreview();
});
