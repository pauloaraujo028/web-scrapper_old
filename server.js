const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const port = 3000;

app.get("/products", async (req, res) => {});

app.listen(port, () => {
  console.log(`O servidor está rodando em http://localhost:${port}`);
});
