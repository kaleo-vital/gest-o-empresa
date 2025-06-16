import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  status: text("status").notNull().default("active"), // active, inactive
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  status: text("status").notNull().default("active"), // active, inactive, low_stock, out_of_stock
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  customerName: text("customer_name").notNull(), // denormalized for easier queries
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  date: text("date").notNull(), // storing as string for simplicity
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(), // denormalized
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Extended schemas for forms
export const customerFormSchema = insertCustomerSchema.extend({
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
});

export const productFormSchema = insertProductSchema.extend({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  price: z.string().min(1, "Price is required"),
  stock: z.number().min(0, "Stock cannot be negative"),
});

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type CustomerFormData = z.infer<typeof customerFormSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductFormData = z.infer<typeof productFormSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Dashboard stats type
export type DashboardStats = {
  totalCustomers: number;
  totalProducts: number;
  monthlyRevenue: number;
  pendingOrders: number;
  salesGrowth: number;
  productsGrowth: number;
  revenueGrowth: number;
};

// Recent activity type
export type RecentActivity = {
  id: string;
  type: 'customer' | 'order' | 'product';
  message: string;
  time: string;
  icon: string;
  color: string;
};
