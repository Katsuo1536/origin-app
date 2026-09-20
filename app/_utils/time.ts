export const time = (dateTime: Date) => {
  const date = new Date(dateTime);
  // const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();

  const dateText = month + '月' + day + '日';

  return dateText;
};