// First some convenient objects to help us navigate the board
const nextCol = {
    'A': 'B',
    'B': 'C',
    'C': 'D',
    'D': 'E',
    'E': 'F',
    'F': 'G',
    'G': 'H'
};

const prevCol = {
    'H': 'G',
    'G': 'F',
    'F': 'E',
    'E': 'D',
    'D': 'C',
    'C': 'B',
    'B': 'A'
};

/**
 * A method to move a piece from one square to another
 * @param initialPos The starting index of the piece
 * @param endPos The ending index of the piece
 */
function movePiece(initialPos, endPos) {
    // Find target piece
    let parentSquare = $("#" + initialPos);
    let pieceToMove = parentSquare.html();

    // Add piece info to destination
    let destination = $("#" + endPos);
    destination.html(pieceToMove);
    destination.addClass("containsPiece");

    // Remove piece from initial position
    parentSquare.empty();
    parentSquare.removeClass("containsPiece");
}

/**
 * A utility method to switch on/off the "selected" state of a given square
 * @param location The location of the square
 */
function toggleSelected(location) {
    let square = $("#" + location);
    square.hasClass("selected") ? square.removeClass("selected") : square.addClass("selected");
}

/**
 * A method that exhaustively calculates all possible destinations a given piece can move to.
 * @param location The location of the piece
 * @param pieceType The type of chess piece (pawn, knight, rook, etc...)
 * @param isFirstMove An optional parameter to indicate if it is a pawn's first move of the game
 * @returns {Array} An array containing all possible moves
 */
function evaluatePotentialMoves(location, pieceType, isFirstMove=false) {
    let potentialDestinations = [];
    let col = location.charAt(0);
    let row = location.charAt(1);

    switch(pieceType) {
        case "pawn":
            potentialDestinations.push(col + ((1*row)+1));
            potentialDestinations.push(col + (row-1));

            // pawns can move forward (or backward depending on team) 2 spaces on their first move only
            if(isFirstMove){
                potentialDestinations.push(col + ((1*row)+2));
                potentialDestinations.push(col + (row-2));
            }

            // and pawns can attack diagonally
            potentialDestinations.push(nextCol[col] + ((1*row)+1));
            potentialDestinations.push(prevCol[col] + ((1*row)+1));
            potentialDestinations.push(nextCol[col] + (row-1));
            potentialDestinations.push(prevCol[col] + (row-1));

            break;
        case "rook":
            for(let i=1; i <= 8; i++){
                potentialDestinations.push(col + i);
            }
            for(const key in nextCol){
                potentialDestinations.push(key + row);
            }
            break;
        case "knight":
            potentialDestinations.push(prevCol[prevCol[col]] + ((1*row)+1));
            potentialDestinations.push(prevCol[prevCol[col]] + (row-1));
            potentialDestinations.push(prevCol[col] + ((1*row)+2));
            potentialDestinations.push(prevCol[col] + (row-2));
            potentialDestinations.push(nextCol[nextCol[col]] + ((1*row)+1));
            potentialDestinations.push((nextCol[nextCol[col]] + (row-1)));
            potentialDestinations.push(nextCol[col] + ((1*row)+2));
            potentialDestinations.push(nextCol[col] + (row-2));
            break;
        case "bishop":
            var currCol = col;
            var incRow = row;
            var decRow = row;

            // step backwards through columns
            while(currCol !== 'A') {
                currCol = prevCol[currCol];
                if(incRow < 8) {
                    potentialDestinations.push(currCol + (++incRow));
                }
                if(decRow > 1) {
                    potentialDestinations.push(currCol + (--decRow));
                }
            }

            // reset
            currCol = col;
            incRow = row;
            decRow = row;

            // step forwards through columns
            while(currCol !== 'H') {
                currCol = nextCol[currCol];
                if(incRow < 8) {
                    potentialDestinations.push(currCol + (++incRow));
                }
                if(decRow > 1) {
                    potentialDestinations.push(currCol + (--decRow));
                }
            }
            break;
        case "queen":
            // Queen can move like a rook
            for(let i=1; i <= 8; i++){
                potentialDestinations.push(col + i);
            }
            for(const key in nextCol){
                potentialDestinations.push(key + row);
            }

            // And like a bishop :)

            var currCol = col;
            var incRow = row;
            var decRow = row;

            // step backwards through columns
            while(currCol !== 'A') {
                currCol = prevCol[currCol];
                if(incRow < 8) {
                    potentialDestinations.push(currCol + (++incRow));
                }
                if(decRow > 1) {
                    potentialDestinations.push(currCol + (--decRow));
                }
            }

            // reset
            currCol = col;
            incRow = row;
            decRow = row;

            // step forwards through columns
            while(currCol !== 'H') {
                currCol = nextCol[currCol];
                if(incRow < 8) {
                    potentialDestinations.push(currCol + (++incRow));
                }
                if(decRow > 1) {
                    potentialDestinations.push(currCol + (--decRow));
                }
            }

            break;
        case "king":
            potentialDestinations.push(col + ((1*row)+1));
            potentialDestinations.push(col + (row-1));
            potentialDestinations.push(nextCol[col] + ((1*row)+1));
            potentialDestinations.push(nextCol[col] + row);
            potentialDestinations.push(nextCol[col] + (row-1));
            potentialDestinations.push(prevCol[col] + ((1*row)+1));
            potentialDestinations.push(prevCol[col] + row);
            potentialDestinations.push(prevCol[col] + (row-1));
            break;
    }

    return potentialDestinations;
}

function locationIsValid(location) {
    let col = location.charAt(0);
    let row = location.charAt(1);

    if(row > 8 || row < 1) {
        return false;
    }

    switch(col) {
        case 'A':
        case 'B':
        case 'C':
        case 'D':
        case 'E':
        case 'F':
        case 'G':
        case 'H':
            return true;
        default:
            return false;
    }
}

function evaluateValidMoves(location, pieceType, potentialMoves) {
    // assume all moves are valid
    let validMoves = potentialMoves;

    // determine which team we are evaluating moves for
    let team = $("#"+location).html().hasClass("blackTeam") ? "blackTeam" : "whiteTeam";

    for(let i=0; i < potentialMoves.length; i++) {

        if(!locationIsValid(potentialMoves[i])) {
            validMoves.remove(potentialMoves[i]);
            continue;
        }

        // find destination element
        let dest = potentialMoves[i];
        let destElem = $("#"+dest);

        // If a destination has own team's piece, invalidate move
        if(destElem.html().hasClass(team)) {
            validMoves.remove(potentialMoves[i]);
            continue;
        }

        // Pawns can't move backwards (direction depends on team)
        if(pieceType === "pawn") {
            let srcRow = location.charAt(1);
            let destRow = dest.charAt(1);
            if(team === "blackTeam") {
                if(destRow > srcRow) {
                    validMoves.remove(potentialMoves[i]);
                    continue;
                }
            }
            else {
                if(destRow < srcRow) {
                    validMoves.remove(potentialMoves[i]);
                    continue;
                }
            }

            // Pawns also can't move diagonally unless it is an attack
            let srcCol = location.charAt(0);
            let destCol = location.charAt(1);
            if(srcCol !== destCol) {
                // if destination is empty, invalidate diagonal move
                if(destElem.html() === "") {
                    validMoves.remove(potentialMoves[i]);
                    continue;
                }
            }
            // Pawns also can't attack forward
            else {
                // if destination is nonempty, invalidate forward move
                if(destElem.html() !== "") {
                    validMoves.remove(potentialMoves[i]);
                    continue;
                }
            }
        }

        // If there is a piece blocking the path, invalidate move (except knights can jump)
        if(pieceType !== "knight") {

        }
    }
}

$(function(){
    $(".containsPiece").click(function() {
        toggleSelected($(".selected").id);
        toggleSelected(this.id);
    });

    var arr = evaluatePotentialMoves("D5", "bishop");
    for(var i=0; i < arr.length; i++) {
        console.log(arr[i]);
    }
});