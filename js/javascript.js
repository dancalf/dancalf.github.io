const books = [];
const RENDER_EVENT = 'render-book';


document.addEventListener('DOMContentLoaded', function() {
    const searchButon = document.getElementById('search-button');
    searchButon.addEventListener('click', function(event) {
        event.preventDefault();
        searchBook();
    });

    const submitBook = document.getElementById('input-book');
    submitBook.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
        updateBookItem();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    };
});

function updateBookItem() {
    updateReadBook();
    updateUnReadBook();
};

function updateReadBook() {
    const updateItem =document.querySelectorAll('#completedBook > .item > .inner >h4').length;
    const readBook = document.getElementById('read-book');
    readBook.innerText = updateItem;
};

function updateUnReadBook() {
    const updateItem = document.querySelectorAll('#unCompletedBook > .item > .inner > h4').length;
    const unReadBook = document.getElementById('unRead-book');
    unReadBook.innerText = updateItem;
};

function updateTotalBookItem() {
    const totalBook = document.getElementById('total-book');
    totalBook.innerText = books.length
};

function searchBook() {
    const searchBookTitle = document.getElementById('search-book-title').value.toLowerCase();
    const bookList = document.querySelectorAll('h4');

    for (let bookListItem of bookList) {
        const keyword = bookListItem.textContent.toLowerCase();
        if (keyword.includes(searchBookTitle)) {
            bookListItem.parentElement.parentElement.style.display = 'block';
        } else {
            bookListItem.parentElement.parentElement.style.display = 'none';
        };
    };
    updateBookItem()
};

function addBook() {
    const inputBookTitle = document.getElementById('input-book-title').value;
    const inputBookAuthor = document.getElementById('input-book-author').value;
    const inputBookYear = document.getElementById('input-book-year').value;
    const isCompleted = document.getElementById('isCompleted').checked;
    const generateID = generateId();
    const bookObject = generateBookObject(generateID, inputBookTitle, inputBookAuthor, inputBookYear, isCompleted);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function generateId() {
    return +new Date();
};

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted,
    };
};

document.addEventListener(RENDER_EVENT, function() {
    const unCompleted = document.getElementById('unCompletedBook');
    unCompleted.innerHTML ='';

    const completed = document.getElementById('completedBook');
    completed.innerHTML ='';

    updateTotalBookItem();

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted)
            unCompleted.append(bookElement);
        else
            completed.append(bookElement);
    };
});

function makeBook(bookObject) {
    const bookTitle = document.createElement('h4');
    bookTitle.innerText = bookObject.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = 'Penulis : ' + bookObject.author;

    const bookYear = document.createElement('p');
    bookYear.innerText = 'Tahun terbit : ' + bookObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(bookTitle, bookAuthor, bookYear);

    const container = document.createElement('article');
    container.classList.add('item', 'box');
    container.append(textContainer);
    container.setAttribute('id', 'book-${bookObject.id}');

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('btn-container');
    container.append(buttonContainer);

    const trashButton = document.createElement('div');
    trashButton.classList.add('fa-solid', 'fa-trash');
    trashButton.addEventListener('click', function() {
        removeBookFromCompleted(bookObject.id);
        updateBookItem();
    });

    function removeBookFromCompleted(bookId) {
        const bookTarget = findBookIndex(bookId);

        if (bookTarget === -1) return;

        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    };

    const editButton = document.createElement('div');
    editButton.classList.add('fa-regular', 'fa-pen-to-square');
    editButton.addEventListener('click', function() {
        const modalBg = document.querySelector('.modalBg');
        const modalClose = document.querySelector('#modalClose');
        const updateEditBook = document.getElementById('update-edit-book');

        updateEditBook.addEventListener('submit', function() {
            modalBg.classList.remove('bg_active');
            editBook(bookObject.id);
        });

        modalBg.classList.add('bg_active');
        modalClose.addEventListener('click', function() {
            modalBg.classList.remove('bg_active');
        });
    });

    function editBook(bookId) {
        const updateBookTitle = document.getElementById('update-book-title').value;
        const updateBookAuthor = document.getElementById('update-book-author').value;
        const updateBookYear = document.getElementById('update-book-year').value;


        const bookTarget = findBook(bookId);
        if(bookTarget == null) return;
        
        bookTarget.title = updateBookTitle;
        bookTarget.author = updateBookAuthor;
        bookTarget.year = updateBookYear;
        
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    if (bookObject.isCompleted) {
        const undoButton = document.createElement('div');
        undoButton.classList.add('fa-solid', 'fa-rotate-left');
        undoButton.addEventListener('click', function() {
            undoBookFromCompleted(bookObject.id);
            updateBookItem();
        });

        function undoBookFromCompleted(bookId) {
            const bookTarget = findBook(bookId);

            if (bookTarget == null) return;

            bookTarget.isCompleted = false;
            document.dispatchEvent(new Event(RENDER_EVENT));
            alert('Anda memindahkan buku ini ke dalam rak belum dibaca')
            saveData();
        };

        function findBookIndex(bookId) {
            for (const index in books) {
                if (books[index].id === bookId) {
                    return index;
                }
            }
            return -1;
        };        
        buttonContainer.append(editButton, undoButton, trashButton);

    } else {
        const checkButton = document.createElement('div');
        checkButton.classList.add('fa-regular', 'fa-square-check');
        checkButton.addEventListener('click', function() {
            addBookToCompleted(bookObject.id);
            updateBookItem();
        });

        function addBookToCompleted(bookId) {
            const bookTarget = findBook(bookId);

            if (bookTarget == null) return;

            bookTarget.isCompleted = true;
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();

        };

        function findBookIndex(bookId) {
            for (const index in books) {
                if (books[index].id === bookId) {
                    return index;
                };
            };
            return -1;
        };
        buttonContainer.append(editButton, checkButton, trashButton);
    };
    return container;
};

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        };
    };
    return null;
};

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    };
};

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    };
    return true;
};

document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage () {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        };
    };
    document.dispatchEvent(new Event(RENDER_EVENT));
};
