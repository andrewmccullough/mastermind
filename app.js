const MASTER_COLOR_POOL = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink"];

/*
USER SETTINGS
 */
let numberOfColors = 6;
let numberOfPins = 4;
// TODO customize options

const COLOR_POOL = MASTER_COLOR_POOL.slice(0, numberOfColors);
let colorCounts = {};
COLOR_POOL.forEach(function(elem) {
    colorCounts[elem] = 0;
})

function buildSolution() {
    let solution = [];
    let blockDuplicates = false; // TODO further weight against duplicates
    while (solution.length < numberOfPins) {
        let color = COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];
        let colorCount = colorCounts[color];
        if (!blockDuplicates && colorCount < 2 || blockDuplicates && colorCount < 1) {
            solution.push([color, false]);
            colorCounts[color]++;
        }
        if (colorCounts[color] === 2) {
            blockDuplicates = true;
        }
    }
    return solution;
}
let solution = buildSolution();
console.log(solution);

function buildPalette() {
    // Build palette based on color pool
    COLOR_POOL.forEach(function (elem) {
        $("#palette").append(`<div class="pin ${elem}" data-color="${elem}"></div>`);
    })
}
buildPalette();

function reset() {
    $("#current .pin-container").children().each(function () {
        $(this).removeClass();
        $(this).addClass("pin");
        $(this).removeAttr("data-color");
    })

    // Show the first pin is selected
    $("#current .pin-container .pin:nth-child(1)").addClass("selected");
}

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function verify() {
    let guess = [];
    let error = false;
    $("#current .pin-container").children(".pin").each(function () {
        let color = $(this).attr("data-color");
        if (!color) {
            console.log("Not all pins filled out");
            alert("Choose a color for each pin");
            error = true; // TODO this is an ugly workaround
            return false;
        } else if (!COLOR_POOL.includes(color)) {
            console.log("Invalid color");
            error = true;
            return false;
        } else {
            // pin itself is valid; check that pin collection is valid at later point
            guess.push([color, false]);
        }
    })

    if (error) {
        return false;
    }

    if (guess.length !== solution.length) {
        console.log("Guess and solution length mismatch");
        return false;
    } else {
        let hints = [];
        let matches = 0;

        // reset solution
        solution.forEach(function (value, index) {
            solution[index] = [value[0], false];
        })

        // identify perfect matches
        guess.forEach(function (value, i) {
            if (value[0] === solution[i][0]) {
                hints.push(`perfect ${i + 1}`); // TODO remove index, for debugging only
                guess[i][1] = true;
                solution[i][1] = true;
                matches++;
            }
        })

        if (matches === solution.length) {
            alert("You win!");
            return true;
            // TODO stop entire script
            // TODO row of checkmarks beneath the current guess
            // TODO reset option
        }

        console.log(guess);
        console.log(solution);

        // identify loose matches
        guess.forEach(function (value, i) {
            let success = false;
            if (value[1] === false) {
                solution.forEach(function (answer, j) {
                    if (!success) {
                        if (answer[0] === value[0] && answer[1] === false) {
                            hints.push(`loose ${i + 1}`); // TODO remove index, for debugging only
                            guess[i][1] = true;
                            solution[j][1] = true;
                            success = true;
                        }
                    }
                })
            }
        })

        $("#guesses").append(`<div class="guess"><div class="pin-container"></div><div class="hint-container"></div></div>`)
        $("#current .pin-container").children().clone().appendTo($("#guesses .guess:last-child .pin-container"));

        shuffle(hints);
        console.log(hints);

        hints.forEach(function (value) {
            let match;
            if (value.includes("perfect")) {
                match = "perfect";
            } else if (value.includes("loose")) {
                match = "loose";
            }
            $("#guesses .guess:last-child .hint-container").append(`<div class="${match}"></div>`);
        })

        reset();
    }
}

function buildPins() {
    // Create empty pins
    solution.forEach(function () {
        $("#current .pin-container").append(`<div class="pin"></div>`);
    })
    reset();
}
buildPins();

/* LISTENERS */
// User selects color from palette
$("#palette .pin").click(function() {
    console.log("Palette color selected by user")

    let currentPin = $("#current .pin-container div.selected");
    if (currentPin) {
        let current_color = currentPin.attr("data-color");
        if (current_color) {
            $(currentPin).removeClass(current_color);
        }
        let selected_color = $(this).attr("data-color");
        currentPin
            .addClass(selected_color)
            .attr("data-color", selected_color)
            // Move to next pin after selection
            .removeClass("selected")
            .next().addClass("selected");
    }
})

// Allow user to select each pin, even out of order
$("#current .pin-container .pin").click(function() {
    console.log("Pin selected by user");

    $("#current .pin-container .pin.selected").removeClass("selected");
    $(this).addClass("selected");
})

// Submit guess on user click
$("#current .button-container .button").click(function() {
    verify();
})