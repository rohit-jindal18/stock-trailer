export function getCurrentDate(timestamp?: number) {
    let ts = timestamp || Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    return {
        year,
        month,
        date
    }
}

export function isDateEqual(date1: { year: number, month: number, date: number }
    , date2: { year: number, month: number, date: number }) {
    return date1.date === date2.date && date1.month === date2.month && date1.year === date2.year;
}

const SLOT_INTERVAL = 50;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const PREFIX_NIFTY = 'NIFTY';
const CALL_OPTION_PREFIX = 'CE';
const PUT_OPTION_PREFIX = 'PE';

export function getNearestSlotValue(currentValue: number) {
    const rem = currentValue % 100;
    let lowerValue = currentValue - rem;
    if (rem >= SLOT_INTERVAL) {
        lowerValue = lowerValue + SLOT_INTERVAL
    }
    const higherValue = lowerValue + SLOT_INTERVAL;
    if (currentValue < (lowerValue + (SLOT_INTERVAL / 2))) {
        return Math.trunc(lowerValue);
    } else {
        return Math.trunc(higherValue);
    }
}

export function getNextDayOfWeek(date: Date, dayOfWeek: number) {
    // Code to check that date and dayOfWeek are valid left as an exercise ;)
    var resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    return getCurrentDate(resultDate.getTime());
}

function getFormattedDate(date: number) {
    return `${date < 10 ? 0 : ''}${date}`
}

export function getNearestOptionValue(currentValue: number): {
    weeklyExpiry: string,
    monthlyExpiry: string
} {
    const currentDate = getCurrentDate();
    const year: number = currentDate.year % 100;
    const nextThursdayDate = getNextDayOfWeek(new Date(), 4);
    const nearestNiftyValue: number = getNearestSlotValue(currentValue);
    const month: string = MONTHS[nextThursdayDate.month - 1];

    return {
        weeklyExpiry: `${PREFIX_NIFTY}${year}${nextThursdayDate.month}${getFormattedDate(nextThursdayDate.date)}${nearestNiftyValue}`,
        monthlyExpiry: `${PREFIX_NIFTY}${year}${month}${nearestNiftyValue}`
    };
}