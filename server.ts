import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Data
  let MOCK_ARTICLES = [
    {
      id: 1,
      title: '探索数字艺术的无限可能',
      summary: '深入了解 WebGL 与数字创作的魅力。',
      content: '在 DeepSleep Blog，我们不仅记录生活，更在探索未来的轮廓...',
      authorId: 101,
      authorName: '林深见鹿',
      categoryId: 1,
      categoryName: '技术',
      tags: [{ id: 1, name: '数字艺术' }, { id: 2, name: '创意编程' }],
      status: 1,
      viewCount: 1240,
      likeCount: 88,
      commentCount: 12,
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-01T10:00:00Z',
      publishedAt: '2024-03-01T10:00:00Z',
      coverKey: null
    },
    {
      id: 2,
      title: '极简主义在现代网页设计中的应用',
      summary: 'Less is More: 探讨简约美学的设计哲学。',
      content: '在这个信息过载的时代，清爽的 Blog 体验变得尤为珍贵...',
      authorId: 102,
      authorName: '设计的温度',
      categoryId: 2,
      categoryName: '设计',
      tags: [{ id: 3, name: '极简' }, { id: 4, name: 'UI/UX' }],
      status: 1,
      viewCount: 890,
      likeCount: 56,
      commentCount: 8,
      createdAt: '2024-02-28T14:30:00Z',
      updatedAt: '2024-02-28T14:30:00Z',
      publishedAt: '2024-02-28T14:30:00Z',
      coverKey: null
    }
  ];

  const MOCK_USER = {
    id: 101,
    username: "test_user01",
    displayName: "测试用户",
    role: "user",
    status: 1,
    createdAt: "2024-01-01T00:00:00Z",
    bio: "这是一个测试账号的原力简介。",
    avatarUrl: null,
    bannerUrl: null
  };

  const MOCK_ADMIN = {
    id: 1,
    username: "admin",
    displayName: "DeepSleep 官方",
    role: "admin",
    status: 1,
    createdAt: "2024-01-01T00:00:00Z",
    bio: "探索技术与生活的边界。",
    avatarUrl: null,
    bannerUrl: null
  };

  // API Routes
  // Auth
  app.post("/api/auth/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ code: 400, msg: "字段校验失败", timestamp: Date.now() });
    }
    res.json({
      code: 0,
      msg: "成功",
      data: {
        accessToken: "mock-access-token-" + Date.now(),
        refreshToken: "mock-refresh-token-" + Date.now()
      },
      timestamp: Date.now()
    });
  });

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "test_user01" && password === "abc123456") {
      res.json({
        code: 0,
        msg: "成功",
        data: {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
          user: MOCK_USER
        },
        timestamp: Date.now()
      });
    } else if (username === "admin" && password === "admin123") {
      res.json({
        code: 0,
        msg: "成功",
        data: {
          accessToken: "mock-admin-token",
          refreshToken: "mock-refresh-token",
          user: MOCK_ADMIN
        },
        timestamp: Date.now()
      });
    } else {
      res.status(401).json({ code: 11100, msg: "用户名或密码错误", timestamp: Date.now() });
    }
  });

  app.post("/api/auth/refresh", (req, res) => {
    res.json({
      code: 0,
      msg: "成功",
      data: {
        accessToken: "mock-new-access-token-" + Date.now(),
        refreshToken: "mock-new-refresh-token-" + Date.now()
      },
      timestamp: Date.now()
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ code: 0, msg: "成功", data: null, timestamp: Date.now() });
  });

  app.post("/api/auth/logout-all", (req, res) => {
    res.json({ code: 0, msg: "成功", data: null, timestamp: Date.now() });
  });

  // Articles
  app.get("/api/articles", (req, res) => {
    res.json({
      code: 0,
      msg: "成功",
      data: {
        items: MOCK_ARTICLES,
        nextCursor: null,
        hasMore: false
      },
      timestamp: Date.now()
    });
  });

  app.post("/api/articles", (req, res) => {
    const newArticle = {
      id: Math.floor(Math.random() * 10000),
      title: req.body.title || "未命名文章",
      summary: req.body.summary || "",
      content: req.body.content || "",
      authorId: 101,
      authorName: "测试用户",
      categoryId: req.body.categoryId || 1,
      categoryName: "技术",
      tags: [],
      status: 1,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString().replace('Z', ''),
      updatedAt: new Date().toISOString().replace('Z', ''),
      publishedAt: new Date().toISOString().replace('Z', ''),
      coverKey: req.body.coverKey || null
    };
    MOCK_ARTICLES.unshift(newArticle);
    res.json({ code: 0, msg: "成功", data: newArticle, timestamp: Date.now() });
  });

  app.post("/api/articles/drafts", (req, res) => {
    const newDraft = {
      id: Math.floor(Math.random() * 10000),
      title: req.body.title || "未命名草稿",
      summary: req.body.summary || "",
      content: req.body.content || "",
      authorId: 101,
      authorName: "测试用户",
      categoryId: req.body.categoryId || 1,
      categoryName: "技术",
      tags: [],
      status: 0,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString().replace('Z', ''),
      updatedAt: new Date().toISOString().replace('Z', ''),
      publishedAt: null,
      coverKey: req.body.coverKey || null
    };
    MOCK_ARTICLES.unshift(newDraft);
    res.json({ code: 0, msg: "成功", data: newDraft, timestamp: Date.now() });
  });

  app.get("/api/articles/mine", (req, res) => {
    const mine = MOCK_ARTICLES.filter(a => a.authorId === 101);
    res.json({
      code: 0,
      msg: "成功",
      data: {
        items: mine,
        nextCursor: null,
        hasMore: false
      },
      timestamp: Date.now()
    });
  });

  app.get("/api/articles/:id", (req, res) => {
    const article = MOCK_ARTICLES.find(a => a.id === Number(req.params.id));
    if (article) {
      res.json({ code: 0, msg: "成功", data: article, timestamp: Date.now() });
    } else {
      res.status(404).json({ code: 13000, msg: "文章不存在", timestamp: Date.now() });
    }
  });

  app.put("/api/articles/:id", (req, res) => {
    const index = MOCK_ARTICLES.findIndex(a => a.id === Number(req.params.id));
    if (index !== -1) {
      MOCK_ARTICLES[index] = {
        ...MOCK_ARTICLES[index],
        ...req.body,
        updatedAt: new Date().toISOString().replace('Z', '')
      };
      res.json({
        code: 0,
        msg: "成功",
        data: MOCK_ARTICLES[index],
        timestamp: Date.now()
      });
    } else {
      res.status(404).json({ code: 13000, msg: "文章不存在", timestamp: Date.now() });
    }
  });

  app.delete("/api/articles/:id", (req, res) => {
    const id = Number(req.params.id);
    MOCK_ARTICLES = MOCK_ARTICLES.filter(a => a.id !== id);
    res.json({ code: 0, msg: "成功", data: null, timestamp: Date.now() });
  });

  app.post("/api/articles/:id/publish", (req, res) => {
    const index = MOCK_ARTICLES.findIndex(a => a.id === Number(req.params.id));
    if (index !== -1) {
      MOCK_ARTICLES[index].status = 1;
      MOCK_ARTICLES[index].publishedAt = new Date().toISOString().replace('Z', '');
      res.json({ code: 0, msg: "成功", data: null, timestamp: Date.now() });
    } else {
      res.status(404).json({ code: 13000, msg: "文章不存在", timestamp: Date.now() });
    }
  });

  app.post("/api/articles/:id/unpublish", (req, res) => {
    const index = MOCK_ARTICLES.findIndex(a => a.id === Number(req.params.id));
    if (index !== -1) {
      MOCK_ARTICLES[index].status = 0;
      res.json({ code: 0, msg: "成功", data: null, timestamp: Date.now() });
    } else {
      res.status(404).json({ code: 13000, msg: "文章不存在", timestamp: Date.now() });
    }
  });

  // Users
  app.get("/api/users/me", (req, res) => {
    const token = req.headers.token;
    const data = token === "mock-admin-token" ? MOCK_ADMIN : MOCK_USER;
    res.json({ code: 0, msg: "成功", data, timestamp: Date.now() });
  });

  app.get("/api/users/:id", (req, res) => {
    const data = req.params.id === "1" ? MOCK_ADMIN : MOCK_USER;
    res.json({ code: 0, msg: "成功", data, timestamp: Date.now() });
  });

  app.put("/api/users/:id", (req, res) => {
    res.json({ code: 0, msg: "成功", data: null, timestamp: Date.now() });
  });

  // Settings
  app.put("/api/settings", (req, res) => {
    res.json({ code: 0, msg: "成功", data: null, timestamp: Date.now() });
  });

  // Comments
  app.delete("/api/comments/:id", (req, res) => {
    res.json({ code: 0, msg: "成功", data: null, timestamp: Date.now() });
  });

  // Ping
  app.get("/api/ping/public", (req, res) => res.json({ code: 0, msg: "public ping successfully", timestamp: Date.now() }));
  app.get("/api/ping/auth", (req, res) => res.json({ code: 0, msg: "auth ping successfully", timestamp: Date.now() }));
  app.get("/api/ping/admin", (req, res) => res.json({ code: 0, msg: "admin ping successfully", timestamp: Date.now() }));

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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
