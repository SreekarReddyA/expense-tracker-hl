export const compareDateWithoutTime = (date1, date2) => {
    date1.setHours(0,0,0,0);
    date2.setHours(0,0,0,0);
    return date1.getTime() === date2.getTime();
}