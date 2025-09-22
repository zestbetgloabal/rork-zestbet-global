const createContext = async (opts) => {
  // Simple context for Lambda
  return {
    req: opts.req,
    res: opts.res,
    user: null, // Add auth logic here
  };
};

module.exports = { createContext };