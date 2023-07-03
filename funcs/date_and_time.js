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


Number.prototype.isLeapYear = () => {
    let val = parseInt(this);
    return (val % 100) ? val % 400 === 0 : val % 4 === 0
}

Number.prototype.num_of_days = (val, isLeap) => {
    let arr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (this === 2 && isLeap) {
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
                days += i.isLeapYear() ? 366 : 365;
            }
            for (let i = POST_ER_EPOCH.month; i < this.month; i++) {
                console.log(typeof (i))
                days += i.num_of_days(i, this.year.isLeapYear())
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

module.exports = { POST_ER_EPOCH, Dates, getCurrentDate, Age }