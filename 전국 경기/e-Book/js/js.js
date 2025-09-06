const textContainer = document.querySelector(".showText");
const modal = document.querySelector(".modal");
const left = document.querySelector(".left");
const right = document.querySelector(".right");
const leftSlide = document.querySelector(".left-slide");
const rightSlide = document.querySelector(".right-slide");
const next = document.querySelector(".nextPage");
const before = document.querySelector(".beforePage");
const bookList = document.querySelector(".bookList");
let showBook = [...document.querySelectorAll(".showBook")];
const close = document.querySelector(".close");
const select = document.querySelector("select");

let bookData = [];
let bookText = [];
let Bookidx = 0;
let bookPage = 0;

async function fetchData() {
  await fetch("./books.json")
    .then((res) => res.json())
    .then((data) => {
      bookData = data.book;
    });
}

function genBookStory() {
  bookText = bookData[Bookidx]["text"].match(/[^.!?]+[.!?]\s*/g);
  const sentencesPerPage = 10;

  const startIdx = bookPage * sentencesPerPage;
  const endIdx = startIdx + sentencesPerPage;

  const leftPageText = bookText.slice(startIdx, endIdx);
  const rightPageText = bookText.slice(endIdx, endIdx + sentencesPerPage);

  left.innerHTML = leftPageText.map((e) => `<span>${e}</span>`).join("");
  right.innerHTML = rightPageText.map((e) => `<span>${e}</span>`).join("");
  left.innerHTML += startIdx / 10 + 1;
  right.innerHTML += endIdx / 10 + 1;
}

function genBooks() {
  bookData.forEach((e) => {
    bookList.innerHTML += `
    
    <div class="box" data-id="${e.idx}" data-genre="${e.cate}">
    <img src="../images/books/${e.image}" />
    <div class="showBook ${!e.text.trim() ? "disable" : ""}">E-Book 읽기</div>
    </div>
    
    `;
  });
}

async function init() {
  await fetchData();
  genBookStory();
  genBooks();
  Listener();
}

init();

function handle(dir) {
  if (dir === "next" && bookPage <= bookText.length / 10 - 1) {
    bookPage += 2;
  } else if (dir === "before" && bookPage >= 1) {
    bookPage -= 2;
  }

  genBookStory();
}

function Listener() {
  showBook = [...document.querySelectorAll(".showBook")];

  next.addEventListener("click", () => {
    rightSlide.classList.add("anti");
    next.style.pointerEvents = "none";
    setTimeout(() => {
      next.style.pointerEvents = "visible";
      rightSlide.classList.remove("anti");
    }, 500);
    handle("next");
  });

  before.addEventListener("click", () => {
    leftSlide.classList.add("anti");
    before.style.pointerEvents = "none";
    setTimeout(() => {
      before.style.pointerEvents = "visible";
      leftSlide.classList.remove("anti");
    }, 500);
    handle("before");
  });

  showBook.forEach((e) => {
    e.addEventListener("click", (event) => {
      const box = event.target.closest(".box");

      bookPage = 0;
      Bookidx = box.getAttribute("data-id");
      modal.style.display = "block";

      genBookStory();
    });
  });

  close.addEventListener("click", () => (modal.style.display = "none"));
  select.addEventListener("change", (event) => {
    showBook.forEach((e) => {
      if (
        e.closest(".box").getAttribute("data-genre") === event.target.value ||
        event.target.value === "전체"
      ) {
        e.closest(".box").style.display = "block";
      } else {
        e.closest(".box").style.display = "none";
      }
    });
  });
}
