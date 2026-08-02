import { z } from "zod";

export const orderItemInputSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  instructions: z.string().max(160).optional()
});

export const createOrderSchema = z.object({
  restaurantSlug: z.string().min(2),
  tableNumber: z.number().int().positive(),
  customerName: z.string().max(80).optional(),
  customerPhone: z.string().max(20).optional(),
  instructions: z.string().max(240).optional(),
  items: z.array(orderItemInputSchema).min(1).max(40),
  idempotencyKey: z.string().optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "PREPARING", "READY", "SERVED", "COMPLETED", "CANCELLED"])
});

export const waiterRequestSchema = z.object({
  restaurantSlug: z.string().min(2),
  tableNumber: z.number().int().positive(),
  type: z.enum(["CALL_WAITER", "REQUEST_BILL"])
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
