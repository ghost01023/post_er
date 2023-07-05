// console.log(new Date().getTime() / 1000)
// A TIME OBJECT WILL BE PRESENT IN THE FOLLOWING FORMAT:
// .year, .month, .day, .time[hours, minutes, seconds]
const POST_ER_EPOCH = {
    year: 2023,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0
}


const IsLeapYear = (val) => {
    return (val % 100) ? val % 400 === 0 : val % 4 === 0
}

const num_of_days = (val, isLeap) => {
    let arr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (val === 2 && isLeap) {
        return 29
    } else {
        return arr[val]
    }
}


class Dates {
    constructor(year, month, day, time) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.time = time;
        this.total_days = () => {
            let days = this.day - 1;
            for (let i = POST_ER_EPOCH.year; i < this.year; i++) {
                days += IsLeapYear(i) ? 366 : 365;
            }
            for (let i = POST_ER_EPOCH.month; i < this.month; i++) {
                console.log(typeof (i))
                days += num_of_days(i, IsLeapYear(i))
            }
            return days
        }
        this.total_seconds = (this.time[0] * 60 * 60) + (this.time[1] * 60) + this.time[2];
        this.isOneDayOld = () => {
            return (new Age(this)).oneDayOld()
        }
        this.isAStory = () => {
            let age = new Age(this)
            return age.notation === "hours" || age.notation === "minutes" || age.notation === "seconds"
        }
    }
}


const getCurrentDate = () => {
    const current_day = new Date();
    return new Dates(current_day.getFullYear(), current_day.getMonth() + 1, current_day.getDate(),
        [current_day.getHours(), current_day.getMinutes(), current_day.getSeconds()])
}

class Age {
    constructor(dates_obj) {
        this.notation = "seconds"
        if (dates_obj.total_days() > 0) {
            this.total_time = dates_obj.total_days();
            if (this.total_time > 365) {
                this.total_time = Math.round(this.total_time / 365)
                this.notation = "years"
            } else if (this.total_time > 30) {
                this.total_time = Math.round(this.total_time / 30)
                this.notation = "months"
            } else if (this.total_time > 7) {
                this.total_time = Math.round(this.total_time / 7)
                this.notation = "days"
            }
        } else {
            this.total_time = dates_obj.total_seconds
            if (this.total_time > 3600) {
                this.total_time = Math.round(this.total_time / 3600)
                this.notation = "hours"
            } else if (this.total_time > 60) {
                this.total_time = Math.round(this.total_time / 60)
                this.notation = "minutes"
            }
        }
        if (this.total_time === 0) {
            this.total_time = 1;
        }
        this.oneDayOld = () => {
            return this.notation.includes("years") || this.notation.includes("months") || this.notation.includes("days")
        }
    }
}

const total_days = (date) => {
    let split_date = date.split("-");
    let days = 0
    for (let i = 2023; i < parseInt(split_date[0]); i++) {
        if (IsLeapYear(i)) {
            days += 366
        } else {
            days += 365
        }
    }
    for (let i = 1; i < parseInt(split_date[1]); i++) {
        days += num_of_days(i, IsLeapYear(i))
    }
    for (let i = 1; i < parseInt(split_date[2]); i++) {
        days++
    }
    return days
}


const total_seconds = (time) => {
    let seconds = 0
    for (let i = 0; i < time[0]; i++) {
        seconds += (60 * 60)
    }
    for (let i = 0; i < time[1]; i++) {
        seconds += 60
    }
    for (let i = 0; i < time[2]; i++) {
        seconds++
    }
    return seconds
}

const seconds_to_time = (val) => {
    let hours = Math.floor(val / (60 * 60));
    let pre_min = val % (60 * 60);
    let min = Math.floor(pre_min / 60);
    let sec = pre_min - (min * 60);
    return [hours, min, sec]
}

module.exports = {POST_ER_EPOCH, Dates, getCurrentDate, Age, total_seconds, total_days, seconds_to_time}