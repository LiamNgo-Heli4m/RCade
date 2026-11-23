function loopedIncrement(array, currentIndex) {
    if (currentIndex + 1 >= array.length) {
        return array[0];
    } else {
        return array[currentIndex + 1];
    }
}

module.exports = { loopedIncrement };