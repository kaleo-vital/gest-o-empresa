import { customers, products, orders, orderItems, type Customer, type Product, type Order, type OrderItem, type InsertCustomer, type InsertProduct, type InsertOrder, type InsertOrderItem, type DashboardStats, type RecentActivity } from "@shared/schema";

export interface IStorage {
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;

  // Order items operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Dashboard operations
  getDashboardStats(): Promise<DashboardStats>;
  getRecentActivity(): Promise<RecentActivity[]>;
  getSalesData(): Promise<{ month: string; sales: number }[]>;
  getCategoryData(): Promise<{ category: string; count: number }[]>;
  getFinancialData(): Promise<{ month: string; revenue: number; expenses: number }[]>;
}

export class MemStorage implements IStorage {
  private customers: Map<number, Customer>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private currentCustomerId: number;
  private currentProductId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;

  constructor() {
    this.customers = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.currentCustomerId = 1;
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;

    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Sample customers
    const sampleCustomers: Customer[] = [
      {
        id: 1,
        name: "João Silva",
        email: "joao@email.com",
        phone: "(11) 99999-9999",
        city: "São Paulo",
        status: "active"
      },
      {
        id: 2,
        name: "Maria Santos",
        email: "maria@email.com",
        phone: "(11) 88888-8888",
        city: "Rio de Janeiro",
        status: "active"
      },
      {
        id: 3,
        name: "Pedro Costa",
        email: "pedro@email.com",
        phone: "(11) 77777-7777",
        city: "Belo Horizonte",
        status: "active"
      }
    ];

    // Sample products
    const sampleProducts: Product[] = [
      {
        id: 1,
        name: "Notebook Dell Inspiron",
        sku: "NB-DELL-001",
        category: "Eletrônicos",
        price: "2499.90",
        stock: 45,
        status: "active"
      },
      {
        id: 2,
        name: "Mouse Wireless",
        sku: "MS-WLS-002",
        category: "Acessórios",
        price: "89.90",
        stock: 5,
        status: "low_stock"
      },
      {
        id: 3,
        name: "Teclado Mecânico",
        sku: "KB-MEC-003",
        category: "Acessórios",
        price: "299.90",
        stock: 20,
        status: "active"
      },
      {
        id: 4,
        name: "Monitor 24 polegadas",
        sku: "MN-24-004",
        category: "Eletrônicos",
        price: "899.90",
        stock: 0,
        status: "out_of_stock"
      }
    ];

    // Sample orders
    const sampleOrders: Order[] = [
      {
        id: 1,
        customerId: 1,
        customerName: "João Silva",
        total: "567.89",
        status: "completed",
        date: "2023-12-15"
      },
      {
        id: 2,
        customerId: 2,
        customerName: "Maria Santos",
        total: "1234.50",
        status: "pending",
        date: "2023-12-15"
      }
    ];

    sampleCustomers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });

    sampleOrders.forEach(order => {
      this.orders.set(order.id, order);
    });

    this.currentCustomerId = 4;
    this.currentProductId = 5;
    this.currentOrderId = 3;
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = { ...insertCustomer, id };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;

    const updatedCustomer = { ...customer, ...customerData };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    
    // Determine status based on stock
    let status = insertProduct.status || "active";
    if (insertProduct.stock === 0) {
      status = "out_of_stock";
    } else if (insertProduct.stock <= 10) {
      status = "low_stock";
    }

    const product: Product = { ...insertProduct, id, status };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, ...productData };
    
    // Update status based on stock
    if (updatedProduct.stock === 0) {
      updatedProduct.status = "out_of_stock";
    } else if (updatedProduct.stock <= 10) {
      updatedProduct.status = "low_stock";
    } else {
      updatedProduct.status = "active";
    }

    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { ...insertOrder, id };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<boolean> {
    return this.orders.delete(id);
  }

  // Order items methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const customers = Array.from(this.customers.values());
    const products = Array.from(this.products.values());
    const orders = Array.from(this.orders.values());

    const totalCustomers = customers.length;
    const totalProducts = products.length;
    const pendingOrders = orders.filter(order => order.status === "pending").length;
    
    const monthlyRevenue = orders
      .filter(order => order.status === "completed")
      .reduce((sum, order) => sum + parseFloat(order.total), 0);

    return {
      totalCustomers,
      totalProducts,
      monthlyRevenue,
      pendingOrders,
      salesGrowth: 12, // Mock growth percentages
      productsGrowth: -2,
      revenueGrowth: 8,
    };
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    return [
      {
        id: "1",
        type: "customer",
        message: "Novo cliente cadastrado: Maria Santos",
        time: "há 2 minutos",
        icon: "user-plus",
        color: "green"
      },
      {
        id: "2",
        type: "order",
        message: "Venda realizada: Pedido #1234 - R$ 567,89",
        time: "há 15 minutos",
        icon: "shopping-cart",
        color: "blue"
      },
      {
        id: "3",
        type: "product",
        message: "Estoque baixo: Mouse Wireless - 5 unidades",
        time: "há 1 hora",
        icon: "alert-triangle",
        color: "orange"
      }
    ];
  }

  async getSalesData(): Promise<{ month: string; sales: number }[]> {
    return [
      { month: "Jan", sales: 12000 },
      { month: "Fev", sales: 19000 },
      { month: "Mar", sales: 15000 },
      { month: "Abr", sales: 25000 },
      { month: "Mai", sales: 22000 },
      { month: "Jun", sales: 30000 }
    ];
  }

  async getCategoryData(): Promise<{ category: string; count: number }[]> {
    const products = Array.from(this.products.values());
    const categoryCount: { [key: string]: number } = {};

    products.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count
    }));
  }

  async getFinancialData(): Promise<{ month: string; revenue: number; expenses: number }[]> {
    return [
      { month: "Jan", revenue: 45000, expenses: 32000 },
      { month: "Fev", revenue: 52000, expenses: 38000 },
      { month: "Mar", revenue: 48000, expenses: 35000 },
      { month: "Abr", revenue: 61000, expenses: 42000 },
      { month: "Mai", revenue: 55000, expenses: 39000 },
      { month: "Jun", revenue: 67000, expenses: 45000 }
    ];
  }
}

export const storage = new MemStorage();
