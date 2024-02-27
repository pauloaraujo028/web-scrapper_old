const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const port = 3000;

app.get("/products", async (req, res) => {
  const { nutrition, nova } = req.query;
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://br.openfoodfacts.org/");

  const products = await page.evaluate(
    (nutrition, nova) => {
      const productList = [];
      const productElements = document.querySelectorAll(".search_results li");

      productElements.forEach((productElement) => {
        const productLink = productElement
          .querySelector(".list_product_a")
          .getAttribute("href");
        const idMatch = productLink.match(/\/produto\/([^\/]+)\//);
        if (!idMatch) return; // Verifica se houve correspondência na expressão regular
        const id = idMatch[1];

        const product = {
          id: id,
          name: productElement.querySelector(".list_product_name").innerHTML,
          nutrition: {
            score: productElement
              .querySelector('.list_product_icons[title^="Nutri-Score"]')
              .getAttribute("title")
              .split(" ")[1],
            title: productElement
              .querySelector('.list_product_icons[title^="Nutri-Score"]')
              .getAttribute("title")
              .split(" - ")[1],
          },
          nova: {
            score: parseInt(
              productElement
                .querySelector('.list_product_icons[title^="NOVA"]')
                .getAttribute("title")
                .split(" ")[1]
            ),
            title: productElement
              .querySelector('.list_product_icons[title^="NOVA"]')
              .getAttribute("title")
              .split(" - ")[1],
          },
        };

        if (nutrition && nutrition.toUpperCase() !== product.nutrition.score)
          return;
        if (nova && parseInt(nova) !== product.nova.score) return;

        productList.push(product);
      });

      return productList;
    },
    nutrition,
    nova
  );

  await browser.close();
  res.json(products);
});

app.listen(port, () => {
  console.log(`O servidor está rodando em http://localhost:${port}/products`);
});
