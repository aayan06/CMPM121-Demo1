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
let totalOreThisLife: number = 0;
let souls: number = 0;
let reincarnationCount: number = 0;
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

function spawnFallingOre(url: string) {
  const ore = document.createElement("img");
  ore.src = url;
  ore.width = 48;
  ore.style.position = "fixed";
  ore.style.left = `${Math.random() * 90}vw`;
  document.body.append(ore);

  ore.animate([{ top: "0" }, { top: "100vh" }], 3000).onfinish = () => {
    ore.remove();
  };
}

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
image.style.cursor = "pointer";
image.style.userSelect = "none";

// add image as a button
image.addEventListener("click", () => {
  numTiles++;
  spawnFallingOre(image.src);
  image.animate([{ transform: "scale(1)" }, { transform: "scale(0.9)" }, {
    transform: "scale(1)",
  }], 100);
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

// fucntion for getting souls on reincarnation
function calculatePendingSouls(): number {
  return Math.floor(Math.sqrt(totalOreThisLife / 1000));
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

// reincarnate button
const reincarnateButton = document.createElement("button");
reincarnateButton.style.marginTop = "20px";
reincarnateButton.style.padding = "10px";

reincarnateButton.addEventListener("click", () => {
  const pendingSouls = calculatePendingSouls();
  souls += pendingSouls;
  reincarnationCount++;

  // reset the progress
  numTiles = 0;
  totalOreThisLife = 0;
  growthRate = 0;
  for (let i = 0; i < availableItems.length; i++) {
    availableItems[i].owned = 0;
  }
  updateUI();
});

app.append(
  heading,
  image,
  counterDisplay,
  rateDisplay,
  upgradesContainer,
  reincarnateButton,
);

function updateUI() {
  counterDisplay.textContent = `${Math.floor(numTiles)} Ores`;
  rateDisplay.textContent = `${growthRate} Ores/sec`;

  const pendingSouls = calculatePendingSouls();
  reincarnateButton.textContent =
    `Reincarnate (+${pendingSouls} Souls) - Mined this life: ${
      Math.floor(totalOreThisLife)
    }`;
  reincarnateButton.disabled = totalOreThisLife < 1000;

  //pick the highest ore tier unlocked by current rate
  const ore = ores.findLast((ore) =>
    growthRate >= ore.minRate || numTiles >= ore.minRate * 5
  )!;
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
    const gained = growthRate * deltaSeconds;
    numTiles += gained;
    totalOreThisLife += gained;
    updateUI();
  }

  requestAnimationFrame(gameLoop);
}

// to render and start the loop
updateUI();
requestAnimationFrame(gameLoop);
