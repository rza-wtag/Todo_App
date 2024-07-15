export const calculateCompletionTime = (createdAt) => {
  const MS_IN_ONE_DAY = 1000 * 60 * 60 * 24;
  const [day, month, year] = createdAt.split(".").map(Number);
  const createdDate = new Date(`20${year}`, month - 1, day);
  const currentDate = new Date();
  const diffInDays = Math.floor((currentDate - createdDate) / MS_IN_ONE_DAY);

  return `Completed in ${diffInDays} days`;
};
