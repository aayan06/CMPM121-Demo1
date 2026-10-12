// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

// example theme of the game (Magic Tiles)
let numTiles: number = 0;
let growthRate: number = 0;
let lastTime: number = performance.now();

interface Item {
  name: string;
  baseCost: number;
  rate: number;
  owned: number;
  description: string;
}

const availableItems: Item[] = [
  {
    name: "Tile Polisher",
    baseCost: 10,
    rate: 1,
    owned: 0,
    description: "A simple cloth to polish tiles",
  },
  {
    name: "Tile Artisan",
    baseCost: 100,
    rate: 5,
    owned: 0,
    description: "Hire a expert tile maker",
  },
  {
    name: "Tile Factory",
    baseCost: 500,
    rate: 25,
    owned: 0,
    description: "A factory for tile production",
  },
];

const app = document.querySelector<HTMLElement>("#app")!;

// create counter and rate display
const counterDisplay = document.createElement("div");
counterDisplay.style.fontSize = "24px";
counterDisplay.style.margin = "10px 0";
counterDisplay.textContent = "0 EXAMPLE Tiles";

const rateDisplay = document.createElement("div");
rateDisplay.textContent = "0 Tiles/sec";

// display title
const heading = document.createElement("h1");
heading.textContent = "D1 project";

const image = document.createElement("img");
image.src = tileUrl;
image.alt = "A teal tile with a cream circle";
image.width = 96;
image.height = 96;

// create a button
const clickButton = document.createElement("button");
clickButton.textContent = "EXAMPLE BUTTON";
clickButton.style.padding = "10px";
clickButton.style.fontSize = "18px";
clickButton.style.margin = "10px 0";

clickButton.addEventListener("click", () => {
  numTiles++;
  updateUI();
});

// create upgrade boxes
const upgradesContainer = document.createElement("div");
upgradesContainer.style.display = "flex";
upgradesContainer.style.flexDirection = "column";
upgradesContainer.style.gap = "10px";
upgradesContainer.style.marginTop = "20px";

// function for evolving costs
function calculateCost(item: Item): number {
  return item.baseCost * Math.pow(1.15, item.owned);
}

// a loop for upgrade logic
for (let i = 0; i < availableItems.length; i++) {
  const item = availableItems[i];
  const button = document.createElement("button");
  button.id = `upgrade-${i}`;
  button.style.padding = "8px";
  button.style.textAlign = "left";

  button.addEventListener("click", () => {
    const currentCost = calculateCost(item);
    if (numTiles >= currentCost) {
      numTiles -= currentCost;
      item.owned++;
      growthRate += item.rate;
      updateUI();
    }
  });

  upgradesContainer.append(button);
}

app.append(
  heading,
  image,
  counterDisplay,
  rateDisplay,
  clickButton,
  upgradesContainer,
);

function updateUI() {
  counterDisplay.textContent = `${Math.floor(numTiles)} EXAMPLE Tiles`;
  rateDisplay.textContent = `${growthRate} Tiles/sec`;

  // update upgrade buttons for feedback
  for (let i = 0; i < availableItems.length; i++) {
    const item = availableItems[i];
    const currentCost = calculateCost(item);
    const button = document.getElementById(`upgrade-${i}`) as HTMLButtonElement;

    if (button) {
      button.textContent = `But ${item.name} (Owned: ${item.owned}) | cost: ${
        currentCost.toFixed(1)
      } Tiles | +${item.rate}/sec | ${item.description}`;
      button.disabled = numTiles < currentCost;
    }
  }
}

// created timed growth using animation frames and time spent
function gameLoop(timestamp: number) {
  const deltaSeconds = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (growthRate > 0) {
    numTiles += growthRate * deltaSeconds;
    updateUI();
  }

  requestAnimationFrame(gameLoop);
}

// to render and start the loop
updateUI();
requestAnimationFrame(gameLoop);
