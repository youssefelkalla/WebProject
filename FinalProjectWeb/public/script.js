
const apiURL = 'https://6824a0580f0188d7e72a1d91.mockapi.io/book';

const bookForm = document.getElementById('bookForm');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const bookTableBody = document.querySelector('#bookTable tbody');
const bookCount = document.getElementById('bookCount');
const resetAllBtn = document.getElementById('reset-all-btn');
let currentEditBookId = null;

// Fetch books from API  
async function fetchBooks() {
  try {
    const response = await fetch(apiURL);
    const books = await response.json();
    bookTableBody.innerHTML = ''; // Clear existing rows
    books.forEach(addBookToTable);
    updateBookCount(books.length);
  } catch (error) {
    console.error('Error fetching books:', error);
    alert('Failed to load books');
  }
}

// Add or Update book
bookForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();

  if (!title || !author) return;

  try {
    let response;
    if (currentEditBookId) {
      // Update existing book
      response = await fetch(`${apiURL}/${currentEditBookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author })
      });
      const updatedBook = await response.json();
      updateBookInTable(updatedBook);
      currentEditBookId = null;
    } else {
      // Add new book
      response = await fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author })
      });
      const newBook = await response.json();
      addBookToTable(newBook);
      updateBookCount(1);
    }

    bookForm.reset();
    document.querySelector('button[type="submit"]').textContent = 'Add Book';
  } catch (error) {
    console.error('Error processing book:', error);
    alert('Error processing book');
  }
});

// Add book to table
function addBookToTable(book) {
  const row = bookTableBody.insertRow();
  row.setAttribute('data-id', book.id);
  row.innerHTML = `
    <td>${book.id}</td>
    <td>${book.title}</td>
    <td>${book.author}</td>
    <td>
      <button onclick="editBook('${book.id}', '${book.title}', '${book.author}')">Edit</button>
      <button onclick="deleteBook('${book.id}', this)">Delete</button>
    </td>
  `;
}

// Update book in table
function updateBookInTable(book) {
  const row = document.querySelector(`tr[data-id="${book.id}"]`);
  if (row) {
    row.innerHTML = `
      <td>${book.id}</td>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>
        <button onclick="editBook('${book.id}', '${book.title}', '${book.author}')">Edit</button>
        <button onclick="deleteBook('${book.id}', this)">Delete</button>
      </td>
    `;
  }
}

// Edit book
function editBook(id, title, author) {
  currentEditBookId = id;
  titleInput.value = title;
  authorInput.value = author;
  document.querySelector('button[type="submit"]').textContent = 'Update Book';
}

// Delete a book
async function deleteBook(bookId, buttonElement) {
  try {
    const response = await fetch(`${apiURL}/${bookId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      buttonElement.closest('tr').remove();
      updateBookCount(-1);
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    alert('Failed to delete book');
  }
}

// Update book count
function updateBookCount(change) {
  const currentCount = parseInt(bookCount.textContent);
  bookCount.textContent = Math.max(0, currentCount + change);
}

// Reset all books
resetAllBtn.addEventListener('click', async () => {
  try {
    const response = await fetch(apiURL);
    const books = await response.json();
    
    for (const book of books) {
      await fetch(`${apiURL}/${book.id}`, { method: 'DELETE' });
    }
    
    bookTableBody.innerHTML = '';
    updateBookCount(-books.length);
  } catch (error) {
    console.error('Error resetting books:', error);
    alert('Failed to reset books');
  }
});

// Fetch books on page load
fetchBooks();