const logger = (log, spinner) => {
  console.log(
    `${new Date().toISOString()} --- ${JSON.stringify({ log }, null, 2)} ${
      spinner?.dots || ""
    }`
  );
};

module.exports = { logger };
