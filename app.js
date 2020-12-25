const MASTER_COLOR_POOL = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "black", "pink"];

/*
USER SETTINGS
 */
let numberOfColors = 6; // Default, Global
let numberOfPins = 4; // Default, Global

let color_pool = []; // Global
let solution = []; // Global
let frozen = false; // Global
let guessCount = 0; // Global

function buildColorPool() {
    console.log("Building color pool");

    color_pool = MASTER_COLOR_POOL.slice(0, numberOfColors);
    $("#options #possible-colors span").text(numberOfColors);
    buildPalette();
}
buildColorPool();

function buildPalette() {
    console.log("Building palette")

    $("#palette").html("");
    color_pool.forEach(function (elem) {
        $("#palette").append(`<div class="pin ${elem}" data-color="${elem}"></div>`);
    })
    buildSolution();
}

function buildSolution() {
    console.log("Building new solution")

    let colorCounts = {};
    color_pool.forEach(function(elem) {
        colorCounts[elem] = 0;
    })

    let minimumDuplicates = Math.max(0, numberOfPins - numberOfColors);
    let allowableDuplicates = minimumDuplicates;

    let duplicateWeight = Math.random();
    if (duplicateWeight > 0.6) {
        allowableDuplicates = minimumDuplicates + 1;
    }

    let duplicateCount = 0;

    console.log(`${allowableDuplicates} duplicates allowed`);

    solution = [];
    while (solution.length < numberOfPins) {
        let color = color_pool[Math.floor(Math.random() * color_pool.length)];
        let colorCount = colorCounts[color];

        if (colorCount == 0 || colorCount == 1 && duplicateCount < allowableDuplicates) {
            solution.push([color, false]);
            if (colorCount == 1) {
                duplicateCount++;
            }
            colorCounts[color]++;
        }
    }
    guessCount = 0;
    console.log(solution);

    $("#options #pins-in-solution span").text(numberOfPins);
    buildPins();
}

function clearPrevious() {
    console.log("Clearing previous guesses");

    $("#guesses").html("");
}

function resetGuess() {
    console.log("Reset current guess builder");

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

function freeze() {
    console.log("Freezing gameplay");

    frozen = true;
    $("#gamebox").addClass("frozen");
}

function detonate() {
    console.log("Confetti");

    const colors = [
        '#26ccff',
        '#a25afd',
        '#ff5e7e',
        '#88ff5a',
        '#fcff42',
        '#ffa62d',
        '#ff36ff'
    ];
    let end;

    if ($(window).width() < 900) {
        end = Date.now() + (2 * 1000);

        (function frame() {
            confetti({
                particleCount: 17,
                angle: 270,
                spread: 80,
                startVelocity: 45,
                decay: 0.9,
                gravity: 1,
                origin: { x: 0.5, y: -0.25 },
                colors: colors,
                zIndex: 10000,
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    } else {
        end = Date.now() + (1.25 * 1000);

        (function frame() {
            confetti({
                particleCount: 17,
                angle: 40,
                spread: 80,
                startVelocity: 70,
                decay: 0.9,
                gravity: 0.9,
                origin: { x: -0.15, y: 0.6 },
                colors: colors,
                zIndex: 10000,
            });
            confetti({
                particleCount: 17,
                angle: 140,
                spread: 80,
                startVelocity: 70,
                decay: 0.9,
                gravity: 0.9,
                origin: { x: 1.15, y: 0.6 },
                colors: colors,
                zIndex: 10000,
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
}

function verify() {
    console.log("Checking guess");

    let guess = [];
    guessCount++;
    let error = false;
    $("#current .pin-container").children(".pin").each(function () {
        let color = $(this).attr("data-color");
        if (!color) {
            console.log("Not all pins filled out");
            Swal.fire({
                icon: "error",
                title: "Choose a color for each pin",
                showConfirmButton: false,
                timer: 2000
            })
            error = true;
            return false;
        } else if (!color_pool.includes(color)) {
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
                hints.push(`perfect, pin ${i + 1}`);
                guess[i][1] = true;
                solution[i][1] = true;
                matches++;
            }
        })

        if (matches === solution.length) {
            detonate();
            Swal.fire({
                icon: "success",
                title: `You won in ${guessCount} guesses!`,
                text: "Do you want to reset and play again?",
                showConfirmButton: true,
                confirmButtonText: "Yes!",
                showCancelButton: true,
                cancelButtonText: "No thanks."
            }).then((result) => {
                if (result.isConfirmed) {
                    // Reset and replay
                    buildSolution();
                    clearPrevious();
                    resetGuess();
                } else {
                    // Stop entire script
                    freeze();
                }
            })
            return true; // necessary?
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
                            hints.push(`loose, pin ${i + 1}`);
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

        resetGuess();
    }
}

function buildPins() {
    $("#current .pin-container").html("");
    // Create empty pins
    solution.forEach(function () {
        $("#current .pin-container").append(`<div class="pin"></div>`);
    })
    resetGuess();
}

/* LISTENERS */

// Change number of possible colors
function setNumberOfColors() {
    console.log("Changing number of colors");

    Swal.fire({
        title: "Possible colors",
        text: "How many colors do you want to play with?",
        icon: "question",
        input: "range",
        inputAttributes: {
            min: numberOfPins, // TODO remove
            max: MASTER_COLOR_POOL.length,
            step: 1
        },
        inputValue: numberOfColors
    }).then((result) => {
        if (result.isConfirmed && result.value != numberOfColors) {
            numberOfColors = result.value;
            clearPrevious();
            resetGuess();
            buildColorPool();
        }
    })
}
$("#options #possible-colors").click(function () {
    if (!frozen) {
        setNumberOfColors();
    }
})

// Change number of pins in solution
function setNumberOfPins() {
    console.log("Change number of pins");

    Swal.fire({
        title: "Pins in solution",
        text: "How many pins do you want in the solution?",
        icon: "question",
        input: "range",
        inputAttributes: {
            min: 2,
            max: numberOfColors, // TODO remove
            step: 1
        },
        inputValue: numberOfPins
    }).then((result) => {
        if (result.isConfirmed && result.value != numberOfPins) {
            numberOfPins = result.value;
            clearPrevious();
            resetGuess();
            buildSolution();
        }
    })
}
$("#options #pins-in-solution").click(function () {
    if (!frozen) {
        setNumberOfPins();
    }
})

// User selects color from palette
$("#palette").on("click", ".pin", function(event) {
    event.preventDefault();

    if (!frozen) {
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
    }
})

// Allow user to select each pin, even out of order
$("#current .pin-container").on("click", ".pin", function (event) {
    event.preventDefault();

    if (!frozen) {
        console.log("Pin selected by user");

        $("#current .pin-container .pin.selected").removeClass("selected");
        $(this).addClass("selected");
    }
})

// Submit guess on user click
$("#current .button-container .button").click(function() {
    if (!frozen) {
        verify();
    }
})