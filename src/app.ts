import express, { Request, Response } from "express";
import userRoutes from "./routes/users.route";

class App {
  public app: express.Application;

  constructor() {
    this.app = express();

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.get("/", (req: Request, res: Response) => {
      res.send("api is running!");
    });

    this.app.use("/users", userRoutes);
  }
}

export default new App().app;
