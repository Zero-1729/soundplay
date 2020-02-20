/* Helper function to determine whether its night time
*
* @params:-
*   hour  - current hour <typeof Number> [0-23]
*   start - time which the night begins <typeof Number> [0-11] (i.e pm)
*   end   -   "    "    "   "    ends   <typeof Number> [0-11] (i.e am)
*
* NOTE: time checker is in 24 hrs mode
*/
const isNightTime = (hour, start, end) => {
    return ((hour >= start) || (hour < end))
}

// Reformats the hour in '24 hrs' (i.e [0-23])
const formatTo24Hours = (hour) => {
    return (hour < 12 ? (hour + 12) : (hour == 12 ? 0 : hour))
}

// Returns the current time as an Array from the builtin 'Date' fn
const getCurrentTime = () => {
    // [hrs, min, sec]
    return Date().split(' ')[4].split(':')
}

module.exports = { isNightTime, getCurrentTime, formatTo24Hours }
