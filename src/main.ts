// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

// example theme of the game (Magic Tiles)
let numTiles: number = 0;

const app = document.querySelector<HTMLElement>("#app")!;

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
});

app.append(heading, image, clickButton);
