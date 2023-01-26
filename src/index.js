const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const axios = require("axios");
const { PORT } = require("./config/server-config");

const app = express();

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  // standardHeaders: true,
  // LegacyHeaders: false,
});

app.use(morgan("combined"));
app.use(limiter);

app.use("/bookingservice", async (req, res, next) => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/v1/isauthenticated",
      { headers: { "x-access-token": req.headers["x-access-token"] } }
    );
    if (response.data.success) next();
    else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
});
app.use(
  "/bookingservice", //we have mapped this path to the following site. but this path should be exist in following service as well.
  createProxyMiddleware({ target: "http://localhost:3002" })
);

app.get('/home', (req, res) => {
  return res.json({message: 'OK'});
})

const setupAndStartServer = () => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
};

setupAndStartServer();
