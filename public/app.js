const booksTableBody = document.getElementById('booksTableBody');
const booksFeedback = document.getElementById('booksFeedback');
const activeLoansTableBody = document.getElementById('activeLoansTableBody');
const activeLoansFeedback = document.getElementById('activeLoansFeedback');
const loanFeedback = document.getElementById('loanFeedback');
const returnFeedback = document.getElementById('returnFeedback');
const refreshButton = document.getElementById('refreshButton');
const loanSubmitButton = document.getElementById('loanSubmitButton');
const returnSubmitButton = document.getElementById('returnSubmitButton');
const loanForm = document.getElementById('loanForm');
const returnForm = document.getElementById('returnForm');
const bookIdInput = document.getElementById('bookIdInput');
const memberIdInput = document.getElementById('memberIdInput');
const returnBookIdInput = document.getElementById('returnBookIdInput');
const returnMemberIdInput = document.getElementById('returnMemberIdInput');
const bookOptions = document.getElementById('bookOptions');
const memberOptions = document.getElementById('memberOptions');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(dateValue) {
  if (!dateValue) {
    return '-';
  }

  const normalizedDate = String(dateValue).slice(0, 10);
  const [year, month, day] = normalizedDate.split('-');

  if (!year || !month || !day) {
    return escapeHtml(dateValue);
  }

  return `${day}-${month}-${year}`;
}

function setFeedback(element, message, type) {
  element.textContent = message;
  element.className = `feedback visible ${type}`;
}

function clearFeedback(element) {
  element.textContent = '';
  element.className = 'feedback';
}

async function readResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {};
  }
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(data.error || 'Permintaan gagal diproses.');
  }

  return data;
}

function renderBookOptions(books) {
  bookOptions.innerHTML = books
    .map((book) => {
      const title = book.title ? `${book.title} | stok ${book.available_copies}` : `Buku ${book.id}`;
      return `<option value="${escapeHtml(book.id)}">${escapeHtml(title)}</option>`;
    })
    .join('');
}

function renderMemberOptions(members) {
  const sortedMembers = [...members].sort((left, right) =>
    String(left.full_name || '').localeCompare(String(right.full_name || ''), 'id')
  );

  memberOptions.innerHTML = sortedMembers
    .map((member) => {
      const label = member.full_name || member.email || member.id;
      return `<option value="${escapeHtml(member.id)}">${escapeHtml(label)}</option>`;
    })
    .join('');
}

function renderBooks(books) {
  if (!Array.isArray(books) || books.length === 0) {
    booksTableBody.innerHTML = `
      <tr>
        <td class="empty-state" colspan="5">Belum ada data buku.</td>
      </tr>
    `;
    return;
  }

  booksTableBody.innerHTML = books
    .map((book, index) => {
      const availableCopies = Number(book.available_copies) || 0;
      const stockClass = availableCopies === 0 ? 'stock-badge low' : 'stock-badge';
      const topBookCaption =
        index === 0 ? '<span class="hover-caption">Top Pinjam Gacor</span>' : '';

      return `
        <tr class="${index === 0 ? 'top-book-row' : ''}">
          <td class="id-text">${escapeHtml(book.id)}</td>
          <td>
            <div class="book-title-cell">
              <span>${escapeHtml(book.title ?? '-')}</span>
              ${topBookCaption}
            </div>
          </td>
          <td>${escapeHtml(book.author_name ?? '-')}</td>
          <td>${escapeHtml(book.category_name ?? '-')}</td>
          <td><span class="${stockClass}">${escapeHtml(availableCopies)}</span></td>
        </tr>
      `;
    })
    .join('');
}

function renderActiveLoans(loans) {
  const activeLoans = Array.isArray(loans)
    ? loans.filter((loan) => loan.status === 'BORROWED' && !loan.return_date)
    : [];

  if (activeLoans.length === 0) {
    activeLoansTableBody.innerHTML = `
      <tr>
        <td class="empty-state" colspan="5">Tidak ada pinjaman aktif.</td>
      </tr>
    `;
    return;
  }

  activeLoansTableBody.innerHTML = activeLoans
    .map((loan) => {
      return `
        <tr>
          <td class="id-text">${escapeHtml(loan.book_id)}</td>
          <td>${escapeHtml(loan.book_title ?? '-')}</td>
          <td class="id-text">${escapeHtml(loan.member_id)}</td>
          <td>${escapeHtml(loan.member_name ?? '-')}</td>
          <td>${escapeHtml(formatDate(loan.due_date))}</td>
        </tr>
      `;
    })
    .join('');
}

async function loadBooksAndMembers() {
  booksFeedback.textContent = 'Memuat data buku...';
  booksFeedback.className = 'feedback info';

  try {
    const [books, members] = await Promise.all([
      fetchJson('/api/books'),
      fetchJson('/api/members')
    ]);

    renderBooks(books);
    renderBookOptions(books);
    renderMemberOptions(members);
    booksFeedback.textContent = '';
    booksFeedback.className = 'feedback info hidden';
  } catch (error) {
    booksTableBody.innerHTML = `
      <tr>
        <td class="empty-state" colspan="5">Data buku tidak bisa ditampilkan.</td>
      </tr>
    `;
    booksFeedback.textContent = error.message;
    booksFeedback.className = 'feedback visible error';
  }
}

async function loadActiveLoans() {
  activeLoansFeedback.textContent = 'Memuat data pinjaman...';
  activeLoansFeedback.className = 'feedback info';

  try {
    const loans = await fetchJson('/api/loans');
    renderActiveLoans(loans);
    activeLoansFeedback.textContent = '';
    activeLoansFeedback.className = 'feedback info hidden';
  } catch (error) {
    activeLoansTableBody.innerHTML = `
      <tr>
        <td class="empty-state" colspan="5">Data pinjaman tidak bisa ditampilkan.</td>
      </tr>
    `;
    activeLoansFeedback.textContent = error.message;
    activeLoansFeedback.className = 'feedback visible error';
  }
}

async function reloadPageData() {
  await Promise.all([loadBooksAndMembers(), loadActiveLoans()]);
}

async function submitLoan(event) {
  event.preventDefault();
  clearFeedback(loanFeedback);

  loanSubmitButton.disabled = true;
  loanSubmitButton.textContent = 'Memproses...';

  try {
    const data = await fetchJson('/api/loans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        book_id: bookIdInput.value.trim(),
        member_id: memberIdInput.value.trim()
      })
    });

    setFeedback(loanFeedback, data.message || 'Buku berhasil dipinjam.', 'success');
    loanForm.reset();
    await reloadPageData();
  } catch (error) {
    setFeedback(loanFeedback, error.message, 'error');
  } finally {
    loanSubmitButton.disabled = false;
    loanSubmitButton.textContent = 'Pinjam Buku';
  }
}

async function submitReturn(event) {
  event.preventDefault();
  clearFeedback(returnFeedback);

  returnSubmitButton.disabled = true;
  returnSubmitButton.textContent = 'Memproses...';

  try {
    const data = await fetchJson('/api/loans/return', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        book_id: returnBookIdInput.value.trim(),
        member_id: returnMemberIdInput.value.trim()
      })
    });

    setFeedback(returnFeedback, data.message || 'Buku berhasil dikembalikan.', 'success');
    returnForm.reset();
    await reloadPageData();
  } catch (error) {
    setFeedback(returnFeedback, error.message, 'error');
  } finally {
    returnSubmitButton.disabled = false;
    returnSubmitButton.textContent = 'Kembalikan Buku';
  }
}

refreshButton.addEventListener('click', reloadPageData);
loanForm.addEventListener('submit', submitLoan);
returnForm.addEventListener('submit', submitReturn);

reloadPageData();
