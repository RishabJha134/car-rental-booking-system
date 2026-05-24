const { query } = require('../config/database');

async function findAvailableCars() {
  return query(
    `SELECT cars.id, cars.agency_id, cars.brand, cars.model, cars.year, cars.license_plate,
            cars.price_per_day, cars.seating_capacity, cars.availability_status, cars.features, cars.image_url,
            cars.created_at, cars.updated_at,
            users.name AS agency_name, users.email AS agency_email
     FROM cars
     INNER JOIN users ON users.id = cars.agency_id
     WHERE cars.availability_status = 'available'
     ORDER BY cars.created_at DESC`
  );
}

async function findById(id) {
  const rows = await query(
    `SELECT cars.id, cars.agency_id, cars.brand, cars.model, cars.year, cars.license_plate,
            cars.price_per_day, cars.seating_capacity, cars.availability_status, cars.features, cars.image_url,
            cars.created_at, cars.updated_at,
            users.name AS agency_name, users.email AS agency_email
     FROM cars
     INNER JOIN users ON users.id = cars.agency_id
     WHERE cars.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function findByAgencyId(agencyId) {
  return query(
    `SELECT id, agency_id, brand, model, year, license_plate, price_per_day,
            seating_capacity, availability_status, features, image_url, created_at, updated_at
     FROM cars
     WHERE agency_id = ?
     ORDER BY created_at DESC`,
    [agencyId]
  );
}

async function create(carData) {
  const {
    agencyId,
    brand,
    model,
    year,
    licensePlate,
    pricePerDay,
    seatingCapacity,
    features = null,
    imageUrl = null,
  } = carData;

  const result = await query(
    `INSERT INTO cars (agency_id, brand, model, year, license_plate, price_per_day, seating_capacity, features, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [agencyId, brand, model, year, licensePlate, pricePerDay, seatingCapacity || 4, features, imageUrl]
  );

  return findById(result.insertId);
}

async function updateById(id, updates) {
  const allowedFields = {
    brand: updates.brand,
    model: updates.model,
    year: updates.year,
    license_plate: updates.licensePlate,
    price_per_day: updates.pricePerDay,
    seating_capacity: updates.seatingCapacity,
    availability_status: updates.availabilityStatus,
    features: updates.features,
    image_url: updates.imageUrl,
  };

  const fields = [];
  const values = [];

  Object.entries(allowedFields).forEach(([field, value]) => {
    if (value !== undefined) {
      fields.push(`${field} = ?`);
      values.push(value);
    }
  });

  if (!fields.length) {
    return findById(id);
  }

  values.push(id);

  await query(`UPDATE cars SET ${fields.join(', ')} WHERE id = ?`, values);

  return findById(id);
}

async function updateAvailabilityStatus(id, availabilityStatus) {
  await query('UPDATE cars SET availability_status = ? WHERE id = ?', [availabilityStatus, id]);
  return findById(id);
}

module.exports = {
  findAvailableCars,
  findById,
  findByAgencyId,
  create,
  updateById,
  updateAvailabilityStatus,
};