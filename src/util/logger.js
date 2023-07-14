const logger = (log) => {
  console.log(
    `${new Date().toISOString()} --- ${JSON.stringify({ log }, null, 2)}`
  );
};

module.exports = { logger };
