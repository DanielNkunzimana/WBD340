exports.triggerError = (req, res, next) => {
    const error = new Error('This is a deliberate error for testing purposes.');
    error.status = 500;
    next(error);
  };