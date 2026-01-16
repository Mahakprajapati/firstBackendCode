//Based on Promise
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      return next(error);
    });
  };
};
export { asyncHandler };

// const asyncHandler = ()=>{}

// const asyncHandler = (fn)=> { return ()=>{} } //return a arrow function using return keyword
// const asyncHandler = (fn)=> ()=>{} //return a arrow function without using return keyword

/*
//based on async-await
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  }
};
*/
