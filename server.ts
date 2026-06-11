import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const databasePath = path.join(process.cwd(), "database.json");

// Helper to read database safely
function readDb() {
  try {
    if (fs.existsSync(databasePath)) {
      const data = fs.readFileSync(databasePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading database:", error);
  }
  return {
    settings: {
      adUrl: "https://beastlyfluke.com/p8qcw7a1?key=469a489eda52c136a8c82a6094debcbe",
      redirectType: "global",
      selectedTheme: "youtube",
      pageTitle: "Tale Viral Link",
      selectedCategory: "viral"
    },
    videos: [
      {
        id: "v1",
        title: "Indian hot neighbors Bhabhi amazing erotic sex with Punjabi man! Clear Hindi audio",
        channelName: "Desi Hot Streams",
        channelLogo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&q=80",
        views: "4.7M",
        timeAgo: "3 hours ago",
        duration: "6:54",
        thumbnailUrl: "https://i.postimg.cc/FHLD2BFM/xn-9-t.jpg",
        category: "viral"
      },
      {
        id: "v2",
        title: "Desi Sexy girl Hardcore Sex! Love you babe",
        channelName: "Exotic Desi Vibes",
        channelLogo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&q=80",
        views: "5.2M",
        timeAgo: "5 hours ago",
        duration: "7:54",
        thumbnailUrl: "https://i.postimg.cc/vHPJQksB/xn-27-t.jpg",
        category: "viral"
      },
      {
        id: "v3",
        title: "Desi wife hard core fuking",
        channelName: "Desi Premium Hub",
        channelLogo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&q=80",
        views: "879K",
        timeAgo: "9 hours ago",
        duration: "5:45",
        thumbnailUrl: "https://i.postimg.cc/MTQ6Rxz3/xn-6-t.jpg",
        category: "viral"
      },
      {
        id: "v4",
        title: "Desi indian Student College Girl Sex With Her Boyfriend",
        channelName: "Campus Viral Club",
        channelLogo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&q=80",
        views: "8.2M",
        timeAgo: "1 day ago",
        duration: "5:45",
        thumbnailUrl: "https://i.postimg.cc/tJX1kL1h/xv-30-t.jpg",
        category: "viral"
      }
    ],
    clickCount: 0,
    statsBreakdown: {}
  };
}

// Helper to write database safely
function writeDb(data: any) {
  try {
    fs.writeFileSync(databasePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing database:", error);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Get live website configuration & counts
  app.get("/api/data", (req, res) => {
    res.json(readDb());
  });

  // API: Save updated website configurations globally (Permanent)
  app.post("/api/save", (req, res) => {
    const { settings, videos } = req.body;
    if (!settings || !videos) {
      return res.status(400).json({ error: "Missing settings or videos fields" });
    }

    const currentDb = readDb();
    currentDb.settings = settings;
    currentDb.videos = videos;

    const success = writeDb(currentDb);
    if (success) {
      res.json({ message: "Settings saved successfully on server!", db: currentDb });
    } else {
      res.status(500).json({ error: "Failed to persist data on server disk" });
    }
  });

  // API: Track click on the server side
  app.post("/api/click", (req, res) => {
    const { itemId } = req.body;
    const currentDb = readDb();
    
    currentDb.clickCount = (currentDb.clickCount || 0) + 1;
    if (!currentDb.statsBreakdown) {
      currentDb.statsBreakdown = {};
    }

    const key = itemId || "global_click";
    currentDb.statsBreakdown[key] = (currentDb.statsBreakdown[key] || 0) + 1;

    const success = writeDb(currentDb);
    if (success) {
      res.json({ success: true, clickCount: currentDb.clickCount, statsBreakdown: currentDb.statsBreakdown });
    } else {
      res.status(500).json({ error: "Failed to register click on server" });
    }
  });

  // API: Reset stats
  app.post("/api/reset-stats", (req, res) => {
    const currentDb = readDb();
    currentDb.clickCount = 0;
    currentDb.statsBreakdown = {};
    const success = writeDb(currentDb);
    if (success) {
      res.json({ message: "Server-side statistics reset successfully!", db: currentDb });
    } else {
      res.status(500).json({ error: "Failed to reset stats on server" });
    }
  });

  // API: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "alive", port: PORT });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
