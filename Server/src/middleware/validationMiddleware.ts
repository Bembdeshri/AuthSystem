import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Reusable middleware to validate the request body using a Zod schema.
 */
export function validateBody(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Extract validation issues and return a clean, user-friendly error message
        const issues = error.issues.map((err) => err.message);
        res.status(400).json({
          success: false,
          message: issues[0] || "Invalid input parameters.",
          errors: issues,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: "Internal validation failure.",
      });
    }
  };
}
