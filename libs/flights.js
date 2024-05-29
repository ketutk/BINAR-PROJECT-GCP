exports.filterFlight = async (req) => {
  const { from: from_code, to: to_code, d: departureAt, rt: is_return, rd: return_departureAt, p: passengers = 1, sc: seat_class } = req.query;

  if (!from_code || !to_code || !seat_class) {
    throw {
      statusCode: 400,
      status: false,
      message: "Missing required field",
      data: null,
    };
  }

  const startOfDay = new Date(departureAt);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(departureAt);
  endOfDay.setHours(23, 59, 59, 999);

  const where = {
    from_code: from_code,
    to_code: to_code,
    departureAt: {
      gte: startOfDay,
      lte: endOfDay,
    },
    flight_classes: {
      some: {
        available_seats: {
          gte: +passengers,
        },
        name: seat_class,
      },
    },
  };

  if (is_return) {
    if (!return_departureAt) {
      throw {
        statusCode: 400,
        status: false,
        message: "Please include return date",
        data: null,
      };
    }
    const startOfDay = new Date(return_departureAt);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(return_departureAt);
    endOfDay.setHours(23, 59, 59, 999);

    where.is_return = is_return === "true" ? true : false;
    where.return_departureAt = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  return where;
};