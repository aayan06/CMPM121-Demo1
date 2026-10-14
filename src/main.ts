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
  { name: "iron", minRate: 50, url: ironUrl },
  { name: "diamond", minRate: 100, url: diamondUrl },
  { name: "ruby", minRate: 200, url: rubyUrl },
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

interface PickaxeClass {
  name: string;
  upside: string;
  downside: string;
  unlockReincarnations: number;
  clickMult: number;
  idleMult: number;
  rareChance: number;
  critChance: number;
  soulMult: number;
}

const pickaxeClasses: PickaxeClass[] = [
  {
    name: "Rusty Pickaxe",
    upside: "Baseline",
    downside: "None",
    unlockReincarnations: 0,
    clickMult: 1,
    idleMult: 1,
    rareChance: 0,
    critChance: 0,
    soulMult: 1,
  },
  {
    name: "Cooper Pick",
    upside: "+50% click yield",
    downside: "-10% idle production",
    unlockReincarnations: 1,
    clickMult: 1.5,
    idleMult: 0.9,
    rareChance: 0,
    critChance: 0,
    soulMult: 1,
  },
  {
    name: "Speed Hammer",
    upside: "+100% click rate",
    downside: "-30% yield/click",
    unlockReincarnations: 2,
    clickMult: 1.4,
    idleMult: 1,
    rareChance: 0,
    critChance: 0,
    soulMult: 1,
  },
  {
    name: "Heavy Maul",
    upside: "+200% yield/click",
    downside: "-50% click rate",
    unlockReincarnations: 3,
    clickMult: 3.0,
    idleMult: 0.8,
    rareChance: 0,
    critChance: 0,
    soulMult: 1,
  },
  {
    name: "Prospector's Pick",
    upside: "+20% rare ore chance (x10 value)",
    downside: "-15% base yield",
    unlockReincarnations: 5,
    clickMult: 0.85,
    idleMult: 0.85,
    rareChance: 0.2,
    critChance: 0,
    soulMult: 1,
  },
  {
    name: "Auto-Digger Rig",
    upside: "+100% idle production",
    downside: "-50% click yield",
    unlockReincarnations: 8,
    clickMult: 0.5,
    idleMult: 2.0,
    rareChance: 0,
    critChance: 0,
    soulMult: 1,
  },
  {
    name: "Gambler's Pick",
    upside: "10% crit for x25",
    downside: "-30% yield otherwise",
    unlockReincarnations: 12,
    clickMult: 0.7,
    idleMult: 0.7,
    rareChance: 0,
    critChance: 0.1,
    soulMult: 1,
  },
  {
    name: "Soul-Touched Pick",
    upside: "+50% Souls on reincarnate",
    downside: "-25% mining speed",
    unlockReincarnations: 15,
    clickMult: 0.75,
    idleMult: 0.75,
    rareChance: 0,
    critChance: 0,
    soulMult: 1.5,
  },
  {
    name: "Diamond Pickaxe",
    upside: "+300% to everything",
    downside: "None",
    unlockReincarnations: 25,
    clickMult: 4.0,
    idleMult: 4.0,
    rareChance: 0,
    critChance: 0,
    soulMult: 4.0,
  },
];

let currentClass: PickaxeClass = pickaxeClasses[0];

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

// soul and reincarnation UI
const soulDisplay = document.createElement("div");
soulDisplay.style.marginTop = "5px";
soulDisplay.style.fontWeight = "bold";

const classDisplay = document.createElement("div");
classDisplay.style.marginTop = "5px";

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

function getCLickYield(): number {
  let amount = 1 * currentClass.clickMult;
  if (Math.random() < currentClass.rareChance) {
    amount *= 10;
  }
  if (Math.random() < currentClass.critChance) {
    amount *= 25;
  }
  return amount;
}

function getEffectiveIdleRate(): number {
  return growthRate * currentClass.idleMult;
}

// add image as a button
image.addEventListener("click", () => {
  const gained = getCLickYield();
  numTiles += gained;
  totalOreThisLife += gained;
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

// pickaxe class selection containers
const classesHeading = document.createElement("h3");
classesHeading.textContent = "Pickaxe Classes";
classesHeading.style.marginBottom = "5px";

const classesContainer = document.createElement("div");
classesContainer.style.display = "flex";
classesContainer.style.flexDirection = "column";
classesContainer.style.gap = "6px";

for (let i = 0; i < pickaxeClasses.length; i++) {
  const pickClass = pickaxeClasses[i];
  const button = document.createElement("button");
  button.id = `class-${i}`;
  button.style.padding = "6px";
  button.style.textAlign = "left";

  button.addEventListener("click", () => {
    if (reincarnationCount >= pickClass.unlockReincarnations) {
      currentClass = pickClass;
      updateUI();
    }
  });
  classesContainer.append(button);
}

app.append(
  heading,
  image,
  counterDisplay,
  rateDisplay,
  soulDisplay,
  classDisplay,
  upgradesContainer,
  reincarnateButton,
  classesHeading,
  classesContainer,
);

function updateUI() {
  counterDisplay.textContent = `${Math.floor(numTiles)} Ores`;
  rateDisplay.textContent = `${growthRate} Ores/sec`;
  soulDisplay.textContent =
    `Souls: ${souls} | Reincarnations: ${reincarnationCount}`;
  classDisplay.textContent =
    `Equipped Class: ${currentClass.name} (${currentClass.upside}, ${currentClass.downside})`;

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

  // update pickaxe class buttons
  for (let i = 0; i < pickaxeClasses.length; i++) {
    const pickClass = pickaxeClasses[i];
    const button = document.getElementById(`class-${i}`) as HTMLButtonElement;
    const unlocked = reincarnationCount >= pickClass.unlockReincarnations;

    if (button) {
      button.textContent =
        `${pickClass.name} | Upside: ${pickClass.upside} | Downside: ${pickClass.downside} (Req: ${pickClass.unlockReincarnations} Reincarnations)`;
      button.disabled = !unlocked || currentClass.name === pickClass.name;
    }
  }
}

// created timed growth using animation frames and time spent
function gameLoop(timestamp: number) {
  const deltaSeconds = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  const effectiveRate = getEffectiveIdleRate();
  if (effectiveRate > 0) {
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
