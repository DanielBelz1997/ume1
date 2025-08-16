import { Router } from "express";
import UsersController from "../controllers/users.controller";

const router = Router();

router.get("/", UsersController.getAllUsers);
router.get("/:id", UsersController.getUserById);
router.post("/", UsersController.createUser);
router.put("/:id", UsersController.updateUser);
router.delete("/:id", UsersController.deleteUser);

export default router;
