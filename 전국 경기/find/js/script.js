const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

fetch("./find_library.json")
  .then((res) => res.json())
  .then((data) => {
    const minX = 126;
    const maxX = 127;
    const minMaxY = 35;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    function drawMap() {
      ctx.beginPath(); // 새 경로 시작
      data.map.forEach((e, i) => {
        const x = Math.floor(((e[0] - minX) * 1920) / (maxX - minX));
        const y = Math.floor((e[1] - minMaxY) * 1080);

        if (i === 0) {
          ctx.moveTo(x - 1000, y + 200); // 첫 점: (0,0)에서 그리지 않고 펜만 옮김
        } else {
          ctx.lineTo(x - 1000, y + 200); // 이후 점: 선으로 연결
        }
      });
      ctx.stroke(); // 한 번만 그리기

      ctx.closePath();
    }

    drawMap();

    ctx.beginPath();
    data.libraries.forEach((e) => {
      ctx.beginPath();
      const x = Math.floor(((e.longitude - minX) * 1920) / (maxX - minX));
      const y = Math.floor((e.latitude - minMaxY) * 1080);

      console.log(e.longitude);

      ctx.lineWidth = 1;
      ctx.strokeStyle = "black";

      ctx.arc(x - 1000, y + 200, 10, 0, Math.PI * 180);
      ctx.stroke();
      ctx.closePath();
    });
  });
