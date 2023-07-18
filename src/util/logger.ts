const logger = (log: any) => {
  console.log(`${new Date().toISOString()} --- ${log}`);
};

export { logger };
