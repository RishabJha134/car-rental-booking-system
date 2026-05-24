const { query } = require('../config/database');

async function createBooking(bookingData, connection) {
  const { customerId, carId, startDate, endDate, totalPrice } = bookingData;

  const [result] = await connection.query(
    `INSERT INTO bookings (customer_id, car_id, start_date, end_date, total_price, status)
     VALUES (?, ?, ?, ?, ?, 'confirmed')`,
    [customerId, carId, startDate, endDate, totalPrice]
  );

  const rows = await connection.query(
    `SELECT bookings.id, bookings.customer_id, bookings.car_id, bookings.start_date,
            bookings.end_date, bookings.total_price, bookings.status, bookings.created_at,
            bookings.updated_at,
            cars.brand, cars.model, cars.license_plate, cars.price_per_day,
            users.name AS customer_name, users.email AS customer_email
     FROM bookings
     INNER JOIN cars ON cars.id = bookings.car_id
     INNER JOIN users ON users.id = bookings.customer_id
     WHERE bookings.id = ?
     LIMIT 1`,
    [result.insertId]
  );

  return rows[0][0] || null;
}

async function findByCustomerId(customerId) {
  return query(
    `SELECT bookings.id, bookings.customer_id, bookings.car_id, bookings.start_date,
            bookings.end_date, bookings.total_price, bookings.status, bookings.created_at,
            bookings.updated_at,
            cars.brand, cars.model, cars.year, cars.license_plate, cars.image_url,
            cars.price_per_day, users.name AS agency_name
     FROM bookings
     INNER JOIN cars ON cars.id = bookings.car_id
     INNER JOIN users ON users.id = cars.agency_id
     WHERE bookings.customer_id = ?
     ORDER BY bookings.created_at DESC`,
    [customerId]
  );
}

async function findByAgencyId(agencyId) {
  return query(
    `SELECT bookings.id, bookings.customer_id, bookings.car_id, bookings.start_date,
            bookings.end_date, bookings.total_price, bookings.status, bookings.created_at,
            bookings.updated_at,
            cars.brand, cars.model, cars.year, cars.license_plate, cars.image_url,
            cars.price_per_day,
            users.name AS customer_name, users.email AS customer_email
     FROM bookings
     INNER JOIN cars ON cars.id = bookings.car_id
     INNER JOIN users ON users.id = bookings.customer_id
     WHERE cars.agency_id = ?
     ORDER BY bookings.created_at DESC`,
    [agencyId]
  );
}

async function hasOverlappingBooking(carId, startDate, endDate, connection) {
  const [rows] = await connection.query(
    `SELECT id
     FROM bookings
     WHERE car_id = ?
       AND status IN ('confirmed', 'pending')
       AND start_date <= ?
       AND end_date >= ?
     LIMIT 1`,
    [carId, endDate, startDate]
  );

  return rows.length > 0;
}

module.exports = {
  createBooking,
  findByCustomerId,
  findByAgencyId,
  hasOverlappingBooking,
};