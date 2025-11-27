const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const puppeteer = require("puppeteer");

const app = express();
// app.get("/", (req, res) => {
//   res.send(`<h1 style="font-family:sans-serif;">Server is running ✔</h1>`);
// });
const upload = multer();
app.use(bodyParser.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = path.join(__dirname, "output");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// Serve static files (after vite build, dist/)
app.use(express.static(path.join(__dirname, "dist")));

// Endpoint that receives uploaded recording from frontend
app.post("/api/upload/:id", upload.single("video"), (req, res) => {
  const id = req.params.id;
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ success: false, error: "No file" });
  }
  const filename = `render-${id}-${Date.now()}.webm`;
  const full = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(full, req.file.buffer);
  console.log("Saved", full);
  return res.json({ success: true, file: `/output/${filename}`, filename, fullPath: full });
});

// Expose output folder for downloads
app.use("/output", express.static(OUTPUT_DIR));

// Main render endpoint: accepts JSON script
app.post("/api/render", async (req, res) => {
  const script = req.body;
  if (!script) return res.status(400).json({ success: false, error: "No script" });

  const id = uuidv4();
  const dataBase64 = Buffer.from(JSON.stringify(script)).toString("base64url");

  // Launch puppeteer and navigate to the renderer page served by this same server.
  // The renderer page will automatically start the playback and record and POST the webm to /api/upload/:id
  try {
    const browser = await puppeteer.launch({
      headless: false, // Visible for debugging and screen capture reliability
      defaultViewport: { width: 360, height: 640, deviceScaleFactor: 3 },
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--enable-usermedia-screen-capturing",
        "--allow-http-screen-capture",
        "--auto-select-desktop-capture-source=pick-one",
        "--autoplay-policy=no-user-gesture-required",
        "--window-size=1080,1920" // Keep window large enough
      ]
    });

    const page = await browser.newPage();
    // Increase timeout just in case
    page.setDefaultNavigationTimeout(120000);

    // Log browser console messages to node console
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    // Expose a function that frontend will call when done
    let uploaded = false;
    await page.exposeFunction("__node_upload_done", async () => {
      uploaded = true;
    });

    // open renderer URL with data param
    // pointing to Vite dev server port 5173 to ensure we load the React app
    const url = `http://localhost:5173/?render=1&data=${dataBase64}&id=${id}`;
    console.log("Opening", url);
    await page.goto(url, { waitUntil: "networkidle0" });

    // Wait for upload to hit server endpoint. We'll poll for file presence in output directory.
    const waitFor = 120000; // 2 minutes
    const start = Date.now();
    // Poll scanning output dir for the id in filenames
    while (Date.now() - start < waitFor && !uploaded) {
      // check for file with id
      const files = fs.readdirSync(OUTPUT_DIR);
      const found = files.find(f => f.includes(id));
      if (found) {
        uploaded = true;
        break;
      }
      await new Promise(r => setTimeout(r, 500));
    }

    await page.close();
    await browser.close();

    if (!uploaded) {
      console.warn("Render timeout or failed to upload");
      return res.status(500).json({ success: false, error: "Render timeout or failed to upload" });
    } else {
      console.log("Render/upload completed for", id);
      // Find the specific file to return the correct name
      const files = fs.readdirSync(OUTPUT_DIR);
      const found = files.find(f => f.includes(id));
      return res.json({ success: true, id, file: `/output/${found}`, message: "Render completed" });
    }

  } catch (err) {
    console.error("puppeteer error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
