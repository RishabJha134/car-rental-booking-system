CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'agency') NOT NULL,
  phone VARCHAR(20) NULL,
  address TEXT NULL,
  city VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agency_id INT NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  license_plate VARCHAR(50) NOT NULL UNIQUE,
  price_per_day DECIMAL(10, 2) NOT NULL,
  seating_capacity INT NOT NULL DEFAULT 4,
  availability_status ENUM('available', 'booked') NOT NULL DEFAULT 'available',
  features TEXT NULL,
  image_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cars_agency FOREIGN KEY (agency_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_cars_agency_id (agency_id),
  INDEX idx_cars_status (availability_status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  car_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  INDEX idx_bookings_customer_id (customer_id),
  INDEX idx_bookings_car_id (car_id),
  INDEX idx_bookings_status (status)
) ENGINE=InnoDB;