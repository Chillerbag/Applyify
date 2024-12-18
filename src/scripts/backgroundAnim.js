/*
File: backgroundAnim.js
Description:  the html5 canvas code for the main popup and side panel
Last modified: 29/11/2024 by Ethan
*/

let calculating = false;
const CALC_SPEED = 20;
const CALC_SPAWN_RATE = 0.8;
const CALC_MAX_BUBBLES = 100;

const NORMAL_SPAWN_RATE = 0.03;
const NORMAL_MAX_BUBBLES = 40;

const canvas = document.getElementById("bubbleCanvas");
const context = canvas.getContext("2d");

// this is mainly for the sidepanel
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  context.scale(dpr, dpr);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

class Bubble {
  constructor() {
    // Spawn at random position
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 50 + 10;
    this.speed = Math.random() * 0.5 + 0.2;
    this.opacity = Math.random() * 0.3 + 0.3;
    this.fadingOut = false;
    this.remove = false;
  }

  update() {
    // Move bubble upward, faster if calculating
    if (calculating) {
      this.y -= this.speed * CALC_SPEED;
    } else {
      this.y -= this.speed;
    }
    this.x += Math.sin(this.y * 0.01) * 0.5;

    // Start fading out at random moments
    if (!this.fadingOut && Math.random() < 0.001) {
      this.fadingOut = true;
    }

    // Handle fading
    if (this.fadingOut) {
      this.opacity -= 0.01;
      if (this.opacity <= 0) {
        this.remove = true;
      }
    }
  }

  draw() {
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.fillStyle = `rgba(33, 150, 243, ${this.opacity})`;
    context.fill();
  }
}

let bubbles = [];

// initial bubble population
for (let i = 0; i < 20; i++) {
  bubbles.push(new Bubble());
}

function animate() {
  context.fillStyle = "#212121";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // remove faded bubbles
  bubbles = bubbles.filter((bubble) => !bubble.remove);

  // randomly spawn new bubbles
  let spawnRate = NORMAL_SPAWN_RATE;
  let maxBubbles = NORMAL_MAX_BUBBLES;
  if (calculating) {
    spawnRate = CALC_SPAWN_RATE;
    maxBubbles = CALC_MAX_BUBBLES;
  }
  if (Math.random() < spawnRate && bubbles.length < maxBubbles) {
    bubbles.push(new Bubble());
  }

  // Update and draw remaining bubbles
  bubbles.forEach((bubble) => {
    bubble.update();
    bubble.draw();
  });
  // foooorrrrrrreeeeeeevvvvvvvvveeeeeeerrrrrrrrrr
  requestAnimationFrame(animate);
}

animate();
