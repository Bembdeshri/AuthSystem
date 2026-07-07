import { Request, Response } from "express";
import { registerUserService } from "../services/authService";

export async function registerUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = await registerUserService(req.body);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    res.status(400).json({
      success: false,
      message,
    });
  }
}