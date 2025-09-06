const $ = (e) => document.querySelector(e);
const $$ = (e) => [...document.querySelectorAll(e)];

const $canvas = $("#canvas");

const state = {
  libData: [],
  mapData: [],
};

const MaxMin = {
  MaxX: null,
  MinX: null,
  MaxY: null,
  MinY: null,
};

const ctx = $canvas.getContext("2d");

function drawMap() {
  state.mapData.forEach((e, i) => {
    ctx.beginPath();
    const x =
      ((MaxMin.MaxX - e[0]) * canvas.width) / (MaxMin.MaxX - MaxMin.MinX);
    const y =
      (e[1] - MaxMin.MinY) * canvas.height * (MaxMin.MaxY - MaxMin.MinY);

    console.log(x);
    console.log(y);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.closePath();
  });
}

async function init() {
  const data = await fetch("./find_library.json")
    .then((res) => res.json())
    .then((data) => {
      const long = data["map"].flatMap(([val]) => val);
      const lat = data["map"].flatMap(([_, val]) => val);

      MaxMin.MaxX = Math.max(...long);
      MaxMin.MinX = Math.min(...long);
      MaxMin.MaxY = Math.max(...lat);
      MaxMin.MinY = Math.min(...lat);

      state.mapData = data.map;
      state.libData = data.libraries;
    });

  drawMap();
}

init();
