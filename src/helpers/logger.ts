const logError = (message: string, error?: any) => {
  const date = new Date();

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();

  const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")} ${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  let log = `${formattedDate} ||| ${message} ||| ${
    error ? error : "No error object provided"
  }`;
  console.error(log);
  if (process.env.ENV === "dev" && error) {
    console.error(error);
  }
};

export default logError;
