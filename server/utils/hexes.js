
function checkHexes(targetHex, hexesArray, id, roomId, rooms) {
    const room = rooms.find(room => room.roomId === roomId);
    for (const client of room.clients) {
        if (client.id === id) { continue; }
        if (Math.round(client.xValue) === Math.round(targetHex.xValue) && Math.round(client.yValue) === Math.round(targetHex.yValue)) {
            return false;
        }
    }

    for (const hex of hexesArray) {
        if (typeof hex === "undefined") { continue; }
        if (hex === null) { continue; }
        if (Math.round(targetHex.xValue) === Math.round(hex.xValue) && Math.round(targetHex.yValue) === Math.round(hex.yValue)) {
            return true;
        }
    }

    return false;
}

function acquireSurroundingHexes(selectedHex, hexaArray) {
    const hexArray = []
    const yPos = selectedHex ? Math.round(selectedHex.yValue) : null;
    let isEven = false
    for (const array of hexaArray) {
        const hexodd = array[1]
        const hexeven = array[0]

        const checkOddYValue = hexodd ? Math.round(hexodd.yValue) === yPos : false;
        const checkEvenYValue = hexeven ? Math.round(hexeven.yValue) === yPos : false;

        if (checkOddYValue || checkEvenYValue) {
            isEven = checkEvenYValue;
            const id = array.findIndex(hex => hex !== null && hex.xValue === selectedHex.xValue);
            const arrayId = hexaArray.indexOf(array)

            const arrayAbove = hexaArray[arrayId - 1]
            const arrayBelow = hexaArray[arrayId + 1]

            hexArray.push(array[id - 1]);
            hexArray.push(array[id + 1]);
            hexArray.push(arrayAbove ? arrayAbove[id] : null);
            hexArray.push(arrayBelow ? arrayBelow[id] : null);

            if (isEven) {
                hexArray.push(arrayAbove ? arrayAbove[id - 1] : null);
                hexArray.push(arrayAbove ? arrayAbove[id + 1] : null);
            } else {
                hexArray.push(arrayBelow ? arrayBelow[id - 1] : null);
                hexArray.push(arrayBelow ? arrayBelow[id + 1] : null);
            }

            break;
        }
    }

    return hexArray;
}

module.exports = { checkHexes, acquireSurroundingHexes };