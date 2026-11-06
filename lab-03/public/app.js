/**
 * public/app.js
 * 
 * Book Management Dashboard Client Script
 * ---------------------------------------
 * Handles all user interactions, API fetches, validation feedback,
 * pagination, search, price range filtering, sorting, and modals.
 */

// State Management
const state = {
  books: [],
  total: 0,
  page: 1,
  limit: 10,
  offset: 0,
  view: 'table', // 'table' or 'cards'
  pendingDeleteId: null
};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const minPriceInput = document.getElementById('minPriceInput');
const maxPriceInput = document.getElementById('maxPriceInput');
const sortBySelect = document.getElementById('sortBySelect');
const sortOrderSelect = document.getElementById('sortOrderSelect');
const limitSelect = document.getElementById('limitSelect');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const activeQueryDisplay = document.getElementById('activeQueryDisplay');

const tableView = document.getElementById('tableView');
const cardsView = document.getElementById('cardsView');
const booksTableBody = document.getElementById('booksTableBody');
const emptyState = document.getElementById('emptyState');
const emptyResetBtn = document.getElementById('emptyResetBtn');
const resultSummary = document.getElementById('resultSummary');

const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageIndicator = document.getElementById('pageIndicator');
const paginationInfo = document.getElementById('paginationInfo');

const viewTableBtn = document.getElementById('viewTableBtn');
const viewCardsBtn = document.getElementById('viewCardsBtn');

// Modals
const bookModal = document.getElementById('bookModal');
const modalTitle = document.getElementById('modalTitle');
const modalErrorBox = document.getElementById('modalErrorBox');
const bookForm = document.getElementById('bookForm');
const bookIdInput = document.getElementById('bookIdInput');
const bookTitleInput = document.getElementById('bookTitleInput');
const bookAuthorInput = document.getElementById('bookAuthorInput');
const bookPriceInput = document.getElementById('bookPriceInput');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

const deleteModal = document.getElementById('deleteModal');
const deleteBookTitle = document.getElementById('deleteBookTitle');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');

const toastContainer = document.getElementById('toastContainer');

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : '⚠'}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Build Query String based on current filter controls
 */
function buildQueryParams() {
  const params = new URLSearchParams();

  const search = searchInput.value.trim();
  if (search) params.append('search_q', search);

  const minP = minPriceInput.value.trim();
  if (minP) params.append('min_price', minP);

  const maxP = maxPriceInput.value.trim();
  if (maxP) params.append('max_price', maxP);

  const sortBy = sortBySelect.value;
  if (sortBy && sortBy !== 'id') params.append('order_by', sortBy);

  const sortOrder = sortOrderSelect.value;
  if (sortOrder && sortOrder !== 'ASC') params.append('order', sortOrder);

  const limitVal = limitSelect.value;
  if (limitVal !== 'all') {
    const limitNum = parseInt(limitVal, 10);
    params.append('limit', limitNum);
    const offsetNum = (state.page - 1) * limitNum;
    params.append('offset', offsetNum);
  }

  return params;
}

/**
 * Fetch books from backend API
 */
async function fetchBooks() {
  const queryParams = buildQueryParams();
  const queryString = queryParams.toString();
  const url = queryString ? `/books?${queryString}` : '/books';

  activeQueryDisplay.textContent = `GET ${url}`;
  resultSummary.textContent = 'Fetching books...';

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.errors ? data.errors.join(', ') : (data.message || 'Error fetching books');
      showToast(errorMsg, 'error');
      resultSummary.textContent = 'Failed to load books.';
      return;
    }

    state.books = data.data || [];
    if (data.pagination) {
      state.total = data.pagination.total;
      state.limit = data.pagination.limit;
      state.offset = data.pagination.offset;
    } else {
      state.total = state.books.length;
      state.limit = state.books.length;
      state.offset = 0;
    }

    renderBooks();
    updatePaginationControls();
  } catch (error) {
    console.error('Fetch error:', error);
    showToast('Failed to connect to backend server.', 'error');
    resultSummary.textContent = 'Server unreachable.';
  }
}

/**
 * Render Books (Table and Cards view)
 */
function renderBooks() {
  if (state.books.length === 0) {
    tableView.classList.add('hidden');
    cardsView.classList.add('hidden');
    emptyState.classList.remove('hidden');
    resultSummary.textContent = '0 books found';
    return;
  }

  emptyState.classList.add('hidden');
  resultSummary.textContent = `Showing ${state.books.length} of ${state.total} books`;

  if (state.view === 'table') {
    tableView.classList.remove('hidden');
    cardsView.classList.add('hidden');
    renderTable();
  } else {
    tableView.classList.add('hidden');
    cardsView.classList.remove('hidden');
    renderCards();
  }
}

/**
 * Render Table rows
 */
function renderTable() {
  booksTableBody.innerHTML = '';

  state.books.forEach((book) => {
    const tr = document.createElement('tr');
    const formattedDate = book.created_at ? new Date(book.created_at).toLocaleString() : 'N/A';

    tr.innerHTML = `
      <td class="col-id">#${book.id}</td>
      <td class="book-title-cell">${escapeHtml(book.title)}</td>
      <td>${escapeHtml(book.author)}</td>
      <td><span class="price-tag">₹${Number(book.price).toFixed(2)}</span></td>
      <td class="text-muted">${formattedDate}</td>
      <td class="col-actions">
        <div class="table-action-btns">
          <button class="action-btn edit-btn" onclick="openEditModal(${book.id})">Edit</button>
          <button class="action-btn delete-btn" onclick="openDeleteModal(${book.id}, '${escapeQuote(book.title)}')">Delete</button>
        </div>
      </td>
    `;
    booksTableBody.appendChild(tr);
  });
}

/**
 * Render Cards view
 */
function renderCards() {
  cardsView.innerHTML = '';

  state.books.forEach((book) => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <div>
        <div class="card-top">
          <span class="card-id">#${book.id}</span>
          <span class="price-tag">₹${Number(book.price).toFixed(2)}</span>
        </div>
        <h3 class="card-title">${escapeHtml(book.title)}</h3>
        <p class="card-author">by ${escapeHtml(book.author)}</p>
      </div>
      <div class="card-bottom">
        <span class="text-muted" style="font-size:11px;">Created: ${book.created_at ? new Date(book.created_at).toLocaleDateString() : 'N/A'}</span>
        <div class="table-action-btns">
          <button class="action-btn edit-btn" onclick="openEditModal(${book.id})">Edit</button>
          <button class="action-btn delete-btn" onclick="openDeleteModal(${book.id}, '${escapeQuote(book.title)}')">Delete</button>
        </div>
      </div>
    `;
    cardsView.appendChild(card);
  });
}

/**
 * Update pagination UI buttons and indicators
 */
function updatePaginationControls() {
  const isAll = limitSelect.value === 'all';

  if (isAll || state.total === 0) {
    paginationInfo.textContent = `Showing all ${state.total} books`;
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;
    pageIndicator.textContent = `Page 1 of 1`;
    return;
  }

  const limitNum = parseInt(limitSelect.value, 10);
  const totalPages = Math.ceil(state.total / limitNum) || 1;

  const startRecord = (state.page - 1) * limitNum + 1;
  const endRecord = Math.min(state.page * limitNum, state.total);

  paginationInfo.textContent = `Showing ${startRecord} to ${endRecord} of ${state.total} books`;
  pageIndicator.textContent = `Page ${state.page} of ${totalPages}`;

  prevPageBtn.disabled = state.page <= 1;
  nextPageBtn.disabled = state.page >= totalPages;
}

/**
 * Add / Edit Modal Controls
 */
function openAddModal() {
  modalTitle.textContent = 'Add New Book';
  modalErrorBox.classList.add('hidden');
  modalErrorBox.innerHTML = '';
  bookForm.reset();
  bookIdInput.value = '';
  bookModal.classList.remove('hidden');
}

window.openEditModal = async function (id) {
  modalTitle.textContent = `Edit Book #${id}`;
  modalErrorBox.classList.add('hidden');
  modalErrorBox.innerHTML = '';
  bookForm.reset();

  try {
    const res = await fetch(`/books/${id}`);
    const result = await res.json();

    if (!res.ok) {
      showToast(result.message || 'Book not found', 'error');
      return;
    }

    const book = result.data;
    bookIdInput.value = book.id;
    bookTitleInput.value = book.title;
    bookAuthorInput.value = book.author;
    bookPriceInput.value = book.price;

    bookModal.classList.remove('hidden');
  } catch (error) {
    showToast('Failed to fetch book details', 'error');
  }
};

function closeModal() {
  bookModal.classList.add('hidden');
}

/**
 * Submit Book Form (Create or Update)
 */
bookForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  modalErrorBox.classList.add('hidden');
  modalErrorBox.innerHTML = '';

  const id = bookIdInput.value;
  const payload = {
    title: bookTitleInput.value.trim(),
    author: bookAuthorInput.value.trim(),
    price: parseFloat(bookPriceInput.value)
  };

  const isEdit = Boolean(id);
  const url = isEdit ? `/books/${id}` : '/books';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      const errList = result.errors || [result.message || 'Operation failed'];
      modalErrorBox.innerHTML = `<strong>Validation Error:</strong><br>${errList.join('<br>')}`;
      modalErrorBox.classList.remove('hidden');
      return;
    }

    showToast(result.message || (isEdit ? 'Book updated!' : 'Book created!'), 'success');
    closeModal();
    fetchBooks();
  } catch (error) {
    modalErrorBox.textContent = 'Network or server error occurred.';
    modalErrorBox.classList.remove('hidden');
  }
});

/**
 * Delete Modal Controls
 */
window.openDeleteModal = function (id, title) {
  state.pendingDeleteId = id;
  deleteBookTitle.textContent = `"${title}" (ID: #${id})`;
  deleteModal.classList.remove('hidden');
};

function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  state.pendingDeleteId = null;
}

confirmDeleteBtn.addEventListener('click', async () => {
  if (!state.pendingDeleteId) return;

  try {
    const response = await fetch(`/books/${state.pendingDeleteId}`, {
      method: 'DELETE'
    });
    const result = await response.json();

    if (!response.ok) {
      showToast(result.message || 'Failed to delete book', 'error');
    } else {
      showToast(result.message || 'Book deleted successfully', 'success');
      closeDeleteModal();
      fetchBooks();
    }
  } catch (error) {
    showToast('Network error while deleting', 'error');
  }
});

// Event Listeners
openAddModalBtn.addEventListener('click', openAddModal);
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);

applyFiltersBtn.addEventListener('click', () => {
  state.page = 1;
  fetchBooks();
});

resetFiltersBtn.addEventListener('click', () => {
  searchInput.value = '';
  minPriceInput.value = '';
  maxPriceInput.value = '';
  sortBySelect.value = 'id';
  sortOrderSelect.value = 'ASC';
  limitSelect.value = '10';
  state.page = 1;
  fetchBooks();
});

emptyResetBtn.addEventListener('click', () => {
  resetFiltersBtn.click();
});

// Real-time search with debounce
let debounceTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    state.page = 1;
    fetchBooks();
  }, 400);
});

// Sorting and page size change trigger fetch
sortBySelect.addEventListener('change', () => { state.page = 1; fetchBooks(); });
sortOrderSelect.addEventListener('change', () => { state.page = 1; fetchBooks(); });
limitSelect.addEventListener('change', () => { state.page = 1; fetchBooks(); });

// Pagination buttons
prevPageBtn.addEventListener('click', () => {
  if (state.page > 1) {
    state.page--;
    fetchBooks();
  }
});

nextPageBtn.addEventListener('click', () => {
  state.page++;
  fetchBooks();
});

// View switchers
viewTableBtn.addEventListener('click', () => {
  state.view = 'table';
  viewTableBtn.classList.add('active');
  viewCardsBtn.classList.remove('active');
  renderBooks();
});

viewCardsBtn.addEventListener('click', () => {
  state.view = 'cards';
  viewCardsBtn.classList.add('active');
  viewTableBtn.classList.remove('active');
  renderBooks();
});

// Escape HTML helper
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeQuote(text) {
  if (!text) return '';
  return String(text).replace(/'/g, "\\'");
}

// Initial fetch on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchBooks();
});

