//Odd rows are shifted!
class GridBaseState {
    constructor(gridObject) {
        this.gridObject = gridObject;
    }
    isReady() {
        return true;
    }
    update() {
        for(var r=0; r<this.gridObject.rows; r++) {
            for(var c=0; c<this.gridObject.columns; c++) {
                if(this.gridObject.grid[r][c] != null) {
                    this.gridObject.grid[r][c] = this.gridObject.grid[r][c].update();
                }
            }
        }
        return this;
    }
    render() {
        strokeWeight(4);
        stroke(0);
        var gWidth = this.gridObject.bubbleRadius * this.gridObject.columns * 2 + this.gridObject.bubbleRadius;
        var gHeight = this.gridObject.bubbleRadius * this.gridObject.rows * 2;
        fill(Koji.config.gameGraphics.gridColor);
        rect(this.gridObject.origin[0],this.gridObject.origin[1],gWidth,gHeight,10);
        strokeWeight(0);
        if(gameData.data.gridBG != null) {
            image(gameData.data.gridBG,this.gridObject.origin[0],this.gridObject.origin[1],gWidth,gHeight);
        }
        for(var r=0; r<this.gridObject.rows; r++) {
            for(var c=0; c<this.gridObject.columns; c++) {
                if(this.gridObject.grid[r][c] != null) {
                    //this.grid[r][c].render(this.origin);
                    this.gridObject.grid[r][c].render(this.gridObject.origin);
                }
            }
        }
        var y = this.gridObject.origin[1]+gHeight - this.gridObject.yOffset * (this.gridObject.rows-1) - this.gridObject.bubbleRadius;
        fill(0);
        rect(this.gridObject.origin[0],y,gWidth,this.gridObject.origin[1]+gHeight-y,0,0,10,10);
    }
}

//remove matches
class MatchGridState extends GridBaseState {
    constructor(gridObject,cell) {
        super(gridObject);
        this.cell = cell;
        var pointsPerBubble = parseInt(Koji.config.gameSettings.bubblePoints);
        this.matches = Array.from(this.gridObject.getMatches(cell));
        if(this.matches.length < 3) {
            this.matches = [];
        }
        for(var f in this.matches) {
            var flatCell = this.matches[f];
            var cell = [Math.floor(flatCell/this.gridObject.columns),flatCell%this.gridObject.columns];
            this.matches[f] = this.gridObject.grid[cell[0]][cell[1]];
            this.matches[f].setMatchState((parseInt(f)+1)*pointsPerBubble);
            this.gridObject.removeBubbleFromCount(this.gridObject.grid[cell[0]][cell[1]]);
            this.gridObject.grid[cell[0]][cell[1]] = null;
        }
        var tempFloaters = this.gridObject.getFloaters();
        this.floaters = [];
        for(var f in tempFloaters) {
            var bubble = this.gridObject.grid[tempFloaters[f][0]][tempFloaters[f][1]];
            if(bubble != null) {
                bubble.setMoveState(createVector(0,1),this.gridObject.bubbleRadius*40);
                this.floaters.push(bubble);
                this.gridObject.removeBubbleFromCount(bubble);
                this.gridObject.grid[tempFloaters[f][0]][tempFloaters[f][1]] = null;
            }
        }

    }
    isReady() {
        return false;
    }
    update() {
        if(this.matches.length==0 && this.floaters.length==0) {
            return new GridBaseState(this.gridObject);
        }
        super.update();
        var tempMatches = [];
        for(var m in this.matches) {
            if(this.matches[m].update() != null) {
                tempMatches.push(this.matches[m]);
            }
        }
        this.matches = tempMatches;
        var tempFloaters = [];
        for(var f in this.floaters) {
            if(this.floaters[f].update() != null && this.floaters[f].position.y < this.gridObject.bubbleRadius*2*this.gridObject.rows) {
                tempFloaters.push(this.floaters[f]);
            }
        }
        this.floaters = tempFloaters;
        return this;
    }
    render() {
        super.render();
        for(var m in this.matches) {
            this.matches[m].render(this.gridObject.origin);
        }
        for(var f in this.floaters) {
            this.floaters[f].render(this.gridObject.origin);
        }
    }
}

//-----------------------------

class BubbleGrid {
    constructor(rows,columns,origin,bubbleRadius,bubbleFactory) {
        this.rows = rows;
        this.columns = columns;
        this.origin = origin;
        this.bubbleRadius = bubbleRadius;
        this.bubbleFactory = bubbleFactory;
        this.colorCount = {};

        this.isOddShifted = true;
        this.yOffset = Math.floor(dist(0,bubbleRadius*2,bubbleRadius,0)-this.bubbleRadius*2);
        this.yOffset = this.yOffset % 2 == 0 ? this.yOffset : this.yOffset+1;

        //create grid
        this.grid = [];
        for(var r=0; r<this.rows; r++){
            var temp = [];
            for(var c=0; c<this.columns; c++){
                temp.push(null);
            }
            this.grid.push(temp);
        }

        this.state = new GridBaseState(this);
        this.overflow = false;
    }
    checkOverflow() {
        for(var c=0; c<this.columns; c++) {
            if(this.grid[this.rows-1][c] != null) {
                this.overflow = true;
            }
        }
    }
    addBubbleToCount(bubble) {
        if(bubble.colors[0] in this.colorCount) {
            this.colorCount[bubble.colors[0]] += 1;
        }
        else {
            this.colorCount[bubble.colors[0]] = 1;
        }
    }
    removeBubbleFromCount(bubble) {
        this.colorCount[bubble.colors[0]] -= 1;
    }
    getCurrentColors() {
        var colors = [];
        var keys = Object.keys(this.colorCount);
        for(var k in keys) {
            if(this.colorCount[keys[k]] > 0) {
                colors.push(parseInt(keys[k]));
            }
        }
        return colors;
    }
    isReady() {
        return this.state.isReady();
    }
    isEmpty() {
        for(var c=0; c<this.columns; c++) {
            if(this.grid[0][c] != null) {
                return false;
            }
        }
        return true;
    }
    setMatchState(cell) {
        this.state = new MatchGridState(this,cell);
    }
    getXOffset(row) {
        if(row%2==0) {
            if(this.isOddShifted) {
                return 0;
            }
            else {
                return this.bubbleRadius;
            }
        }
        else {
            if(this.isOddShifted) {
                return this.bubbleRadius;
            }
            else {
                return 0;
            }
        }
    }
    //pixelCoords - [x, y]
    getCellFromPixel(pixelCoords, adjustForOrigin=false) {
        if(adjustForOrigin) {
            pixelCoords = [pixelCoords[0]-this.origin[0],pixelCoords[1]-this.origin[1]];
        }
        var minDistance = Infinity;
        var cell = [-1,-1];
        for(var r=0; r<this.rows; r++) {
            for(var c=0; c<this.columns; c++) {
                var xOffset = this.getXOffset(r);
                var cellCenter = [c*this.bubbleRadius*2+this.bubbleRadius+xOffset, r*this.bubbleRadius*2+this.bubbleRadius-this.yOffset*r];
                var distance = dist(pixelCoords[0],pixelCoords[1],cellCenter[0],cellCenter[1]);
                if(distance < minDistance) {
                    minDistance = distance;
                    cell = [r,c];
                }
            }
        }
        return cell;
    }
    //cell - [row,col]
    getPixelFromCell(cell,adjustForOrigin=false) {
        var xOffset = this.getXOffset(cell[0]);
        var px = [cell[0]*this.bubbleRadius*2+this.bubbleRadius+xOffset,cell[1]*this.bubbleRadius*2+this.bubbleRadius];
        if(adjustForOrigin) {
            px = [px[0]+this.origin[0],px[1]+this.origin[1]];
        }
        return px;
    }
    //cell - [row,col]
    getNeighbors(cell) {
        function checkBounds(row, col, grid) {
            var rowCheck = row >= 0 && row < grid.length;
            var colCheck = col >= 0 && col < grid[0].length;
            return rowCheck && colCheck;
        }
        var row = cell[0];
        var col = cell[1];
        var neighborIndices = [];
        var offsetNeighbors = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[0,-1]];
        var normalNeighbors = [[-1,-1],[-1,0],[0,1],[1,0],[1,-1],[0,-1]];

        var offsets = this.getXOffset(row) != 0 ? offsetNeighbors : normalNeighbors;
        for(var i in offsets) {
            var cellRow = row+offsets[i][0];
            var cellCol = col+offsets[i][1];
            if(checkBounds(cellRow, cellCol, this.grid)) {
                neighborIndices.push([cellRow, cellCol]);
            }
        }
        return(neighborIndices);
    }
    //position - position of a bubble center
    checkCollision(position) {
        var cell = this.getCellFromPixel(position, true);
        var neighbors = this.getNeighbors(cell);
        var px = [position[0]-this.origin[0],position[1]-this.origin[1]];
        for(var n in neighbors) {
            var bubble = this.grid[neighbors[n][0]][neighbors[n][1]];
            if(bubble != null) {
                var distance = dist(px[0],px[1],bubble.position.x,bubble.position.y);
                if(distance < this.bubbleRadius*2) {
                    return true;
                }
            }
        }
        return false;
    }
    addRow() {
        //check if game over
        this.checkOverflow();
        this.isOddShifted = !this.isOddShifted;
        //create a new row
        var temp = [];
        for(var r=0; r<this.columns; r++) {
            var pos = createVector(r*this.bubbleRadius*2+this.bubbleRadius+this.getXOffset(0),this.bubbleRadius);
            var bubble = this.bubbleFactory.getBubble(pos);
            temp.push(bubble);
            this.addBubbleToCount(bubble);
        }
        //add the new row to the grid
        this.grid.unshift(temp);
        //remove the old "last" row from the grid (shifting each row down 1)
        this.grid.pop();
        //reset cell positions to account for rows needing to be shifted
        this.resetCellPositions();
    }
    resetCellPositions() {
        for(var r=0; r<this.rows; r++) {
            for(var c=0; c<this.columns; c++) {
                var xOffset = this.getXOffset(r);
                var pos = createVector(c*this.bubbleRadius*2+this.bubbleRadius+xOffset,r*this.bubbleRadius*2+this.bubbleRadius-this.yOffset*r);
                if(this.grid[r][c] != null) {
                    this.grid[r][c].position = pos;
                }
            }
        }
    }
    getMatches(cell) {
        function compareCells(cell1Index, cell2Index, grid) {
            const cell1 = grid[cell1Index[0]][cell1Index[1]];
            const cell2 = grid[cell2Index[0]][cell2Index[1]];
            if(cell1 == null || cell2 == null) {
                return(cell1 == cell2);
            }
            var cell1Colors = cell1.colors;
            var cell2Colors = new Set(cell2.colors);
            var match = cell1Colors.filter(c => cell2Colors.has(c)).length > 0;
            return match;
        }
        var row = cell[0];
        var col = cell[1];
        //change to color of current cell
        const colors = this.grid[row][col].colors;
        var colorMatches = new Set([]);
        for(var c in colors) {
            var color = colors[c];
            colorMatches[color] = [];
            var toCheck = [[row, col]];
            var checkedCells = new Set([]);
            while(toCheck.length > 0) {
                var targetIndex = toCheck.pop();
                var flatIndex = targetIndex[0] * this.columns + targetIndex[1];
                if(!checkedCells.has(flatIndex)) {
                    if(compareCells(targetIndex, [row,col], this.grid)) {
                        colorMatches.add(flatIndex);
                        var neighbors = this.getNeighbors(targetIndex);
                        for(var n in neighbors) {
                            toCheck.push(neighbors[n]);
                        }
                    }
                    checkedCells.add(flatIndex);
                }
            }
        }
        return colorMatches;
    }
    getFloaters() {
        var bubbleCells = new Set();
        var toCheck = [];
        for(var n in this.grid[0]) {
            if(this.grid[0][n] != null) {
                toCheck.push(parseInt(n));
            }
        }
        while(toCheck.length > 0) {
            var currentCell = toCheck.pop();
            var index = [Math.floor(currentCell/this.columns),currentCell%this.columns];
            bubbleCells.add(currentCell);
            var neighbors = this.getNeighbors(index);
            for(var n in neighbors) {
                var i = neighbors[n];
                var f = i[0]*this.columns+i[1];
                if(this.grid[i[0]][i[1]] != null) {
                    if(!bubbleCells.has(f)) {
                        toCheck.push(f);
                    }
                    bubbleCells.add(f);
                }
            }
        }
        var floaters = [];
        for(var r=0; r<this.rows; r++) {
            for(var c=0; c<this.columns; c++) {
                var flatIndex = parseInt(r)*this.columns+parseInt(c);
                if(!bubbleCells.has(flatIndex) && this.grid[r][c] != null) {
                    floaters.push([r,c]);
                }
            }
        }
        return floaters;
    }
    update() {
        this.state = this.state.update();
    }
    render() {
        this.state.render();
    }
    print() {
        console.log("-----------------");
        for(var r=0; r<this.rows; r++) {
            var row = "";
            for(var c=0; c<this.columns; c++) {
                row += (this.grid[r][c] == null ? "x" : this.grid[r][c].colors[0]) + " ";
            }
            console.log(row + "\n");
        }
        console.log("-----------------");
    }
}