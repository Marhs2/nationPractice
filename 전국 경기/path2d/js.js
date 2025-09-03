const canvas = document.getElementById("can");
const ctx = canvas.getContext("2d");

// function draw(setX, setY) {
//   ctx.beginPath();
//   const myCircle = new Path2D();

//   myCircle.rect(setX, setY, 100, 100);

//   ctx.fillStyle = "lightblue";

//   ctx.fill(myCircle);

//   canvas.addEventListener("mousemove", (event) => {
//     const rect = canvas.getBoundingClientRect();
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;
//     const $popUp = document.querySelector(".popUp");

//   });

//   ctx.closePath();
// }

// draw(500, 200);
// draw(600, 400);
// draw(300, 700);

let hoveredIdx = -1;

const abc = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const arr = [
    [300, 700],
    [200, 400],
    [500, 500],
  ];
  let array = [];

  arr.forEach(([lon, lat], idx) => {
    const path = new Path2D();
    path.arc(lon, lat, 50, 0, Math.PI * 2);
    ctx.fillStyle = idx === hoveredIdx ? `#c12d3d` : `#64b0b0`;
    ctx.fill(path);
    array.push({ path, lon, lat, idx });
  });

  canvas.onmousemove = (e) => {
    const que = array.findIndex(({ path }) =>
      ctx.isPointInPath(path, e.clientX, e.clientY)
    );

    const popUp = document.querySelector(".popUp");
    if (que >= 0) {
      hoveredIdx = que;
      popUp.setAttribute("style", `left:${arr[que][0]}px;top:${arr[que][1]}px`);
    } else {
      hoveredIdx = -1;
      popUp.setAttribute("style", `display:none`);
    }
    abc();
  };

  canvas.onmousedown = (e) => {
    const que = array.findIndex(({ path }) =>
      ctx.isPointInPath(path, e.clientX, e.clientY)
    );

    console.log(que + "번째 클릭됨");
    if (que >= 0) hoveredIdx = que;
    else hoveredIdx = -1;
    abc();
  };
};

abc();
