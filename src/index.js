// require("dotenv").config({ path: "./env" });

import dotevn from "dotenv";
import connectDB from "./db/connectdb.js";
import { app } from "./app.js";

dotevn.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    try {
      app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️  Server is listening at PORT : ${process.env.PORT}`);
      });
    } catch (error) {
      app.on("error", () => {
        console.log(`EXPRESS is not able to talk MONGODB : ${error}`);
        throw error;
      });
    }
  })
  .catch((error) => {
    console.log(`MONGODB connection FAILED : ${error}`);
  });

/*
(async () => {
  try {
    let connectionInterface = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    app.on("error", () => {
      console.log("express is not able to talk to mongoDB", error);
      throw error;
    });
    console.log("ConnectionInterface : ", connectionInterface);
    app.listen(process.env.PORT, () => {
      console.log("App is listening on PORT : ", process.env.PORT);
    });
  } catch (error) {
    console.log("errror :", error);
    throw error;
  }
})();
*/
