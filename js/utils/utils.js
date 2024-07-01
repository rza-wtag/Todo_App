export const calculateCompletionTime = (createdAt) => {
  const [day, month, year] = createdAt.split(".").map(Number);
  const createdDate = new Date(`20${year}`, month - 1, day);
  const currentDate = new Date();
  const diffInDays = Math.floor(
    (currentDate - createdDate) / (1000 * 60 * 60 * 24)
  );

  return `Completed in ${diffInDays} days`;
};
