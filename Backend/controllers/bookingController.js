const { pool } = require('../config/database');
const Car = require('../models/Car');
const Booking = require('../models/Booking');

function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInTime = end.getTime() - start.getTime();
  return Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
}

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createBooking(req, res, next) {
  const connection = await pool.getConnection();

  try {
    const { carId, startDate, endDate } = req.body;

    if (!carId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Car ID, start date and end date are required.',
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date.',
      });
    }

    await connection.beginTransaction();

    const car = await Car.findById(carId);

    if (!car) {
      throw createHttpError('Car not found.', 404);
    }

    if (car.availability_status !== 'available') {
      throw createHttpError('This car is already booked.', 400);
    }

    const hasOverlap = await Booking.hasOverlappingBooking(carId, startDate, endDate, connection);

    if (hasOverlap) {
      throw createHttpError('This car already has a booking in the selected date range.', 400);
    }

    const days = calculateDays(startDate, endDate);

    if (days <= 0) {
      throw createHttpError('Booking duration must be at least 1 day.', 400);
    }

    const totalPrice = Number(car.price_per_day) * days;

    const booking = await Booking.createBooking(
      {
        customerId: req.user.id,
        carId,
        startDate,
        endDate,
        totalPrice,
      },
      connection
    );

    await connection.query('UPDATE cars SET availability_status = ? WHERE id = ?', ['booked', carId]);

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Car booked successfully',
      data: booking,
    });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
}

async function getBookings(req, res, next) {
  try {
    if (req.user.role === 'customer') {
      const bookings = await Booking.findByCustomerId(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Customer bookings fetched successfully',
        data: bookings,
      });
    }

    if (req.user.role === 'agency') {
      const bookings = await Booking.findByAgencyId(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Agency bookings fetched successfully',
        data: bookings,
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden.',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createBooking,
  getBookings,
};