const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

function now() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createSeedStore() {
  const timestamp = now();
  const seededPassword = bcrypt.hashSync('Password@123', 10);

  return {
    users: [
      {
        id: 1,
        name: 'Rahul Sharma',
        email: 'customer@example.com',
        password: seededPassword,
        role: 'customer',
        phone: '9876543210',
        address: 'MG Road',
        city: 'Pune',
        created_at: timestamp,
        updated_at: timestamp,
      },
      {
        id: 2,
        name: 'Elite Car Rentals',
        email: 'agency@example.com',
        password: seededPassword,
        role: 'agency',
        phone: '9123456780',
        address: 'Sector 18',
        city: 'Noida',
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
    cars: [
      {
        id: 1,
        agency_id: 2,
        brand: 'Toyota',
        model: 'Innova Crysta',
        year: 2024,
        license_plate: 'UP16AB1234',
        price_per_day: 4500,
        seating_capacity: 7,
        availability_status: 'available',
        features: 'AC, GPS, 7 Seater',
        image_url: null,
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
    bookings: [],
    nextIds: {
      users: 3,
      cars: 2,
      bookings: 1,
    },
  };
}

function normalizeSql(sql) {
  return sql.trim().replace(/\s+/g, ' ').toLowerCase();
}

function selectUserByEmail(store, email) {
  return store.users.find((user) => user.email === email) || null;
}

function selectUserById(store, id, includePassword = false) {
  const user = store.users.find((item) => item.id === Number(id));

  if (!user) {
    return null;
  }

  if (includePassword) {
    return clone(user);
  }

  const { password, ...safeUser } = user;
  return clone(safeUser);
}

function hydrateCar(store, car) {
  if (!car) {
    return null;
  }

  const agency = store.users.find((user) => user.id === car.agency_id);

  return {
    id: car.id,
    agency_id: car.agency_id,
    brand: car.brand,
    model: car.model,
    year: car.year,
    license_plate: car.license_plate,
    price_per_day: car.price_per_day,
    seating_capacity: car.seating_capacity,
    availability_status: car.availability_status,
    features: car.features,
    image_url: car.image_url,
    created_at: car.created_at,
    updated_at: car.updated_at,
    agency_name: agency ? agency.name : null,
    agency_email: agency ? agency.email : null,
  };
}

function hydrateBookingForCustomer(store, booking) {
  if (!booking) {
    return null;
  }

  const car = store.cars.find((item) => item.id === booking.car_id);
  const agency = car ? store.users.find((user) => user.id === car.agency_id) : null;

  return {
    id: booking.id,
    customer_id: booking.customer_id,
    car_id: booking.car_id,
    start_date: booking.start_date,
    end_date: booking.end_date,
    total_price: booking.total_price,
    status: booking.status,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    brand: car ? car.brand : null,
    model: car ? car.model : null,
    year: car ? car.year : null,
    license_plate: car ? car.license_plate : null,
    image_url: car ? car.image_url : null,
    price_per_day: car ? car.price_per_day : null,
    agency_name: agency ? agency.name : null,
  };
}

function hydrateBookingForAgency(store, booking) {
  if (!booking) {
    return null;
  }

  const car = store.cars.find((item) => item.id === booking.car_id);
  const customer = store.users.find((user) => user.id === booking.customer_id);

  return {
    id: booking.id,
    customer_id: booking.customer_id,
    car_id: booking.car_id,
    start_date: booking.start_date,
    end_date: booking.end_date,
    total_price: booking.total_price,
    status: booking.status,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    brand: car ? car.brand : null,
    model: car ? car.model : null,
    year: car ? car.year : null,
    license_plate: car ? car.license_plate : null,
    image_url: car ? car.image_url : null,
    price_per_day: car ? car.price_per_day : null,
    customer_name: customer ? customer.name : null,
    customer_email: customer ? customer.email : null,
  };
}

function sortByCreatedAtDesc(items) {
  return items.sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
}

function executeQuery(store, sql, values = []) {
  const normalized = normalizeSql(sql);

  if (normalized === 'select id, name, email, password, role, phone, address, city, created_at, updated_at from users where email = ? limit 1') {
    const user = selectUserByEmail(store, values[0]);
    return user ? [clone(user)] : [];
  }

  if (normalized === 'select id, name, email, role, phone, address, city, created_at, updated_at from users where id = ? limit 1') {
    const user = selectUserById(store, values[0], false);
    return user ? [user] : [];
  }

  if (normalized.startsWith('insert into users (name, email, password, role, phone, address, city)')) {
    const [name, email, password, role, phone, address, city] = values;
    const id = store.nextIds.users++;
    const timestamp = now();

    store.users.push({
      id,
      name,
      email,
      password,
      role,
      phone,
      address,
      city,
      created_at: timestamp,
      updated_at: timestamp,
    });

    return { insertId: id, affectedRows: 1 };
  }

  if (normalized.startsWith('select cars.id, cars.agency_id, cars.brand, cars.model, cars.year, cars.license_plate, cars.price_per_day, cars.seating_capacity, cars.availability_status, cars.features, cars.image_url, cars.created_at, cars.updated_at, users.name as agency_name, users.email as agency_email from cars inner join users on users.id = cars.agency_id where cars.availability_status =') ) {
    const rows = store.cars
      .filter((car) => car.availability_status === 'available')
      .map((car) => hydrateCar(store, car));

    return sortByCreatedAtDesc(rows);
  }

  if (normalized.startsWith('select cars.id, cars.agency_id, cars.brand, cars.model, cars.year, cars.license_plate, cars.price_per_day, cars.seating_capacity, cars.availability_status, cars.features, cars.image_url, cars.created_at, cars.updated_at, users.name as agency_name, users.email as agency_email from cars inner join users on users.id = cars.agency_id where cars.id = ? limit 1')) {
    const car = store.cars.find((item) => item.id === Number(values[0]));
    const row = hydrateCar(store, car);
    return row ? [row] : [];
  }

  if (normalized.startsWith('select id, agency_id, brand, model, year, license_plate, price_per_day, seating_capacity, availability_status, features, image_url, created_at, updated_at from cars where agency_id = ? order by created_at desc')) {
    const rows = store.cars
      .filter((car) => car.agency_id === Number(values[0]))
      .map((car) => clone(car));

    return sortByCreatedAtDesc(rows);
  }

  if (normalized.startsWith('insert into cars (agency_id, brand, model, year, license_plate, price_per_day, seating_capacity, features, image_url)')) {
    const [agencyId, brand, model, year, licensePlate, pricePerDay, seatingCapacity, features, imageUrl] = values;
    const id = store.nextIds.cars++;
    const timestamp = now();

    store.cars.push({
      id,
      agency_id: Number(agencyId),
      brand,
      model,
      year: Number(year),
      license_plate: licensePlate,
      price_per_day: Number(pricePerDay),
      seating_capacity: seatingCapacity ? Number(seatingCapacity) : 4,
      availability_status: 'available',
      features: features || null,
      image_url: imageUrl || null,
      created_at: timestamp,
      updated_at: timestamp,
    });

    return { insertId: id, affectedRows: 1 };
  }

  if (normalized.startsWith('update cars set ') && normalized.includes('where id = ?')) {
    const id = Number(values[values.length - 1]);
    const car = store.cars.find((item) => item.id === id);

    if (!car) {
      return { affectedRows: 0 };
    }

    const assignments = sql
      .split(/set/i)[1]
      .split(/where/i)[0]
      .split(',')
      .map((segment) => segment.trim())
      .filter(Boolean);

    const updateKeys = assignments.map((assignment) => assignment.split('=')[0].trim());
    const updateValues = values.slice(0, updateKeys.length);

    updateKeys.forEach((key, index) => {
      const value = updateValues[index];

      if (value === undefined) {
        return;
      }

      if (key === 'license_plate') {
        car.license_plate = value;
      } else if (key === 'price_per_day') {
        car.price_per_day = Number(value);
      } else if (key === 'seating_capacity') {
        car.seating_capacity = Number(value);
      } else if (key === 'year') {
        car.year = Number(value);
      } else if (key === 'availability_status') {
        car.availability_status = value;
      } else if (key === 'features') {
        car.features = value;
      } else if (key === 'image_url') {
        car.image_url = value;
      } else if (key === 'brand') {
        car.brand = value;
      } else if (key === 'model') {
        car.model = value;
      }
    });

    car.updated_at = now();
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('update cars set availability_status = ? where id = ?')) {
    const [availabilityStatus, id] = values;
    const car = store.cars.find((item) => item.id === Number(id));

    if (!car) {
      return { affectedRows: 0 };
    }

    car.availability_status = availabilityStatus;
    car.updated_at = now();
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('insert into bookings (customer_id, car_id, start_date, end_date, total_price, status)')) {
    const [customerId, carId, startDate, endDate, totalPrice] = values;
    const id = store.nextIds.bookings++;
    const timestamp = now();

    store.bookings.push({
      id,
      customer_id: Number(customerId),
      car_id: Number(carId),
      start_date: startDate,
      end_date: endDate,
      total_price: Number(totalPrice),
      status: 'confirmed',
      created_at: timestamp,
      updated_at: timestamp,
    });

    return { insertId: id, affectedRows: 1 };
  }

  if (normalized.startsWith('select bookings.id, bookings.customer_id, bookings.car_id, bookings.start_date, bookings.end_date, bookings.total_price, bookings.status, bookings.created_at, bookings.updated_at, cars.brand, cars.model, cars.license_plate, cars.price_per_day, users.name as customer_name, users.email as customer_email from bookings inner join cars on cars.id = bookings.car_id inner join users on users.id = bookings.customer_id where bookings.id = ? limit 1')) {
    const booking = store.bookings.find((item) => item.id === Number(values[0]));
    const row = hydrateBookingForAgency(store, booking);
    return row ? [row] : [];
  }

  if (normalized.startsWith('select bookings.id, bookings.customer_id, bookings.car_id, bookings.start_date, bookings.end_date, bookings.total_price, bookings.status, bookings.created_at, bookings.updated_at, cars.brand, cars.model, cars.year, cars.license_plate, cars.image_url, cars.price_per_day, users.name as agency_name from bookings inner join cars on cars.id = bookings.car_id inner join users on users.id = cars.agency_id where bookings.customer_id = ? order by bookings.created_at desc')) {
    const rows = store.bookings
      .filter((booking) => booking.customer_id === Number(values[0]))
      .map((booking) => hydrateBookingForCustomer(store, booking));

    return sortByCreatedAtDesc(rows);
  }

  if (normalized.startsWith('select bookings.id, bookings.customer_id, bookings.car_id, bookings.start_date, bookings.end_date, bookings.total_price, bookings.status, bookings.created_at, bookings.updated_at, cars.brand, cars.model, cars.year, cars.license_plate, cars.image_url, cars.price_per_day, users.name as customer_name, users.email as customer_email from bookings inner join cars on cars.id = bookings.car_id inner join users on users.id = bookings.customer_id where cars.agency_id = ? order by bookings.created_at desc')) {
    const agencyId = Number(values[0]);
    const rows = store.bookings
      .filter((booking) => {
        const car = store.cars.find((item) => item.id === booking.car_id);
        return car && car.agency_id === agencyId;
      })
      .map((booking) => hydrateBookingForAgency(store, booking));

    return sortByCreatedAtDesc(rows);
  }

  if (normalized.startsWith('select id from bookings where car_id = ? and status in (\'confirmed\', \'pending\') and start_date <= ? and end_date >= ? limit 1')) {
    const [carId, endDate, startDate] = values;
    const booking = store.bookings.find((item) => {
      return (
        item.car_id === Number(carId) &&
        ['confirmed', 'pending'].includes(item.status) &&
        item.start_date <= endDate &&
        item.end_date >= startDate
      );
    });

    return booking ? [{ id: booking.id }] : [];
  }

  throw new Error(`Unsupported SQL in fallback database: ${sql}`);
}

function createMemoryConnection(store) {
  return {
    async beginTransaction() {},
    async commit() {},
    async rollback() {},
    release() {},
    async query(sql, values = []) {
      const result = executeQuery(store, sql, values);
      return [result, []];
    },
  };
}

function createMemoryPool(initialStore) {
  let store = initialStore;

  return {
    async query(sql, values = []) {
      const result = executeQuery(store, sql, values);
      return [result, []];
    },
    async getConnection() {
      const workingStore = clone(store);

      return {
        async beginTransaction() {},
        async query(sql, values = []) {
          const result = executeQuery(workingStore, sql, values);
          return [result, []];
        },
        async commit() {
          store = workingStore;
        },
        async rollback() {},
        release() {},
      };
    },
  };
}

let activePool = null;

const pool = {
  async query(sql, values = []) {
    if (!activePool) {
      throw new Error('Database has not been initialized yet.');
    }

    return activePool.query(sql, values);
  },
  async getConnection() {
    if (!activePool) {
      throw new Error('Database has not been initialized yet.');
    }

    return activePool.getConnection();
  },
};

async function initializeDatabase() {
  const mysqlUrl = process.env.MYSQL_URL;

  if (!mysqlUrl) {
    console.error('MYSQL_URL is missing. The application requires a MySQL database. Aborting initialization.');
    process.exit(1);
  }

  try {
    const connectionUrl = new URL(mysqlUrl);
    const mysqlPool = mysql.createPool({
      host: connectionUrl.hostname,
      port: Number(connectionUrl.port) || 3306,
      user: decodeURIComponent(connectionUrl.username),
      password: decodeURIComponent(connectionUrl.password),
      database: connectionUrl.pathname.replace(/^\//, ''),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    const connection = await mysqlPool.getConnection();

    try {
      await connection.ping();
      activePool = mysqlPool;
      console.log('Connected to MySQL successfully');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(`MySQL is unavailable (${error.message}). Aborting initialization.`);
    process.exit(1);
  }
}

async function query(sql, values = []) {
  const [rows] = await pool.query(sql, values);
  return rows;
}

module.exports = {
  pool,
  query,
  initializeDatabase,
};
