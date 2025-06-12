/// <reference path="./p5.global-mode.d.ts" />
const container = document.getElementById("desk-img");

let deskImage;
let deskWidth, deskHeight;

let maxOffsetX, maxOffsetY;
let deskOffsetX = 0;
let deskOffsetY = 0;
let primaryColor = "#fa5004";
let objects = [];
let hoveredObject = null;
// variabili:
const deskScaleFactor = 1.2; // quando finestra < 1440px
const deskFollowSpeed = 0.05;

//velocità di transizione dell'immagine
const imageTransitionSpeed = 0.15;

// var custom cursor
let currentCursorX = 0;
let currentCursorY = 0;
const baseCursorSize = 10;
const hoveredCursorSize = baseCursorSize * 3;
let currentCursorSize = baseCursorSize;
const cursorFollowSpeed = 0.2;
const cursorSizeTransitionSpeed = 0.1;
let textAnimationTimer = 0;
let lastHoveredObject = null;

function preload() {
  deskImage = loadImage("./assets/foto-espansa-bn.webp");

  objects = [
    {
      name: "natura",
      x: 4714,
      y: 434,
      image: loadImage("./assets/naturaBN.png"),
      hoveredImage: loadImage("./assets/natura-hovered.png"),
      sound: loadSound("./assets/natura-beat.mp3"),
      transitionProgress: 0, // Add transition progress tracking
    },
    {
      name: "vinile",
      x: 3584,
      y: 785,
      image: loadImage("./assets/vinileBN.png"),
      hoveredImage: loadImage("./assets/vinile-hovered.png"),
      sound: loadSound("./assets/natura-beat.mp3"),
      transitionProgress: 0,
    },
    {
      name: "occhiali",
      x: 3335,
      y: 2225,
      image: loadImage("./assets/occhialiBN.png"),
      hoveredImage: loadImage("./assets/occhiali-hovered.png"),
      sound: loadSound("./assets/occhiali-beat.mp3"),
      transitionProgress: 0,
    },
    {
      name: "ping pong",
      x: 3858,
      y: 2395,
      image: loadImage("./assets/racchettaBN.png"),
      hoveredImage: loadImage("./assets/racchetta-hovered.png"),
      sound: loadSound("./assets/pingpong-beat.mp3"),
      transitionProgress: 0,
    },
    {
      name: "pianola",
      x: 1462,
      y: 1433,
      image: loadImage("./assets/pianolaBN.png"),
      hoveredImage: loadImage("./assets/pianola-hovered.png"),
      sound: loadSound("./assets/pianola-beat.mp3"),
      transitionProgress: 0,
    },
    {
      name: "calendario",
      x: 5134,
      y: 2449,
      image: loadImage("./assets/calendarioBN.png"),
      hoveredImage: loadImage("./assets/calendario-hovered.png"),
      sound: loadSound("./assets/calendario-beat.mp3"),
      transitionProgress: 0,
    },
    {
      name: "spartito",
      x: 0,
      y: 2095,
      image: loadImage("./assets/spartitoBN.png"),
      hoveredImage: loadImage("./assets/spartito-hovered.png"),
      sound: loadSound("./assets/spartito-beat.mp3"),
      transitionProgress: 0,
    },
    {
      name: "passaporto",
      x: 2615,
      y: 579,
      image: loadImage("./assets/passaportoBN.png"),
      hoveredImage: loadImage("./assets/passaporto-hovered.png"),
      sound: loadSound("./assets/passaporto-beat.mp3"),
      transitionProgress: 0,
    },
    {
      name: "liquore",
      x: 1778,
      y: 2240,
      image: loadImage("./assets/liquoreBN.png"),
      hoveredImage: loadImage("./assets/liquore-hovered.png"),
      sound: loadSound("./assets/liquore-beat.mp3"),
      transitionProgress: 0,
    },
    {
      name: "cucina",
      x: 21,
      y: 1337,
      image: loadImage("./assets/cucinaBN.png"),
      hoveredImage: loadImage("./assets/cucina-hovered.png"),
      sound: loadSound("./assets/cucina-beat.mp3"),
      transitionProgress: 0,
    },
  ];
}

function setup() {
  console.log("Setup called");
  console.log(
    "Container dimensions:",
    container.clientWidth,
    container.clientHeight
  );
  const canvasWidth = container.clientWidth;
  const canvasHeight = container.clientHeight;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent("desk-img");
  noCursor();
  container.style.cursor = "none";
  document.body.style.cursor = "none";

  calculateImageDimensions();
}

function calculateImageDimensions() {
  // considero le dimensioni del container (da figma dim base: 1440x1024)
  const isLargeDisplay = width >= 1440;

  if (isLargeDisplay) {
    // scala l'immagine per coprire il canvas senza margini
    // garantisce che l'immagine sia sempre della stessa dimensione del canvas
    const scaleX = width / deskImage.width;
    const scaleY = height / deskImage.height;
    // math.max()restituisce il valore più grande tra i due
    // --> prendo il massimo tra i due scale per mantenere le proporzioni
    const scale = Math.max(scaleX, scaleY);

    deskWidth = deskImage.width * scale;
    deskHeight = deskImage.height * scale;

    // minimo movimento del 5% della dimensione del canvas
    // --> minimo movimento anche quando l'immagine vicina alla dimensione del canvas
    maxOffsetX = width * 0.05;
    maxOffsetY = height * 0.05;
  } else {
    // scala l'immagine per coprire il canvas con un margine del 20%
    const scaleX = (width / deskImage.width) * deskScaleFactor;
    const scaleY = (height / deskImage.height) * deskScaleFactor;
    const scale = Math.max(scaleX, scaleY);

    deskWidth = deskImage.width * scale;
    deskHeight = deskImage.height * scale;

    // calcola il massimo offset in base alla dimensione dell'immagine scalata
    maxOffsetX = Math.max(0, (deskWidth - width) / 2);
    maxOffsetY = Math.max(0, (deskHeight - height) / 2);

    // fa si che il minimo movimento sia sempre il 5% della dimensione del canvas
    // questo garantisce che ci sia sempre un minimo di movimento anche quando l'immagine è vicina alla dimensione del canvas
    //NB per schermi più piccoli il movimento è + evidente...
    maxOffsetX = Math.max(maxOffsetX, width * 0.05);
    maxOffsetY = Math.max(maxOffsetY, height * 0.05);
  }
}

function draw() {
  background(0);

  // offset basato sulla posizione del mouse
  const mouseXNorm = mouseX / width;
  const mouseYNorm = mouseY / height;

  const deskTargetOffsetX = map(mouseXNorm, 0, 1, maxOffsetX, -maxOffsetX);
  const deskTargetOffsetY = map(mouseYNorm, 0, 1, maxOffsetY, -maxOffsetY);

  // lerp() aiuta ad avere un movimento + fluido/naturale: (velocità di transizione)
  // https://p5js.org/reference/p5/lerp/
  // funzione che permette di interpolare tra due valori
  // il terzo parametro è = fattore di interpolazione (5% del percorso)
  deskOffsetX = lerp(deskOffsetX, deskTargetOffsetX, deskFollowSpeed);
  deskOffsetY = lerp(deskOffsetY, deskTargetOffsetY, deskFollowSpeed);

  // centra l'immagine e applica gli offset
  const originX = (width - deskWidth) / 2 + deskOffsetX;
  // immagine alzata rispetto alla y del centro (per dare spazio all'header)
  const originY = (height - deskHeight) / 30 + deskOffsetY;

  image(deskImage, originX, originY, deskWidth, deskHeight);

  handleObjects(originX, originY);

  // nome oggetto hoverato
  drawCustomCursor();
}

function drawCustomCursor() {
  push();
  fill(primaryColor);
  noStroke();
  textFont("helvetica-neue-lt-pro");
  textStyle(BOLD);

  //delay
  currentCursorX = lerp(currentCursorX, mouseX, cursorFollowSpeed);
  currentCursorY = lerp(currentCursorY, mouseY, cursorFollowSpeed);

  //animazione dim cursrore - now includes mouse press state
  const targetSize =
    hoveredObject || mouseIsPressed ? hoveredCursorSize : baseCursorSize;
  currentCursorSize = lerp(
    currentCursorSize,
    targetSize,
    cursorSizeTransitionSpeed
  );

  circle(currentCursorX, currentCursorY, currentCursorSize);

  if (hoveredObject) {
    // ricomincia per evitare che si veda il nome dell'oggetto precedente
    if (lastHoveredObject !== hoveredObject) {
      textAnimationTimer = 0;
      lastHoveredObject = hoveredObject;
    }
    textAnimationTimer += 1;

    fill(255);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(14);

    const textX = currentCursorX + currentCursorSize / 2 + 10;
    const textY = currentCursorY;

    const objectName = hoveredObject.name.toUpperCase();

    if (textAnimationTimer < 10) {
      // 1. (primi 10 fotogrammi) --> []
      text("[]", textX, textY);
    } else {
      // 2. lettere una alla volta ogni 3 fotogrammi (finché non appare il nome completo)
      const lettersToShow = Math.floor((textAnimationTimer - 10) / 3);
      const visibleText = objectName.substring(
        0,
        Math.min(lettersToShow, objectName.length)
      );
      text(`[ ${visibleText} ]`, textX, textY);
    }
  } else {
    // reset
    lastHoveredObject = null;
    textAnimationTimer = 0;
  }

  pop();
}

function handleObjects(originX, originY) {
  const scaleX = deskWidth / deskImage.width;
  const scaleY = deskHeight / deskImage.height;

  for (const object of objects) {
    let x = object.x * scaleX + originX;
    let y = object.y * scaleY + originY;
    let w = object.image.width * scaleX;
    let h = object.image.height * scaleY;

    object.transformedX = x;
    object.transformedY = y;
    object.transformedW = w;
    object.transformedH = h;
  }

  checkMouseCollision(
    originX,
    originY,
    deskWidth / deskImage.width,
    deskHeight / deskImage.height
  );

  updateImageTransitions();

  drawObjects(
    originX,
    originY,
    deskWidth / deskImage.width,
    deskHeight / deskImage.height
  );
}

function updateImageTransitions() {
  for (const object of objects) {
    const isHovered = object === hoveredObject;
    object.transitionProgress = isHovered ? 1 : 0;
  }
}

function drawObjects() {
  for (const object of objects) {
    const x = object.transformedX;
    const y = object.transformedY;
    const w = object.transformedW;
    const h = object.transformedH;

    // Use direct transition progress without easing
    const progress = object.transitionProgress;

    if (progress > 0.01) {
      // diminuisce opacità img di base per effetto migliore
      // e aumenta opacità dell'immagine hoverata
      tint(255, 255 * (1 - progress));
      image(object.image, x, y, w, h);
      tint(255, 255 * progress);
      image(object.hoveredImage, x, y, w, h);

      // resetta per evitare che rimangano al successivo hover
      noTint();
    } else {
      image(object.image, x, y, w, h);
    }
  }
}

function checkMouseCollision() {
  const previousObject = hoveredObject;
  hoveredObject = null;

  for (const object of objects) {
    if (!object.image) continue;

    const collision = isMouseOverObject(object, mouseX, mouseY);

    if (collision) {
      hoveredObject = object;
      if (previousObject !== hoveredObject) {
        // Start to play sound if new hoveredObject is different from previousObject
        hoveredObject.sound.play();
      }
      break;
    }
  }

  if (hoveredObject === null && previousObject !== null) {
    // Stop all sound if no collision is found but previousObject was hovered.
    for (const object of objects) {
      object.sound.stop();
    }
  }
}

function isMouseOverObject(object, mouseX, mouseY) {
  const objX = object.transformedX;
  const objY = object.transformedY;
  const objW = object.transformedW;
  const objH = object.transformedH;

  if (
    mouseX < objX ||
    mouseX > objX + objW ||
    mouseY < objY ||
    mouseY > objY + objH
  ) {
    return false;
  }

  const localX = map(mouseX, objX, objX + objW, 0, object.image.width);
  const localY = map(mouseY, objY, objY + objH, 0, object.image.height);

  if (
    localX < 0 ||
    localX >= object.image.width ||
    localY < 0 ||
    localY >= object.image.height
  ) {
    return false;
  }

  const pixelColor = object.image.get(floor(localX), floor(localY));

  const alphaThreshold = 50;
  return pixelColor[3] > alphaThreshold;
}

function mousePressed() {
  if (hoveredObject) {
    handleObjectClick(hoveredObject);
    return false;
  }
}

function handleObjectClick(object) {
  const objectNameForURL = object.name.replace(/\s+/g, "");
  const targetURL = `https://wddc-noproblem.webflow.io/${objectNameForURL}`;

  // apre url nellas tessa window/tab
  window.location.href = targetURL;

  // ferma il suono quando si clicca su un oggetto
  object.sound.stop();
}

function windowResized() {
  resizeCanvas(container.clientWidth, container.clientHeight);
  calculateImageDimensions();
}
