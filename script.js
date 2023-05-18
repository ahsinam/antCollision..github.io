const mainContainer = document.getElementById("container");
const scoreElement = document.getElementById("score");

const gerenateRandomNumber = (maxLimit = 400) => {
  let xRandom = Math.floor(Math.random() * maxLimit);
  let yRandom = Math.floor(Math.random() * maxLimit);
  let dxRandom = Math.floor((Math.random() * maxLimit) / 30);
  let dyRandom = Math.floor((Math.random() * maxLimit) / 30);
  return { xRandom, yRandom, dxRandom, dyRandom };
};

const rotate = (velocityX, velocityY, angle) => {
  const rotatedVelocities = {
    x: velocityX * Math.cos(angle) - velocityY * Math.sin(angle),
    y: velocityX * Math.sin(angle) + velocityY * Math.cos(angle),
  };

  return rotatedVelocities;
};

const getDistance = (x1, y1, x2, y2) => {
  const xDist = x2 - x1;
  const yDist = y2 - y1;
  const distance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

  return distance;
};

let antInstances = [];
let score = 0;

mainContainer.addEventListener("mouseover", (event) => {
  mainContainer.style.cursor = "pointer";
});

class AntCollisionGame {
  constructor(id, x, y, dx, dy, mass) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.mass = mass;
    this.timer = null;
  }

  drawAnt = (x, y) => {
    const mainContainer = document.getElementById("container");
    const oneAnt = document.createDocumentFragment();
    const antElement = document.createElement("img");

    antElement.classList.add("ant");
    antElement.setAttribute("id", this.id);
    antElement.setAttribute("src", "./antImage.png");
    antElement.style.left = x + "px";
    antElement.style.top = y + "px";

    antElement.addEventListener("click", () => {
      let reaminingAnts = antInstances.filter((ant) => {
        return ant.id !== this.id;
      });
      score++;
      antInstances = reaminingAnts;
      scoreElement.innerHTML = score;
      antElement.remove();
      if (this.timer) {
        clearInterval(this.timer);
      }
    });
    oneAnt.appendChild(antElement);
    mainContainer.appendChild(oneAnt);
  };

  resolveCollision = (particle, otherParticle) => {
    const xVelocityDiff = this.dx - otherParticle.dx;
    const yVelocityDiff = this.dy - otherParticle.dy;

    const xDist = otherParticle.x - this.x;
    const yDist = otherParticle.y - this.y;

    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
      const angle = -Math.atan2(
        otherParticle.y - this.y,
        otherParticle.x - this.x
      );

      const m1 = this.mass;
      const m2 = otherParticle.mass;

      const u1 = rotate(this.dx, this.dy, angle);
      const u2 = rotate(otherParticle.dx, otherParticle.dy, angle);

      const v1 = {
        x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
        y: u1.y,
      };
      const v2 = {
        x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2) <= 0,
        y: u2.y,
      };

      const vFinal1 = rotate(v1.x, v1.y, -angle);

      const vFinal2 = rotate(v2.x, v2.y, -angle);

      this.dx = vFinal1.x;
      this.dy = vFinal1.y;

      otherParticle.dx = vFinal2.x;
      otherParticle.dy = vFinal2.y;
    }
  };

  moveAnt = () => {
    const mainContainer = document.getElementById("container");
    const ant = document.querySelector(".ant");
    mainContainer.removeChild(document.querySelector(".ant"));
    const containerWidth = mainContainer.offsetWidth;
    const containerHeight = mainContainer.offsetHeight;
    if (this.x + this.dx + 40 > containerWidth || this.x < 0) {
      this.dx = this.dx * -1;
    }
    if (this.y + this.dy + 40 > containerHeight || this.y < 0) {
      this.dy = this.dy * -1;
    }

    antInstances.forEach((ant) => {
      if (this.id !== ant.id) {
        if (getDistance(this.x, this.y, ant.x, ant.y) <= 40) {
          this.resolveCollision(this, ant);
        }
      }
    });

    this.x = this.x + this.dx;
    this.y = this.y + this.dy;
    this.drawAnt(this.x, this.y);
  };

  init = () => {
    this.drawAnt(this.x, this.y);
    this.timer = setInterval(() => {
      this.moveAnt();
    }, 1000);
  };
}

for (i = 0; i < 20; i++) {
  let x = gerenateRandomNumber().xRandom;
  let y = gerenateRandomNumber().yRandom;
  let dx = gerenateRandomNumber().dxRandom;
  let dy = gerenateRandomNumber().dyRandom;
  let mass = i;
  //Ensures that two ants don't collide while they are generated randomly at the very 1st time
  if (i !== 0) {
    for (j = 0; j < antInstances.length; j++) {
      if (getDistance(x, y, antInstances[j].x, antInstances[j].y) <= 40) {
        x = gerenateRandomNumber().xRandom;
        y = gerenateRandomNumber().yRandom;
        dx = gerenateRandomNumber().dxRandom;
        dy = gerenateRandomNumber().dyRandom;
        j = -1;
      }
    }
  }
  const ant = new AntCollisionGame(i, x, y, dx, dy, mass);
  antInstances.push(ant);
  ant.init();
}
