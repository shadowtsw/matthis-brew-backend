let startTime: string | Date;

export const getStartTime = {
  set: (date: Date) => {
    startTime = date;
    startTime =
      startTime.toDateString() + " " + startTime.toTimeString().split(" ")[0];
  },
  get: () => {
    return startTime ? startTime : "Server seems to be offline";
  },
};
