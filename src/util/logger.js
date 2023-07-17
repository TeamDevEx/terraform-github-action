const logger = (log) => {
  console.log(`${new Date().toISOString()} --- ${log}`);
};

module.exports = { logger };
