const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/polls", require("./routes/poll.routes"));

app.get("/", (req, res) => {
  res.send("Poll App API is running...");
});

module.exports = app;
