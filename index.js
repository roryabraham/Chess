/*
 *  File: index.js
 *  Project: Web Chess (Cheddah)
 *  Author: Rory Abraham
 */



const gameState = {
    start: true,
    isBlackTurn: false,
    check: false,
    checkMate: false
};

// Some convenient objects to help us navigate the board
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
    let pieceToMove = $(parentSquare.html());

    // remove first-turn marker for pawns
    if(pieceToMove.hasClass("pawn") && pieceToMove.data().firstturn) {
        pieceToMove.data().firstturn = false;
    }

    // Add piece info to destination
    let destination = $("#" + endPos);
    destination.html(pieceToMove);
    destination.addClass("containsPiece");

    // Remove piece from initial position
    parentSquare.empty();
    parentSquare.removeClass("containsPiece");
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
            potentialDestinations.push(`H${row}`);
            break;
        case "knight":
            potentialDestinations.push(prevCol[prevCol[col]] + ((1*row)+1));
            potentialDestinations.push(prevCol[prevCol[col]] + (row-1));
            potentialDestinations.push(prevCol[col] + ((1*row)+2));
            potentialDestinations.push(prevCol[col] + (row-2));
            potentialDestinations.push(nextCol[nextCol[col]] + ((1*row)+1));
            potentialDestinations.push(nextCol[nextCol[col]] + (row-1));
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
            potentialDestinations.push(`H${row}`);

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

/**
 * A utility method to ensure that a given location is on the board...A bit redundant really
 * @param location The location in COL_ROW syntax i.e: A4, E7, H1
 * @returns {boolean} True if location is on the board
 */
function locationIsValid(location) {
    let col = location.charAt(0);
    let row = location.substring(1, location.length);

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

/**
 * A function that traces the path from a source to a destination and determines if there are any pieces in the way
 * @param src location in COL_ROW syntax i.e: A4, E7, H1
 * @param dest location in COL_ROW syntax i.e: A4, E7, H1
 * @returns {boolean} True if there are no pieces lying in the path between src and dest
 */
function pathIsOpen(src, dest) {
    let srcCol = src.charAt(0);
    let srcRow = src.charAt(1);
    let destCol = dest.charAt(0);
    let destRow = dest.charAt(1);
    let currCol = srcCol;
    let currRow = srcRow;

    // If this is a diagonal path
    if(srcCol !== destCol && srcRow !== destRow) {

        // Determine direction to traverse
        if(srcCol < destCol) // left-to-right
        {
            if(srcRow > destRow) // top-to-bottom
            {
                currCol = nextCol[currCol];
                for(currRow = --currRow; currRow > destRow; currRow--) {
                    if($(`#${currCol+currRow}`).hasClass("containsPiece")) {
                        return false;
                    }
                    currCol = nextCol[currCol];
                }
            }
            else // bottom-to-top
            {
                currCol = nextCol[currCol];
                for(currRow = ++currRow; currRow < destRow; currRow++) {
                    if($(`#${currCol+currRow}`).hasClass("containsPiece")) {
                        return false;
                    }
                    currCol = nextCol[currCol];
                }
            }
        }
        else // right-to-left
        {
            if(srcRow > destRow) // top-to-bottom
            {
                currCol = prevCol[currCol];
                for(currRow = --currRow; currRow > destRow; currRow--) {
                    if($(`#${currCol+currRow}`).hasClass("containsPiece")) {
                        return false;
                    }
                    currCol = prevCol[currCol];
                }
            }
            else // bottom-to-top
            {
                currCol = prevCol[currCol];
                for(currRow = ++currRow; currRow < destRow; currRow++) {
                    if($(`#${currCol+currRow}`).hasClass("containsPiece")) {
                        return false;
                    }
                    currCol = prevCol[currCol];
                }
            }
        }
    }

    // if this is a vertical path
    else if(srcCol === destCol) {
        // determine the direction to traverse
        if(srcRow < destRow) // bottom-to-top
        {
            for(currRow = ++currRow; currRow < destRow; currRow++) {
                if($(`#${srcCol + currRow}`).hasClass("containsPiece")) {
                    return false;
                }
            }
        }
        else // top-to-bottom
        {
            for(currRow = --currRow; currRow > destRow; currRow--) {
                if($(`#${srcCol + currRow}`).hasClass("containsPiece")) {
                    return false;
                }
            }
        }
    }
    else // this is a horizontal path
    {
        // determine the direction to traverse
        if(srcCol < destCol) // left-to-right
        {
            for(currCol = nextCol[currCol]; currCol < destCol; currCol = nextCol[currCol]) {
                if($(`#${ currCol + srcRow }`).hasClass("containsPiece")) {
                    return false;
                }
            }
        }
        else // right-to-left
        {
            for(currCol = prevCol[currCol]; currCol > destCol; currCol = prevCol[currCol]) {
                if($(`#${ currCol + srcRow }`).hasClass("containsPiece")) {
                    return false;
                }
            }
        }
    }

    return true;
}

/**
 * A high-level function that:
 *      1) Evaluates all potential moves
 *      2) Determines which of those moves are valid based on:
 *          - team
 *          - piece type
 *          - move type (attack or simple move)
 *          - path availability
 * @param location The location of the piece to move
 * @param isFirstMove An optional parameter to allow pawns to move two spaces on their first turn
 * @returns {*[]} An array of valid destination locations in COL_ROW syntax i.e: [A4, E7, H1]
 */
function evaluateValidMoves(location, isFirstMove=false) {

    // find piece
    let pieceAtLocation = $(`#${location} div`);

    // determine which team we are evaluating moves for
    let team = $(pieceAtLocation).hasClass("blackTeam") ? "blackTeam" : "whiteTeam";

    // determine piece type
    let pieceType = pieceAtLocation[0].classList[1];

    // assume all moves are valid (except those with falsy values)
    let potentialMoves = evaluatePotentialMoves(location, pieceType, isFirstMove).filter(Boolean);
    let validMoves = potentialMoves;

    for(let i=0; i < potentialMoves.length; i++) {

        // make sure location is on the board (should always be true)
        if(!locationIsValid(potentialMoves[i])) {
            delete validMoves[i];
            continue;
        }

        // find destination element
        let dest = potentialMoves[i];
        let destElem = $(`#${dest}`);

        // If a destination has own team's piece, invalidate move
        if(destElem.hasClass("containsPiece")) {
            if($(`#${dest} div`).hasClass(team)) {
                delete validMoves[i];
                continue;
            }
        }

        // Pawns can't move backwards (direction depends on team)
        if(pieceType === "pawn") {
            let srcRow = location.charAt(1);
            let destRow = dest.charAt(1);
            if(team === "blackTeam") {
                if(destRow > srcRow) {
                    delete validMoves[i];
                    continue;
                }
            }
            else {
                if(destRow < srcRow) {
                    delete validMoves[i];
                    continue;
                }
            }

            // Pawns also can't move diagonally unless it is an attack
            let srcCol = location.charAt(0);
            let destCol = dest.charAt(0);
            if(srcCol !== destCol) {
                // if destination is empty, invalidate diagonal move
                if(!destElem.hasClass("containsPiece")) {
                    delete validMoves[i];
                    continue;
                }
            }
            // Pawns also can't attack forward
            else {
                // if destination is nonempty, invalidate forward move
                if(destElem.hasClass("containsPiece")) {
                    delete validMoves[i];
                    continue;
                }
            }
        }

        // If there is a piece blocking the path, invalidate move (except knights can jump)
        if(pieceType !== "knight") {
            if(!pathIsOpen(location, potentialMoves[i])) {
                delete validMoves[i];
                continue;
            }
        }
    }

    // return validMoves with any falsy elements removes
    return validMoves.filter(Boolean);
}

/**
 * A utility method to switch on/off the "selected" state of a given square
 * @param location The location of the square in COL_ROW syntax i.e: A4, E7, H1
 */
function toggleSelected(location) {
    let square = $(document.getElementById(location));
    square.toggleClass("selected");
}

/**
 * A utility method to toggle the "validDestination" state of a given square
 * @param location The location of the square in COL_ROW syntax i.e: A4, E7, H1
 */
function toggleValidDestination(location) {
    let square = $(document.getElementById(location));
    square.toggleClass("validDestination");
}

/**
 * A utility method to toggle the "killDestination" state of a given square
 * @param location The location of the square in COL_ROW syntax i.e: A4, E7, H1
 */
function toggleKillDestination(location) {
    let square = $(document.getElementById(location));
    square.toggleClass("killDestination");
}

/**
 * A method to clear any current selections and destinations
 */
function clearSelection() {
    // toggle any currently selected square to unselected
    let selectedSquares = document.getElementsByClassName("selected");
    for(let i=0; i < selectedSquares.length; i) // NOTE: do not increment counter because elements are removed from LIVE collection
    {
        toggleSelected(selectedSquares.item(i).id);
    }

    // toggle off any current destinations
    let currValidDestinations = document.getElementsByClassName("validDestination");
    for(let i=0; i < currValidDestinations.length; i) // NOTE: do not increment counter because elements are removed from LIVE collection
    {
        toggleValidDestination(currValidDestinations.item(i).id);
    }
    let currKillDestinations = document.getElementsByClassName("killDestination");
    for(let i=0; i < currKillDestinations.length; i) // NOTE: do not increment counter because elements are removed from LIVE collection
    {
        toggleKillDestination(currKillDestinations.item(i).id);
    }

    // remove and circle animations
    let circles = document.getElementsByClassName("circle");
    for(let i=0; i < circles.length; i) {
        circles.item(i).remove();
    }

}

function startGame() {
    //$(document.getElementsByClassName("whiteTeam")).parent().addClass("clickablePiece");
    $(document.getElementsByClassName("whiteTeam")).addClass("clickablePiece");
    gameState.start = false;
}

function endTurn() {
    // TODO: check for check/checkmate
    gameState.isBlackTurn = !gameState.isBlackTurn;
    //$(document.getElementsByClassName("blackTeam")).parent().toggleClass("clickablePiece");
    //$(document.getElementsByClassName("whiteTeam")).parent().toggleClass("clickablePiece");
    $(document.getElementsByClassName("blackTeam")).toggleClass("clickablePiece");
    $(document.getElementsByClassName("whiteTeam")).toggleClass("clickablePiece");
}

$(function(){

    let chessboard = $("#chessboard");

    $("#startButton").click(startGame);

    chessboard.on("click",".clickablePiece", function() {

        // clear any current selections and/or destinations
        clearSelection();

        let piece = $(this);
        let location = piece.parent();

        // FIXME: unselecting a piece not working
        // Toggle the new selection to selected
        if(!location.hasClass("selected")) {
            toggleSelected(location[0].id);
        }

        let isPawnsFirstTurn = piece.hasClass("pawn") && piece.data().firstturn;

        // evaluate valid moves for this piece from this location
        let validMoves = evaluateValidMoves(location[0].id, isPawnsFirstTurn);
        for(let i=0; i < validMoves.length; i++) {
            let dest = $(document.getElementById(validMoves[i]));

            // if destination is killshot
            if(dest.hasClass("containsPiece")) {
                dest.addClass("killDestination");
                dest.prepend("<div class=\"circle\" style=\"animation-delay: -3s\"></div>\n" +
                             "<div class=\"circle\" style=\"animation-delay: -2s\"></div>\n" +
                             "<div class=\"circle\" style=\"animation-delay: -1s\"></div>\n");
            }
            else {
                dest.addClass("validDestination");
            }
        }
    });

    chessboard.on("click", ".validDestination", function() {
        // TODO: set first turn to false for pawns
        let currSelected = document.getElementsByClassName("selected");
        movePiece(currSelected.item(0).id, this.id);
        clearSelection();
    });

    chessboard.on("click", ".killDestination", function() {
        let currSelected = document.getElementsByClassName("selected");
    });

});