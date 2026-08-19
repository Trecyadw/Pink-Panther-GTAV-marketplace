CREATE DATABASE IF NOT EXISTS night_runner_order_system;
USE night_runner_order_system;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  ic_name VARCHAR(100) NOT NULL,
  role ENUM('member', 'staff', 'admin') NOT NULL DEFAULT 'member',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NULL,
  item_class VARCHAR(50) NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  max_order_qty INT NOT NULL DEFAULT 1,
  order_unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
  image_url VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE stock_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  action_type ENUM('restock', 'deduct', 'edit') NOT NULL,
  old_stock INT NOT NULL,
  stock_change INT NOT NULL DEFAULT 0,
  new_stock INT NOT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stock_logs_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_stock_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(30) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(30) NOT NULL DEFAULT 'ingame',
  payment_status ENUM('unpaid', 'paid_ingame') NOT NULL DEFAULT 'unpaid',
  order_status ENUM('pending', 'confirmed', 'paid_ingame', 'processed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(120) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  qty INT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE order_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  user_id INT NOT NULL,
  from_status VARCHAR(50) NULL,
  to_status VARCHAR(50) NOT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_logs_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO categories (name) VALUES
('Weapon'),
('Ammo'),
('Vest'),
('Utility');

INSERT INTO products (category_id, item_class, name, slug, description, price, stock, max_order_qty, order_unit, is_active) VALUES
(1, 'Class 1', '.50', '50-class-1', 'Include 30% Tax. Need 200 Metal Scrap per order.', 10000, 500, 30, 'pcs', 1),
(1, 'Class 1', 'Ceramic', 'ceramic-class-1', 'Include 30% Tax. Need 200 Metal Scrap per order.', 27000, 500, 30, 'pcs', 1),
(1, 'Class 1', 'X17', 'x17-class-1', 'Include 30% Tax. Need 200 Metal Scrap per order.', 34000, 500, 20, 'pcs', 1),
(1, 'Class 2', 'Tec9', 'tec9-class-2', 'Include 30% Tax. Need 200 Metal Scrap per order.', 27000, 400, 20, 'pcs', 1),
(1, 'Class 2', 'Mini SMG', 'mini-smg-class-2', 'Include 30% Tax. Need 200 Metal Scrap per order.', 30000, 400, 20, 'pcs', 1),
(1, 'Class 2', 'Micro SMG', 'micro-smg-class-2', 'Include 30% Tax. Need 200 Metal Scrap per order.', 30000, 400, 20, 'pcs', 1),
(1, 'Class 2', 'SMG', 'smg-class-2', 'Include 30% Tax. Need 200 Metal Scrap per order.', 40000, 400, 10, 'pcs', 1),
(1, 'Class 2', 'KVR', 'kvr-class-2', 'Include 30% Tax. Need 200 Metal Scrap per order.', 80000, 400, 10, 'pcs', 1),
(1, 'Class 3', 'Shotgun', 'shotgun-class-3', 'Include 30% Tax. Need 200 Metal Scrap per order.', 67000, 200, 5, 'pcs', 1),
(1, 'Class 3', 'Revolver', 'revolver-class-3', 'Include 30% Tax. Need 200 Metal Scrap per order.', 73000, 200, 5, 'pcs', 1),
(1, 'Class 3', 'Black Revo', 'black-revo-class-3', 'Include 30% Tax. Need 200 Metal Scrap per order.', 93000, 200, 5, 'pcs', 1),
(1, 'Class 3', 'Rifle AKM', 'rifle-akm-class-3', 'Include 30% Tax. Need 200 Metal Scrap per order.', 230000, 200, 20, 'pcs', 1),
(1, 'Class 3', 'Rifle Virtus', 'rifle-virtus-class-3', 'Include 30% Tax. Need 200 Metal Scrap per order.', 230000, 200, 20, 'pcs', 1),
(2, NULL, 'Ammo .50', 'ammo-50', '1 pax = 20 ammo. Include 30% Tax. Need 200 Metal Scrap per order.', 1000, 5000, 100, 'pax', 1),
(2, NULL, 'Ammo 9mm', 'ammo-9mm', '1 pax = 20 ammo. Include 30% Tax. Need 200 Metal Scrap per order.', 3000, 5000, 100, 'pax', 1),
(2, NULL, 'Ammo .45', 'ammo-45', '1 pax = 20 ammo. Include 30% Tax. Need 200 Metal Scrap per order.', 6000, 3000, 50, 'pax', 1),
(2, NULL, 'Ammo .44', 'ammo-44', '1 pax = 20 ammo. Include 30% Tax. Need 200 Metal Scrap per order.', 7000, 3000, 50, 'pax', 1),
(2, NULL, 'Ammo SG', 'ammo-sg', '1 pax = 30 ammo. Include 30% Tax. Need 200 Metal Scrap per order.', 6000, 3000, 50, 'pax', 1),
(2, NULL, 'Ammo .556', 'ammo-556', '1 pax = 20 ammo. Include 30% Tax. Need 200 Metal Scrap per order.', 7000, 2000, 20, 'pax', 1),
(2, NULL, 'Ammo .762', 'ammo-762', '1 pax = 20 ammo. Include 30% Tax. Need 200 Metal Scrap per order.', 7000, 2000, 20, 'pax', 1),
(3, NULL, 'Blue Vest', 'blue-vest', 'Include 30% Tax. Need 200 Metal Scrap per order.', 3000, 5000, 200, 'pcs', 1),
(3, NULL, 'Red Vest', 'red-vest', 'Include 30% Tax. Need 200 Metal Scrap per order.', 2000, 5000, 150, 'pcs', 1),
(4, NULL, 'Tablet', 'tablet', 'Include 30% Tax. Need 200 Metal Scrap per order.', 3000, 500, 30, 'pcs', 1),
(4, NULL, 'Lockpick', 'lockpick', 'Include 30% Tax. Need 200 Metal Scrap per order.', 4500, 500, 30, 'pcs', 1);
