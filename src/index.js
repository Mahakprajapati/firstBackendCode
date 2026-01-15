// require("dotenv").config({ path: "./env" });

import dotevn from "dotenv";
import connectDB from "./db/connectdb.js";

dotevn.config({
  path: "./env",
});

connectDB();
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
