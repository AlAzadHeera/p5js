let framecount = 0;
let start_pipe_x = 500;
let c_size = 800; //Canvas size
let player;
let capture;
let enter_press = false;
let faceapi;
let detections = [];
let spaceship;
let asteroids = [];
let ast_colors = ["#9535C5", "#295EA8", "#3FE7FF", "#61FFAF", "#FF7B45"]
let alive = true;
let won = false;
var background;
var asteroid;

class Asteroid {
  constructor(r) {
    this.r = r * 1.5; //Size of the astaroids
    this.pos = createVector(random(50, width - 50), 0);
    this.vel = createVector(0, random(0.5, 1));
    this.total = floor(random(6, 10));
    this.offset = [];
    this.color = random(ast_colors);
    for (var i = 0; i < this.total; i++) {
      this.offset[i] = random(-this.r * 1.5, this.r * 1.5);
    }
  }

  offscreen() {
    return this.pos.x < -this.r || this.pos.x > width + this.r || this.pos.y < -this.r || this.pos.y > height + this.r;
  }

  show() {
    image(asteroid, this.pos.x, this.pos.y, this.r, this.r);
    image(asteroid, this.pos.x - 1, this.pos.y - 1, this.r, this.r);
  }

  update() {
    this.pos.add(this.vel)
  }
}

class Spaceship {
  constructor(x, y, w, h) {
    this.x = x; // Center position of spaceship
    this.y = y; // Center position of spaceship
    this.w = w * 1.5;
    this.h = h * 1.5;
    this.v = 0;
  }

  hits(asteroid) {
    let d = dist(this.x, this.y, asteroid.pos.x, asteroid.pos.y);
    return d <= asteroid.r;
  }

  show() {
    push()
    imageMode(CENTER);
    image(spaceship, this.x, this.y, this.w, this.h);
    pop()
  }

  update() {
    this.y += this.v;
    this.v += 1
    if (this.y < 0) {
      this.y == 0;
    }
  }

  offscreen() {
    return this.y > height || this.y < 0;
  }
}

function keyPressed() {
  if (keyCode == 32) {
    player.v -= 12;
  } else if (keyCode == 13) {
    enter_press = !enter_press;
  }
}

function preload() {
  spaceship = loadImage("./spaceship-02-min.png");
  background = loadImage("./background.svg");
  asteroid = loadImage("./asteroid.svg");
}

function setup() {
  capture = createCapture(VIDEO);
  capture.size(c_size / 4, c_size / 4);
  capture.hide();
  capture.id("video")
  console.log(capture)
  const faceOptions = {
    withLandmarks: true,
    withDescriptors: false,
    minConfidence: 0.5,
    Mobilenetv1Model: 'https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/faceapi/ssd_mobilenetv1_model-weights_manifest.json',

  };
  faceapi = ml5.faceApi(capture, faceOptions, faceReady);
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < 10; i++) {
    asteroids.push(new Asteroid(floor(random(30, 35))));
  }
  player = new Spaceship(c_size / 2, c_size / 2, floor(spaceship.width / 3), floor(spaceship.height / 3));
  start_pipe_x = c_size;
}

function faceReady() {
  faceapi.detect(gotFaces);
}

// Got faces
function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  detections = result;
  faceapi.detect(gotFaces);
}

function mousePressed() {
  if (mouseX > c_size / 2 - 100 && mouseX < c_size / 2 + 100 && mouseY > c_size / 2 + 50 && mouseY < c_size / 2 + 100) {
    alive = true;
    asteroids = [];
    for (let i = 0; i < 10; i++) {
      asteroids.push(new Asteroid(floor(random(30, 35))));
    }
    player = new Spaceship(c_size / 2, c_size / 2, floor(spaceship.width / 3), floor(spaceship.height / 3));
  }

}
let x = c_size;
let prev_player = [c_size / 2, c_size / 2];

function winPrompt() {
  alive = false
  won = true
}



function draw() {
  // background(0)
  image(background, 0, 0, windowWidth, windowHeight);
  if (alive) {
    if (detections.length > 0) {
      let face_x = detections[0].alignedRect._box._x * 4 + detections[0].alignedRect._box._width * 4 / 2;
      let face_y = detections[0].alignedRect._box._y * 4 + detections[0].alignedRect._box._height * 4 / 2;
      let pos_x = (face_x - prev_player[0]) * 5;
      let pos_y = (face_y - prev_player[1]) * 2;
      player.x -= pos_x;
      player.y += pos_y;
      prev_player = [face_x, face_y];
      push()
      textSize(18)
      textAlign(CENTER);
      fill(255);
      text("Face Detected", width - 150, 40);
      pop()
      console.log("Face Detected")
    }

    for (let i = 0; i < asteroids.length; i++) {
      asteroids[i].show();
      asteroids[i].update();
      if (asteroids[i].offscreen()) {
        asteroids.splice(i, 1);
        asteroids.push(new Asteroid(floor(random(30, 35))));
      }
    }

    player.show()

    let winTimeout = setTimeout(winPrompt, 60000)

    for (let i = 0; i < asteroids.length; i++) {
      if (player.hits(asteroids[i])) {
        alive = false;
        won = false;
        clearTimeout(winTimeout)
      }
    }
  } else {
    if (!alive && won) {
      textSize(32);
      textAlign(CENTER);
      fill(255);
      textFont('Oswald');
      text("Congratulations!!\nYou won the game!!", c_size / 2, c_size / 2);
      push()
      noFill()
      stroke(255)
      strokeWeight(1)
      rect(c_size / 2 - 100, c_size / 2 + 50, 200, 50);
      text("Restart", c_size / 2, c_size / 2 + 85);
      pop()
    } else {
      textSize(32);
      textAlign(CENTER);
      fill(255);
      textFont('Oswald');
      text("Game Over", c_size / 2, c_size / 2);
      push()
      noFill()
      stroke(255)
      strokeWeight(1)
      rect(c_size / 2 - 100, c_size / 2 + 50, 200, 50);
      text("Restart", c_size / 2, c_size / 2 + 85);
      pop()
    }
  }
}