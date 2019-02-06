export const errorParser = (error) => {
  return JSON.parse(
    JSON.stringify(
      error, Object.getOwnPropertyNames(error)
    )
  );
};
