const bookContainer = document.querySelector(".bookList");
const input = document.querySelector("input");
const btn = document.querySelector("button");
const sortSelect = document.querySelector(".sort");
const modal = document.querySelector(".modal");
const $ = (e) => document.querySelector(e);
const $$ = (e) => [...document.querySelectorAll(e)];
const setLocalStorage = (name, data) =>
  localStorage.setItem(name, JSON.stringify(data));
const getLocalStorage = (name) => JSON.parse(localStorage.getItem(name));

const setSessionStorage = (name, data) =>
  sessionStorage.setItem(name, JSON.stringify(data));
const getSessionStorage = (name) => JSON.parse(sessionStorage.getItem(name));

const newEl = (name, atttr = {}) =>
  Object.assign(document.createElement(name), atttr);
let state = {
  bookData: [],
  input: "",
  stat: "bookName",
  sortType: "desc",
  SearchLog: getLocalStorage("log") ?? [],
};

console.log(state.SearchLog);

async function fetchData() {
  await fetch("books.json")
    .then((res) => res.json())
    .then((data) => {
      state.bookData = data.book;
    });
}

function updatedState(data) {
  state = { ...state, ...data };
  setSessionStorage("input", state.input);
  render();
}

function render() {
  bookContainer.innerHTML = "";

  let type = "name";
  if (state.stat === "bookName") {
    type = "name";
  } else if (state.stat === "bookAuthor") {
    type = "author";
  } else {
    type = "both";
  }

  const filterData =
    type === "name" || type === "author"
      ? state.bookData.filter((e) => e[type]?.includes(state.input))
      : state.bookData.filter(
          (e) =>
            e["name"]?.includes(state.input) ||
            e["author"]?.includes(state.input)
        );

  const sortData =
    state.sortType === "desc"
      ? filterData.sort((a, b) => new Date(a.date) - new Date(b.date))
      : filterData.sort((a, b) => new Date(b.date) - new Date(a.date));

  console.log(filterData);

  const books = sortData.map((e) => {
    const book = newEl("div", {
      style: `background-image: url(../images/books/${e.image})`,
      className: "book",
      innerHTML: `<div class="about">
      <p>작가: ${e.author}</p>
      <p>출판일: ${e.date}</p>
      <p>제목: ${e.name}</p>
      
      </div>`,
    });

    book.addEventListener("click", () => {
      modal.style.display = "block";

      modal.querySelector(".title").textContent = e.name;
      modal.querySelector(".sub").textContent = e.intro;
      modal.querySelector(".date").textContent = e.date;
      modal.querySelector(".rating").textContent = e.rating;
      modal.querySelector("img").src = `../images/books/${e.image}`;
      
      modal.querySelector(".close").addEventListener("click",()=>{
        modal.style.display = "none"
      })
    });

    return book;
  });

  bookContainer.append(...books);
  input.value = getSessionStorage("input");
}

function updatedSearch(text, type) {
  console.log(state.SearchLog);
  if (!(state.SearchLog.length >= 3)) {
    state.SearchLog.push({ text: text, type: type });
  } else {
    state.SearchLog.unshift({ text: text, type: type });
    state.SearchLog.pop();
  }

  setLocalStorage("log", state.SearchLog);
}

async function init() {
  await fetchData();
  render();
  Listener();
}

function Listener() {
  input.addEventListener("input", () =>
    setSessionStorage("input", input.value)
  );

  input.addEventListener("focus", () => {
    $(".history").style.display = "block";
    $(".history").innerHTML = ``;
    state.SearchLog.forEach((e, idx) => {
      const newDiv = newEl("div");
      const typeText =
        e.type === "bookName"
          ? "제목"
          : e.type === "bookAuthor"
          ? "작가"
          : "제목 작가";

      newDiv.textContent = `${e.text} (${typeText})`;

      $(".history").append(newDiv);
      newDiv.addEventListener("click", () => {
        updatedState({ input: e.text, stat: e.type });
      });

      newDiv.addEventListener("mouseenter", () => {
        isOver = true;
      });
      newDiv.addEventListener("mouseleave", () => {
        isOver = false;
      });
    });
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      $(".history").style.display = "none";
    }, 150);
  });

  btn.addEventListener("click", () => {
    updatedState({ input: input.value });
    updatedSearch(state.input, state.stat);
  });

  window.addEventListener("hashchange", () => {
    $(".selected").classList.remove("selected");
    $(`[href="${location.hash}"]`).className = "selected";
    state.stat = location.hash.replace("#/", "");
  });

  sortSelect.addEventListener("change", function (e) {
    updatedState({ sortType: e.target.value });
  });
}

init();
