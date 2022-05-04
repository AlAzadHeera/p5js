let framecount = 0;
let start_pipe_x = 500;
let c_size = 900; //Canvas size
let player;
let finish_line;
let capture;
let enter_press = false;
let faceapi;
let detections = [];
let spaceship;
let finishLine;
let asteroids = [];
let ast_colors = ["#9535C5", "#295EA8", "#3FE7FF", "#61FFAF", "#FF7B45"]
let alive = true;
let won = false;
var background;
var asteroid;
let winTimeout;

class Finish {
  constructor(x, y, w, h) {
    this.x = x; // Center position of spaceship
    this.y = y; // Center position of spaceship
    this.w = w;
    this.h = h;
  }

  show() {
    push()
    imageMode(CENTER);
    image(finishLine, this.x, this.y, this.w, this.h);
    pop()
    if (this.y < 50) {
      this.y += 1
    }
  }

  update() {
    this.y += 1
  }

  finishHit(spaceship) {
    let di = dist(0, this.y, 0, spaceship.y)
    if (di < 10) {
      return di
    }
  }

}

class Asteroid {
  constructor(r) {
    this.r = windowWidth / 15; //Size of the astaroids
    this.pos = createVector(random(1, width), 0);
    this.vel = createVector(0, random(1, 2));
    this.total = floor(random(1, 2));
    this.offset = [];
    this.color = random(ast_colors);
    for (var i = 0; i < this.total; i++) {
      this.offset[i] = random(-this.r * .5, this.r * .5);
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
    if (windowWidth > windowHeight) {
      this.w = windowWidth / 10;
      this.h = windowHeight / 7;
    } else {
      this.w = windowWidth / 7;
      this.h = windowHeight / 10;
    }
    this.v = 0;
  }

  //--------------------------- HIT------------------------//
  hits(asteroid) {
    let d = dist(this.x, this.y, asteroid.pos.x, asteroid.pos.y);
    return d < asteroid.r;
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
  finishLine = loadImage('./finish-line.svg')
}

function setup() {
  capture = createCapture(VIDEO);
  capture.size(c_size / 4, c_size / 3);
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
  player = new Spaceship(windowWidth / 2, windowHeight / 2, floor(spaceship.width / 3), floor(spaceship.height / 3));
  finish_line = new Finish(windowWidth / 2, -500, floor(windowWidth), floor(finishLine.height));
  start_pipe_x = windowWidth;
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
  if (mouseX > windowWidth / 2 - 100 && mouseX < windowWidth / 2 + 100 && mouseY > windowHeight / 2 + 50 && mouseY < windowHeight / 2 + 100) {
    alive = true;
    asteroids = [];
    for (let i = 0; i < 10; i++) {
      asteroids.push(new Asteroid(floor(random(30, 35))));
    }
    player = new Spaceship(windowWidth / 2, windowHeight / 2, floor(spaceship.width / 3), floor(spaceship.height / 3));
    finish_line = new Finish(windowWidth / 2, -500, floor(windowWidth), floor(finishLine.height));
  }

}
let x = c_size;
let prev_player = [c_size / 2, c_size / 2];




function draw() {
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
    }

    for (let i = 0; i < asteroids.length; i++) {
      asteroids[i].show();
      asteroids[i].update();
      if (asteroids[i].offscreen()) {
        asteroids.splice(i, 1);
        asteroids.push(new Asteroid(floor(random(40, 45))));
      }
    }

    for (let i = 0; i < asteroids.length; i++) {
      asteroids[i].show();
      asteroids[i].update();
      if (asteroids[i].offscreen()) {
        asteroids.splice(i, 1);
        asteroids.push(new Asteroid(floor(random(1, 3))));
      }
    }


    player.show()

    finish_line.show()

    if (finish_line.finishHit(player)) {
      alive = false;
      won = true;
    };


    for (let i = 0; i < asteroids.length; i++) {
      if (player.hits(asteroids[i])) {
        alive = false;
        won = false;
      }
    }

  } else {
    if (!alive && won) {
      if (windowWidth < 760) {
        textSize(25);
      } else {
        textSize(32);
      }
      textAlign(CENTER);
      fill(41, 94, 168);
      textFont('glitch');
      text("proceed by your will", windowWidth / 2, windowHeight / 2.3);
      push()
      //
      if (windowWidth < 760) {
        textSize(25);
      } else {
        textSize(32);
      }
      textAlign(CENTER);
      fill(149, 53, 197);
      textFont('glitch');
      text("victory is yours", windowWidth / 2, windowHeight / 2);
      push()
      pop()
    } else {
      if (windowWidth < 760) {
        textSize(25);
      } else {
        textSize(32);
      }
      textAlign(CENTER);
      fill(49, 53, 197);
      textFont('glitch');
      text("uh oh! you glitched out.", windowWidth / 2, windowHeight / 2);
      push()
      fill(149, 53, 197)
      text("TRY AGAIN", windowWidth / 2, windowHeight / 2 + 85);
      push()
      pop()
    }
  }
}