// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
// import tileUrl from "./assets/tile.svg?no-inline";
// @deno-types="./asset-url.d.ts"
import stoneUrl from "./assets/stone.png?no-inline";
// @deno-types="./asset-url.d.ts"
import ironUrl from "./assets/iron.png?no-inline";
// @deno-types="./asset-url.d.ts"
import diamondUrl from "./assets/diamond.png?no-inline";
//  @deno-types="./asset-url.d.ts"
import rubyUrl from "./assets/ruby.png?no-inline";

// example theme of the game (Magic Tiles)
let numTiles: number = 0;
let growthRate: number = 0;
let lastTime: number = performance.now();

interface Ore {
  name: string;
  minRate: number;
  url: string;
}

const ores: Ore[] = [
  { name: "stone", minRate: 0, url: stoneUrl },
  { name: "iron", minRate: 5, url: ironUrl },
  { name: "diamond", minRate: 10, url: diamondUrl },
  { name: "ruby", minRate: 15, url: rubyUrl },
];

interface Item {
  name: string;
  baseCost: number;
  rate: number;
  owned: number;
  description: string;
}

const availableItems: Item[] = [
  {
    name: "Apprentice Miner",
    baseCost: 10,
    rate: 1,
    owned: 0,
    description: "A helper with a pickaxe",
  },
  {
    name: "Mine Cart",
    baseCost: 100,
    rate: 5,
    owned: 0,
    description: "Hauls ore out of the mine faster",
  },
  {
    name: "Drill Rig",
    baseCost: 500,
    rate: 25,
    owned: 0,
    description: "Heavy machinery to mine nonstop",
  },
];

const app = document.querySelector<HTMLElement>("#app")!;

app.style.display = "flex";
app.style.flexDirection = "column";
app.style.alignItems = "center";
app.style.justifyContent = "center";

// create counter and rate display
const counterDisplay = document.createElement("div");
counterDisplay.style.fontSize = "24px";
counterDisplay.style.margin = "10px 0";
counterDisplay.textContent = "0 Ores";

const rateDisplay = document.createElement("div");
rateDisplay.textContent = "0 Ores/sec";

// display title
const heading = document.createElement("h1");
heading.textContent = "Mining Clicker";

const image = document.createElement("img");
image.src = stoneUrl;
image.alt = "A grey stone ore";
image.width = 96;
image.height = 96;

// create a button
const clickButton = document.createElement("button");
clickButton.textContent = "Mine";
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
  counterDisplay.textContent = `${Math.floor(numTiles)} Ores`;
  rateDisplay.textContent = `${growthRate} Ores/sec`;

  //pick the highest ore tier unlocked by current rate
  const ore = ores.findLast((ore) => growthRate >= ore.minRate)!;
  image.src = ore.url;
  image.alt = `A ${ore.name} ore`;

  // update upgrade buttons for feedback
  for (let i = 0; i < availableItems.length; i++) {
    const item = availableItems[i];
    const currentCost = calculateCost(item);
    const button = document.getElementById(`upgrade-${i}`) as HTMLButtonElement;

    if (button) {
      button.textContent = `Buy ${item.name} (Owned: ${item.owned}) | cost: ${
        currentCost.toFixed(1)
      } Ores | +${item.rate}/sec | ${item.description}`;
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
