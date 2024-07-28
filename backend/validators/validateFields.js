const validateFields = async (payloadData, allowedFields, invalid, missing) => {
  try {
    const payloadFields = Object.keys(payloadData);

    if (invalid) {
      const invalidFields = payloadFields.filter(
        (field) => !allowedFields.includes(field)
      );

      if (invalidFields.length > 0) {
        throw new CustomError(
          `Invalid fields: ${invalidFields.join(", ")}`,
          501
        );
      }
    }

    if (missing) {
      const missingFields = allowedFields.filter(
        (field) => !payloadFields.includes(field)
      );

      if (missingFields.length > 0) {
        throw new CustomError(
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
      }
    }
  } catch (err) {
    throw err;
  }
};

module.exports = validateFields;
