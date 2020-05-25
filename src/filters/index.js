// import parseTime, formatTime and set to filter
import { parseTime, formatTime }
from '@/utils'

/**
 * Show plural label if time is plural number
 * @param {number} time
 * @param {string} label
 * @return {string}
 */
function pluralize(time, label) {
    if (time === 1) {
        return time + label
    }
    return time + label + 's'
}

/**
 * @param {number} time
 */
export function timeAgo(time) {
    const between = Date.now() / 1000 - Number(time)
    if (between < 3600) {
        return pluralize(~~(between / 60), ' minute')
    } else if (between < 86400) {
        return pluralize(~~(between / 3600), ' hour')
    } else {
        return pluralize(~~(between / 86400), ' day')
    }
}

/**
 * Number formatting
 * like 10000 => 10k
 * @param {number} num
 * @param {number} digits
 */
export function numberFormatter(num, digits) {
    const si = [
        { value: 1E18, symbol: 'E' },
        { value: 1E15, symbol: 'P' },
        { value: 1E12, symbol: 'T' },
        { value: 1E9, symbol: 'G' },
        { value: 1E6, symbol: 'M' },
        { value: 1E3, symbol: 'k' }
    ]
    for (let i = 0; i < si.length; i++) {
        if (num >= si[i].value) {
            return (num / si[i].value + 0.1).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[i].symbol
        }
    }
    return num.toString()
}

/**
 * 10000 => "10,000"
 * @param {number} num
 */
export function toThousandFilter(num) {
    return (+num || 0).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}

/**
 * Upper case first char
 * @param {String} string
 */
export function uppercaseFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export function dateParse(time) {
    return parseTime(time, '{y}-{m}-{d}')
}

export function excludSec(time) {
    return parseTime(time, '{y}-{m}-{d} {h}:{i}')
}

export function timeParse(time) {
    return parseTime(time)
}


export function Dateformat(time) {
    return formatTime(time,'{y}-{m}-{d}');
}

export function DateTimeformat(time) {
    return formatTime(time)
}

export function Timeformat(time) {
    return formatTime(time,'{h}:{i}:{s}')
}

/**
 * 转换文件大小格式
 * @param {文件大小} filesize 
 */
export function renderSize(filesize){
    let value = filesize;
    if(null==value||value==''){
        return "0 Bytes";
    }
    var unitArr = new Array("Bytes","KB","MB","GB","TB","PB","EB","ZB","YB");
    var index=0;
    var srcsize = parseFloat(value);
    index=Math.floor(Math.log(srcsize)/Math.log(1024));
    var size =srcsize/Math.pow(1024,index);
    size=size.toFixed(2);//保留的小数位数
    return size+unitArr[index];
}

/**
 * 解析文件视频时长格式
 */
export function resloveVideoDuration(duration){
    let time = duration;
    if(time > -1){
        time = time / 1000;
        var hour = Math.floor(time/3600);
        var min = Math.floor(time/60) % 60;
        var sec = time % 60;
        if(hour < 10) {
            time = '0'+ hour + ":";
        } else {
            time = hour + ":";
        }

        if(min < 10){
            time += "0";
        }
        time += min + ":";

        if(sec < 10){
            time += "0";
        }
        time += sec;
    }
    return time;
}