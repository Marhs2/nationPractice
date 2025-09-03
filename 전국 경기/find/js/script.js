const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const building = document.querySelector(".building");
const popup = document.querySelector(".showabout");
canvas.width = 1920;
canvas.height = 1080;

let libraryData = [];
let mapData = [];

let hoverIndex = null;

const libraries = [];
let libs = null;

fetch("./find_library.json")
  .then((res) => res.json())
  .then((data) => {
    mapData = data.map;
    libraryData = data.libraries;

    libraryData.forEach((e) => {
      building.innerHTML += `<div data-id='${e.idx - 1}'>${e.name}</div>`;
    });

    drawAll(null);
    libs = [...document.querySelectorAll(".building div")];
    clickBuilding();
    wait();
  });

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

  console.log(hoveredItem);
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

    const books = lib["books"].sort((a, b) => b.rating - a.rating);

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
draw();

const search = document.querySelector("input");
const btn = document.querySelector("button");

function clickBuilding() {
  const building = [...document.querySelectorAll(".building div")];

  building.forEach((e) => {
    e.addEventListener("click", (event) => {
      building.forEach((e2) => {
        e2.style.backgroundColor = "white";
      });
      data = arr[event.target.getAttribute("data-id")];

      e.style.backgroundColor = "red";
      hoverIndex = data.idx;
      draw();
    });
    console.log("work");
  });

  btn.addEventListener("click", () => {
    if (!search.value.trim()) return;
    const data = building.filter((e) =>
      e.textContent.includes(search.value.trim())
    );
    if (data) {
      building.forEach((e2) => {
        e2.style.backgroundColor = "white";
      });
      hoverIndex = data[0].getAttribute("data-id");
      data[0].style.backgroundColor = "red";
    }
  });
}

function wait() {
  const booksContainer = document.querySelector(".books");
  console.log(booksContainer);
  const first = libraryData[0].books;
  Object.keys(first).forEach((e) => {
    const item = first[e];
    console.log(item);
    const newBOx = document.createElement("div");
    newBOx.classList.add("img-cover");

    newBOx.innerHTML += `
    
            <img src="../images/find/${item.image}" />
            <div class="img-content">
              <div class="title">제목: <span class="setTitle">${item.name}</span></div>
              <div class="publisher">
                출판사: <span class="setPublisher">${item.date}</span>
              </div>
              <div class="cate">
                카테고리: <span class="setCate">${item.cate}</span>
              </div>
              <div class="author">
                작가: <span class="setAuthor">${item.author}</span>
              </div>
            </div>

    `;

    booksContainer.appendChild(newBOx);
  });
}
