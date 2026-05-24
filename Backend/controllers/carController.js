const Car = require('../models/Car');

async function getAvailableCars(req, res, next) {
  try {
    const cars = await Car.findAvailableCars();
    return res.status(200).json({
      success: true,
      message: 'Available cars fetched successfully',
      data: cars,
    });
  } catch (error) {
    // If the cars table doesn't exist, treat it as an empty dataset
    if (error && (error.code === 'ER_NO_SUCH_TABLE' || /doesn't exist/i.test(error.message))) {
      return res.status(200).json({
        success: true,
        message: 'Available cars fetched successfully',
        data: [],
      });
    }

    return next(error);
  }
}

async function getCarById(req, res, next) {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Car fetched successfully',
      data: car,
    });
  } catch (error) {
    // If the cars table doesn't exist, surface a 404 (car not found)
    if (error && (error.code === 'ER_NO_SUCH_TABLE' || /doesn't exist/i.test(error.message))) {
      return res.status(404).json({
        success: false,
        message: 'Car not found.',
      });
    }

    return next(error);
  }
}

async function getMyCars(req, res, next) {
  try {
    const cars = await Car.findByAgencyId(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Agency cars fetched successfully',
      data: cars,
    });
  } catch (error) {
    // If the cars table doesn't exist, return an empty list for agency cars
    if (error && (error.code === 'ER_NO_SUCH_TABLE' || /doesn't exist/i.test(error.message))) {
      return res.status(200).json({
        success: true,
        message: 'Agency cars fetched successfully',
        data: [],
      });
    }

    return next(error);
  }
}

async function addCar(req, res, next) {
  try {
    const { brand, model, year, licensePlate, pricePerDay, seatingCapacity } = req.body;

    if (!brand || !model || !year || !licensePlate || !pricePerDay || !seatingCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Brand, model, year, license plate, seating capacity and price per day are required.',
      });
    }

    const car = await Car.create({
      agencyId: req.user.id,
      brand,
      model,
      year,
      licensePlate: licensePlate.toUpperCase(),
      pricePerDay,
      seatingCapacity: Number(seatingCapacity),
      features: req.body.features,
      imageUrl: req.body.imageUrl,
    });

    return res.status(201).json({
      success: true,
      message: 'Car added successfully',
      data: car,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateCar(req, res, next) {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found.',
      });
    }

    if (car.agency_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own cars.',
      });
    }

    if (!req.body.brand || !req.body.model || !req.body.year || !req.body.licensePlate || !req.body.pricePerDay || !req.body.seatingCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Brand, model, year, license plate, seating capacity and price per day are required.',
      });
    }

    const updatedCar = await Car.updateById(req.params.id, {
      brand: req.body.brand,
      model: req.body.model,
      year: req.body.year,
      licensePlate: req.body.licensePlate ? req.body.licensePlate.toUpperCase() : undefined,
      pricePerDay: req.body.pricePerDay,
      seatingCapacity: req.body.seatingCapacity,
      availabilityStatus: req.body.availabilityStatus,
      features: req.body.features,
      imageUrl: req.body.imageUrl,
    });

    return res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      data: updatedCar,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAvailableCars,
  getCarById,
  getMyCars,
  addCar,
  updateCar,
};