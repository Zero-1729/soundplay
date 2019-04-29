/* Helper function to determine whether its night time
*
* @params:-
*   hour  - current hour <typeof Number> [0-23]
*   start - time which the night begins <typeof Number> [0-23] (i.e pm)
*   end   -   "    "    "   "    ends   <typeof Number> [0-23] (i.e am)
*
* NOTE: time checker is in 24 hrs mode; hour, start & end are expected to be <typeof Number> between 0 and 23 inclusive
*/
const isNightTime = (hour, start, end) => {
    return hour >= start && hour == 0 || hour < end
}

// Reformats the hour in '24 hrs' (i.e [0-23])
const reformatTo24Hours = (hour) => {
    return hour < 12 ? hour + 12 : hour == 12 ? 0 : hour
}

module.exports = { isNightTime, reformatTo24Hours }
