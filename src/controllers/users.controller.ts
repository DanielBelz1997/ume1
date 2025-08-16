import { Request, Response } from "express";
import UserService from "../services/users.service";

class UsersController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAll();
      res.json(users);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await UserService.getById(req.params.id);
      if (!user)
        return res.status(404).json({ message: "no user to be found" });

      res.json(user);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const user = await UserService.create(req.body);
      res.status(201).json(user);
    } catch (e) {
      console.error("error in creating user:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const user = await UserService.update(req.params.id, req.body);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (e) {
      console.error("Unable to update user: ", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const user = await UserService.delete(req.params.id);
      if (!user) return res.status(404).json({ message: "no user found" });
      res.json(user);
    } catch (e) {
      console.error("unable to delete user: ", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default UsersController;
