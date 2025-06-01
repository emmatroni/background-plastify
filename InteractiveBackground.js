/// <reference path="./p5.global-mode.d.ts" />
const container = document.getElementById("bg-img-container");

let deskImage;
let deskWidth, deskHeight;

let maxOffsetX, maxOffsetY;
let deskOffsetX = 0;
let deskOffsetY = 0;

let objects = [];
let hoveredObject = null; // Track which object is being hovered

function preload() {
  deskImage = loadImage("./assets/foto-espansa-bn.webp");

  objects = [
    {
      name: "piantina",
      x: 4714,
      y: 434,
      image: loadImage("./assets/piantinaBN.png"),
      hoveredImage: loadImage("./assets/piantina-hovered.png"),
      sound: loadSound("./assets/piantina-beat.mp3"),
    },
    {
      name: "vinile",
      x: 3584,
      y: 785,
      image: loadImage("./assets/vinileBN.png"),
      hoveredImage: loadImage("./assets/vinile-hovered.png"),
      sound: loadSound("./assets/piantina-beat.mp3"),
    },
    {
      name: "occhiali",
      x: 3335,
      y: 2225,
      image: loadImage("./assets/occhialiBN.png"),
      hoveredImage: loadImage("./assets/occhiali-hovered.png"),
      sound: loadSound("./assets/piantina-beat.mp3"),
    },
    {
      name: "racchetta",
      x: 3858,
      y: 2395,
      image: loadImage("./assets/racchettaBN.png"),
      hoveredImage: loadImage("./assets/racchetta-hovered.png"),
      sound: loadSound("./assets/racchetta-beat.mp3"),
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
  canvas.parent("bg-img-container");

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

    // minimo movimento del 2% della dimensione del canvas
    // --> minimo movimento anche quando l'immagine è vicina alla dimensione del canvas
    maxOffsetX = width * 0.02;
    maxOffsetY = height * 0.02;
  } else {
    // scala l'immagine per coprire il canvas con un margine del 10%
    const scaleX = (width / deskImage.width) * 1.1;
    const scaleY = (height / deskImage.height) * 1.1;
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

  // lerp() aiuta ad avere un movimento + fluido/naturale:
  // https://p5js.org/reference/p5/lerp/
  // funzione che permette di interpolare tra due valori
  // il terzo parametro è = fattore di interpolazione (5% del percorso)
  deskOffsetX = lerp(deskOffsetX, deskTargetOffsetX, 0.05);
  deskOffsetY = lerp(deskOffsetY, deskTargetOffsetY, 0.05);

  // centra l'immagine e applica gli offset
  const originX = (width - deskWidth) / 2 + deskOffsetX;
  const originY = (height - deskHeight) / 2 + deskOffsetY;

  image(deskImage, originX, originY, deskWidth, deskHeight);

  handleObjects(originX, originY);
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

  drawObjects(
    originX,
    originY,
    deskWidth / deskImage.width,
    deskHeight / deskImage.height
  );

  // Change cursor if hovering over an object
  if (hoveredObject) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

function drawObjects() {
  for (const object of objects) {
    const x = object.transformedX;
    const y = object.transformedY;
    const w = object.transformedW;
    const h = object.transformedH;

    if (object === hoveredObject) {
      image(object.hoveredImage, x, y, w, h);
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
  switch (object.name) {
    case "piantina":
      console.log("Plant clicked! You can add your custom logic here.");
      object.sound.play();
      object.sound.stop();
      break;
    default:
      console.log(`Clicked on unknown object: ${object.name}`);
  }
}

function windowResized() {
  resizeCanvas(container.clientWidth, container.clientHeight);
  calculateImageDimensions();
}
