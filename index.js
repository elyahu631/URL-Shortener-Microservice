require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const dns = require("dns");
const validUrl = require("is-url");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

// URL storage
let urlDatabase = {};
let shortId = 1;

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  if (!validUrl(originalUrl)) {
    res.send({ error: "invalid url" });
    return;
  }
  // Basic URL validation
  let urlObject;
  try {
    urlObject = new URL(originalUrl);
  } catch (error) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(urlObject.hostname, (err) => {
    if (err) {
      res.json({ error: "invalid url" });
    } else {
      const shortUrl = shortId;
      urlDatabase[shortUrl] = originalUrl;
      console.log({ original_url: originalUrl, short_url: shortUrl });
      res.json({ original_url: originalUrl, short_url: shortUrl });
      shortId++;
    }
  });
});

app.get("/api/shorturl/:id", function (req, res) {
  const shortUrl = req.params.id;
  const originalUrl = urlDatabase[shortUrl];
  console.log(originalUrl);
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
