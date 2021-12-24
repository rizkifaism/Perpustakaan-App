document.addEventListener("DOMContentLoaded", function () {
  const submitBook = document.getElementById("inputBook");
  submitBook.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  const searchBook = document.getElementById("searchBook");
  searchBook.addEventListener("submit", function (event) {
    event.preventDefault();
    let search = document.getElementById("searchBookTitle");
    let filter = search.value.toUpperCase();
    let profile = document.getElementsByClassName("book_item");

    for (let i = 0; i < profile.length; i++) {
      let result = profile[i].getElementsByTagName("h3")[0];
      let txtValue = result.textContent || result.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        profile[i].style.display = "";
      } else {
        profile[i].style.display = "none";
      }
    }
  });

  if (isStorageExist()) {
    loadBookFromStorage();
  }
});

document.addEventListener("onbooksaved", () => {
  console.log("Data berhasil disimpan");
});

document.addEventListener("onbookloaded", () => {
  refreshBookFromBooks();
});

// DOM
const UNCOMPLETED_READING = "incompleteBookshelfList";
const BOOK_ITEMID = "bookId";

function addBook() {
  const uncompleteReading = document.getElementById(UNCOMPLETED_READING);
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookProdi = document.getElementById("inputBookProdi").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;

  const book = makeBook(bookTitle, bookAuthor, bookProdi, bookYear);
  const bookObject = composeBookObject(bookTitle, bookAuthor, bookYear, false);
  book[BOOK_ITEMID] = bookObject.id;
  books.push(bookObject);
  uncompleteReading.append(book);
  updateBookToStorage();
}

function makeBook(title, author, prodi, years) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.innerHTML = `NPM: <span id="author">` + author + `</span>`;

  const textProdi = document.createElement("p");
  textProdi.innerHTML = `Prodi: <span id="prodi">` + prodi + `</span>`;

  const year = document.createElement("p");
  year.innerHTML = `Tahun Ajaran: <span id="year">` + years + `</span>`;

  const mark = document.createElement("div");
  mark.classList.add("action");
  mark.append(createDeleteButton());

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.append(textTitle, textAuthor, textProdi, year, mark);

  return container;
}

function createButton(buttonTypeClass, buttonText, eventListener) {
  const button = document.createElement("button");
  button.classList.add(buttonTypeClass);
  button.innerText = buttonText;
  button.addEventListener("click", function (event) {
    eventListener(event);
    event.stopPropagation();
  });
  return button;
}

function addBookToFinished(bookElement) {
  const completedReading = document.getElementById(COMPLETED_READING);
  const textTitle = bookElement.querySelector("h3").innerHTML;
  const textAuthor = bookElement.querySelector("span#author").innerText;
  const textProdi = bookElement.querySelector("span#prodi").innerText;
  const year = bookElement.querySelector("span#year").innerText;

  const newBook = makeBook(textTitle, textAuthor, textProdi, year, true);
  const book = findBook(bookElement[BOOK_ITEMID]);
  book.isCompleted = true;
  newBook[BOOK_ITEMID] = book.id;

  completedReading.append(newBook);
  bookElement.remove();

  updateBookToStorage();
}

function createDeleteButton() {
  return createButton("red", "Hapus Anggota", function (event) {
    let r = confirm("Anda yakin ingin menghapusnya?");
    if (r == true) {
      removeBookFromCompleted(event.target.parentElement.parentElement);
    }
  });
}

function removeBookFromCompleted(bookElement) {
  const bookPosition = findBookIndex(bookElement[BOOK_ITEMID]);
  books.splice(bookPosition, 1);

  bookElement.remove();
  updateBookToStorage();
}

// Local storage
const STORAGE_KEY = "BOOKSHELF_APPS";

let books = [];

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser Anda tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveBook() {
  const parsed = JSON.stringify(books);
  localStorage.setItem(STORAGE_KEY, parsed);
  document.dispatchEvent(new Event("onbooksaved"));
}

function loadBookFromStorage() {
  const serializedBook = localStorage.getItem(STORAGE_KEY);

  let book = JSON.parse(serializedBook);

  if (book !== null) books = book;

  document.dispatchEvent(new Event("onbookloaded"));
}

function updateBookToStorage() {
  if (isStorageExist()) saveBook();
}

function composeBookObject(title, author, prodi, years, isCompleted) {
  return {
    id: +new Date(),
    title,
    prodi,
    author,
    years,
    isCompleted,
  };
}

function findBook(bookId) {
  for (book of books) {
    if (book.id === bookId) return book;
  }
  return null;
}

function findBookIndex(bookId) {
  let index = 0;
  for (book of books) {
    if (book.id === bookId) return index;

    index++;
  }
  return -1;
}

function refreshBookFromBooks() {
  const listUnCompleted = document.getElementById(UNCOMPLETED_READING);
  for (book of books) {
    const newBook = makeBook(book.title, book.author, book.prodi, book.years, book.isCompleted);
    newBook[BOOK_ITEMID] = book.id;

    if (book.isCompleted) {
      listCompleted.append(newBook);
    } else {
      listUnCompleted.append(newBook);
    }
  }
}
