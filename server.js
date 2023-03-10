require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const compression = require("compression");
const app = express();

const userRoutes = require("./Routes/users");
const banterRoutes = require("./Routes/banter");
const sseRoute = require("./Routes/sse");
const fileUpload = require("express-fileupload");

app.use(cors());
app.use(express.json());
app.use(compression());

const port = process.env.PORT || 5000;

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once("open", () => console.log("MongoDb connection established successfully"));

//Uploading file Configurations
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));

app.use(sseRoute);
app.use("/users", userRoutes);
app.use("/banters", banterRoutes);

app.listen(port, () => console.log(`Server is running on port: ${port}`));
