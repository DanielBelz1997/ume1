import app from "./app";
import { connectionDB } from "./config/db";

const port = Number(process.env.PORT) || 8874;

const startServer = async () => {
  try {
    await connectionDB();

    app.listen(port, () => {
      console.log("server has started on port:", port);
    });
  } catch (e) {
    console.error("enable to start the server:", e);
    process.exit(1);
  }
};

startServer();
