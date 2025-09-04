const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const building = document.querySelector(".building");
const popup = document.querySelector(".showabout");
const menu = document.querySelector(".menu");
canvas.width = 1920;
canvas.height = 1080;

let libraryData = [];
let mapData = [];

let hoverIndex = null;

const libraries = [];
let libs = null;
let libIdx = 0;
let cate = "all";

async function genBook() {
  try {
    const res = await fetch("./find_library.json");
    const data = await res.json();
    mapData = data.map;
    libraryData = data.libraries;

    libraryData.forEach((e) => {
      building.innerHTML += `<div data-id='${e.idx - 1}'>${e.name}</div>`;
    });

    drawAll(null);
    libs = [...document.querySelectorAll(".building div")];
    clickBuilding();
  } catch (error) {
    console.log(error);
  }
}
function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const minX = 126;
  const maxX = 127;
  const minMaxY = 35;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.beginPath();
  mapData.forEach(([lon, lat], i) => {
    const x = Math.floor(((lon - minX) * canvas.width) / (maxX - minX));
    const y = Math.floor((minMaxY - lat) * canvas.height * 2);

    if (i === 0) {
      ctx.moveTo(x - 1000, y + 800);
    } else {
      ctx.lineTo(x - 1000, y + 800);
    }
  });
  ctx.stroke();
  ctx.closePath();
}

let arr = [];
hoverIndex = -1;

function draw() {
  fetch("./find_library.json")
    .then((res) => res.json())
    .then((data) => {
      arr = [];
      data.libraries.forEach((e, idx) => {
        const path = new Path2D();

        let minMaxY = 35;
        let minX = 126;
        let maxX = 127;

        const x = Math.floor(
          ((e.longitude - minX) * canvas.width) / (maxX - minX)
        );
        const y = Math.floor((minMaxY - e.latitude) * canvas.height * 2);

        long = x - 1000;
        lat = y + 800;

        path.arc(long, lat, 10, 0, Math.PI * 2);
        ctx.fillStyle = idx === hoverIndex ? "red" : "black";
        ctx.fill(path);
        arr.push({ path, long, lat, idx });
      });
    });
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const hoveredItem = arr.find(({ path }) =>
    ctx.isPointInPath(path, mouseX, mouseY)
  );

  menu.style.display = "block";

  renderBooks(libraryData[hoveredItem.idx].books);
  libIdx = hoveredItem.idx;
  console.log(document.querySelector(".menu-container .about img"));
  document.querySelector(".menu-container .about img").src = `../images/find/${
    libraryData[hoveredItem.idx].image
  }`;
  document.querySelector(".menu-container .about .name").textContent =
    libraryData[hoveredItem.idx].name;
  document.querySelector(".menu-container .about .text").textContent =
    libraryData[hoveredItem.idx].introduction;
  console.log(libraryData[hoveredItem.idx]);
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();

  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const hoveredItem = arr.find(({ path }) =>
    ctx.isPointInPath(path, mouseX, mouseY)
  );

  if (hoveredItem) {
    popup.setAttribute(
      "style",
      `display:block;left:${hoveredItem.long + rect.left + 10}px;top:${
        hoveredItem.lat + rect.top - 250
      }px`
    );

    const lib = libraryData[hoveredItem.idx];

    let books = lib["books"].sort((a, b) => b.rating - a.rating);

    popup.innerHTML = `
            <h1>${lib.name}</h1>

        <div class="showContainer">
          <img src="../images/find/${lib.image}" />
          <div class="about">
            <div class="text">${lib.introduction}</div>
            <div class="imgs">
              <img src="../images/find/${books[0].image}" />
              <img src="../images/find/${books[1].image}" />
              <img src="../images/find/${books[2].image}" />
            </div>
          </div>
        </div>

    
    `;
  } else {
    popup.setAttribute("style", "display:none;");
  }

  const que = hoveredItem ? hoveredItem.idx : -1;
  hoverIndex = que;
  draw();
});

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const hoveredItem = arr.find(({ path }) =>
    ctx.isPointInPath(path, mouseX, mouseY)
  );

  const itemIdx = hoveredItem["idx"];

  renderBooks(libraryData[itemIdx].books);
});
draw();

const search = document.querySelector("input");
const btn = document.querySelector("button");

function clickBuilding() {
  const building = [...document.querySelectorAll(".building div")];

  building.forEach((e) => {
    e.addEventListener("mouseleave", (event) => {
      building.forEach((e2) => {
        e2.style.backgroundColor = "white";
      });
      popup.setAttribute("style", "display:none;");
    });

    e.addEventListener("mouseover", (event) => {
      building.forEach((e2) => {
        e2.style.backgroundColor = "white";
      });
      data = arr[event.target.getAttribute("data-id")];

      e.style.backgroundColor = "red";
      hoverIndex = data.idx;
      draw();

      if (data.idx || data.idx === 0) {
        popup.setAttribute(
          "style",
          `display:block;left:${data.long + 10}px;top:${data.lat - 250}px`
        );

        const lib = libraryData[data.idx];

        let books = lib["books"].sort((a, b) => b.rating - a.rating);

        popup.innerHTML = `
            <h1>${lib.name}</h1>

        <div class="showContainer">
          <img src="../images/find/${lib.image}" />
          <div class="about">
            <div class="text">${lib.introduction}</div>
            <div class="imgs">
              <img src="../images/find/${books[0].image}" />
              <img src="../images/find/${books[1].image}" />
              <img src="../images/find/${books[2].image}" />
            </div>
          </div>
        </div>

    
    `;
      } else {
        popup.setAttribute("style", "display:none;");
      }
    });

    e.addEventListener("click", (el) => {
      menu.style.display = "block";

      renderBooks(libraryData[el.target.getAttribute("data-id")].books);
      document.querySelector(".menu-container img").src =
        "../images/find/" +
        libraryData[el.target.getAttribute("data-id")].image;
      document.querySelector(".menu-container .name").textContent =
        libraryData[el.target.getAttribute("data-id")].name;
      document.querySelector(".menu-container .text").textContent =
        libraryData[el.target.getAttribute("data-id")].introduction;
    });
  });

  btn.addEventListener("click", () => {
    if (!search.value.trim()) {
      building.forEach((e) => {
        e.style.display = "block";
      });
    }
    const data = libraryData.filter((library) => {
      const searchTerm = search.value.trim();

      const libraryNameMatch = library.name.includes(searchTerm);

      const bookNameMatch = Object.values(library.books).some((book) =>
        book.name.includes(searchTerm)
      );

      return libraryNameMatch || bookNameMatch;
    });

    const buildingContainer = document.querySelector(".building");

    console.log(buildingContainer);
    buildingContainer.innerHTML = "";

    data.forEach((el) => {
      console.log(el);
      buildingContainer.innerHTML += `
      <div data-id="${el.idx}" >
      ${el.name}
      </div>;
      `;
    });

    const books = document.querySelector(".bookList");

    console.log(books);

    let bookNames = [
      ...new Set(
        libraryData.flatMap((library) =>
          Object.values(library.books)
            .filter((book) => book.name.includes(search.value.trim()))
            .map((book) => book.name)
        )
      ),
    ];

    books.innerHTML = ``;
    bookNames.forEach((e) => {
      books.innerHTML += `${e}`;
    });

    attachEventListeners();
  });
}

let currentCate = "all";

async function wait() {
  await genBook();
  renderBooks(libraryData[0].books);
  attachEventListeners();
}

// 렌더링 로직: 화면에 책을 그립니다.
function renderBooks(booksToRender, selectedBookId = null) {
  const booksContainer = document.querySelector(".books");
  booksContainer.innerHTML = "";

  const sortedBooks = booksToRender.sort((a, b) => {
    if (selectedBookId !== null) {
      return (b.idx === selectedBookId) - (a.idx === selectedBookId);
    }
    return 0;
  });

  sortedBooks.forEach((item) => {
    const newBox = document.createElement("div");
    newBox.classList.add("img-cover");
    newBox.setAttribute("data-id", item.cate);
    newBox.setAttribute("data-idx", item.idx);
    newBox.dataset;

    if (item.idx === selectedBookId) {
      newBox.classList.add("select");
    }

    newBox.innerHTML = `
            <img src="../images/find/${item.image}" />
            <div class="img-content">
                <div class="title">제목: <span class="setTitle">${item.name}</span></div>
                <div class="publisher">출판일: <span class="setPublisher">${item.date}</span></div>
                <div class="cate">카테고리: <span class="setCate">${item.cate}</span></div>
                <div class="author">작가: <span class="setAuthor">${item.author}</span></div>
            </div>
        `;
    booksContainer.appendChild(newBox);
  });
}

// 이벤트 핸들러: 클릭 이벤트를 처리합니다.
function handleBookClick(event) {
  const clickedElement = event.currentTarget;
  const clickIdx = parseInt(clickedElement.getAttribute("data-idx"));
  const bookCate = clickedElement.getAttribute("data-id");

  currentCate = bookCate;

  const filteredBooks = libraryData[libIdx].books.filter(
    (book) => book.cate === bookCate
  );
  if (event.currentTarget.classList.contains("select")) {
    renderBooks(libraryData[libIdx].books);
  } else {
    renderBooks(filteredBooks, clickIdx);
  }
}

// 이벤트 리스너를 한 번만 등록합니다.
function attachEventListeners() {
  const booksContainer = document.querySelector(".books");
  booksContainer.addEventListener("click", (event) => {
    const bookElement = event.target.closest(".img-cover");
    if (bookElement) {
      handleBookClick({ currentTarget: bookElement });
    }
  });
}

// 초기화 함수
async function init() {
  await wait();
}

init();

const close = document.querySelector(".close");

close.addEventListener("click", () => {
  menu.style.display = 'none'
});
