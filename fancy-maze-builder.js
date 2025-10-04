class FancyMazeBuilder extends MazeBuilder {

  // Original JavaScript code by Chirp Internet: www.chirpinternet.eu
  // Please acknowledge use of this code by including this header.

  constructor(width, height) {

    super(width, height);

    this.removeNubbins();
    this.joinNubbins();
    this.placeSentinels(100);
    this.placeKey();

  }

  isA(value, ...cells) {
    return cells.every((array) => {
      let row, col;
      [row, col] = array;
      if((this.maze[row][col].length == 0) || !this.maze[row][col].includes(value)) {
        return false;
      }
      return true;
    });
  }

  removeNubbins() {

    const nubbinPositions = [];

    this.maze.slice(2, -2).forEach((row, idx) => {

      let r = idx + 2;

      row.slice(2, -2).forEach((cell, idx) => {

        let c = idx + 2;

        if(!this.isA("wall", [r, c])) {
          return;
        }

        if(this.isA("wall", [r-1, c-1], [r-1, c], [r-1, c+1], [r+1, c]) && this.isGap([r+1, c-1], [r+1, c+1], [r+2, c])) {
          this.maze[r][c] = [];
          this.maze[r+1][c] = ["nubbin"];
          nubbinPositions.push([r+1, c]);
        }

        if(this.isA("wall", [r-1, c+1], [r, c-1], [r, c+1], [r+1, c+1]) && this.isGap([r-1, c-1], [r, c-2], [r+1, c-1])) {
          this.maze[r][c] = [];
          this.maze[r][c-1] = ["nubbin"];
          nubbinPositions.push([r, c-1]);
        }

        if(this.isA("wall", [r-1, c-1], [r, c-1], [r+1, c-1], [r, c+1]) && this.isGap([r-1, c+1], [r, c+2], [r+1, c+1])) {
          this.maze[r][c] = [];
          this.maze[r][c+1] = ["nubbin"];
          nubbinPositions.push([r, c+1]);
        }

        if(this.isA("wall", [r-1, c], [r+1, c-1], [r+1, c], [r+1, c+1]) && this.isGap([r-1, c-1], [r-2, c], [r-1, c+1])) {
          this.maze[r][c] = [];
          this.maze[r-1][c] = ["nubbin"];
          nubbinPositions.push([r-1, c]);
        }

      });

    });

    // Guarantee at least 5 nubbins
    const minNubbins = 5;
    if(nubbinPositions.length < minNubbins) {
      // Find empty spaces to add more nubbins
      const emptySpaces = [];
      this.maze.slice(1, -1).forEach((row, idx) => {
        let r = idx + 1;
        row.slice(1, -1).forEach((cell, idx) => {
          let c = idx + 1;
          if(cell.length === 0) {
            emptySpaces.push([r, c]);
          }
        });
      });

      // Add random nubbins until we have at least 5
      while(nubbinPositions.length < minNubbins && emptySpaces.length > 0) {
        const randomIdx = this.rand(0, emptySpaces.length - 1);
        const [r, c] = emptySpaces[randomIdx];
        this.maze[r][c] = ["nubbin"];
        nubbinPositions.push([r, c]);
        emptySpaces.splice(randomIdx, 1);
      }
    }

    console.log("Total nubbins placed:", nubbinPositions.length);

  }

  joinNubbins() {

    this.maze.slice(2, -2).forEach((row, idx) => {

      let r = idx + 2;

      row.slice(2, -2).forEach((cell, idx) => {

        let c = idx + 2;

        if(!this.isA("nubbin", [r, c])) {
          return;
        }

        if(this.isA("nubbin", [r-2, c])) {
          this.maze[r-2][c].push("wall");
          this.maze[r-1][c] = ["nubbin", "wall"];
          this.maze[r][c].push("wall");
        }

        if(this.isA("nubbin", [r, c-2])) {
          this.maze[r][c-2].push("wall");
          this.maze[r][c-1] = ["nubbin", "wall"];
          this.maze[r][c].push("wall");
        }

      });

    });

  }

  placeSentinels(percent = 100) {

    percent = parseInt(percent, 10);

    if((percent < 1) || (percent > 100)) {
      percent = 100;
    }

    const allValidLocations = [];

    // Collect all valid locations
    this.maze.slice(1, -1).forEach((row, idx) => {
      let r = idx + 1;
      row.slice(1, -1).forEach((cell, idx) => {
        let c = idx + 1;

        if(!this.isA("wall", [r,c])) {
          return;
        }

        if(this.isA("wall", [r-1,c-1],[r-1,c],[r-1,c+1],[r+1,c-1],[r+1,c],[r+1,c+1])) {
          allValidLocations.push({r, c});
        } else if(this.isA("wall", [r-1,c-1],[r,c-1],[r+1,c-1],[r-1,c+1],[r,c+1],[r+1,c+1])) {
          allValidLocations.push({r, c});
        }
      });
    });

    console.log("Valid sentinel locations:", allValidLocations.length);

    // Shuffle array using Fisher-Yates
    for (let i = allValidLocations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allValidLocations[i], allValidLocations[j]] = [allValidLocations[j], allValidLocations[i]];
    }

    // Place at least 3 sentinels from the shuffled array
    const minSentinels = 3;
    const guaranteedCount = Math.min(minSentinels, allValidLocations.length);
    
    for(let i = 0; i < guaranteedCount; i++) {
      const loc = allValidLocations[i];
      this.maze[loc.r][loc.c].push("sentinel");
    }

    // Then add more randomly based on percentage (starting after guaranteed ones)
    for(let i = guaranteedCount; i < allValidLocations.length; i++) {
      const loc = allValidLocations[i];
      if(Math.random() * 100 <= percent) {
        this.maze[loc.r][loc.c].push("sentinel");
      }
    }

    // Count total sentinels placed
    let totalSentinels = 0;
    this.maze.forEach(row => {
      row.forEach(cell => {
        if(cell.includes && cell.includes("sentinel")) {
          totalSentinels++;
        }
      });
    });

    console.log("Total sentinels placed:", totalSentinels);
  }

  placeKey() {

    let fr, fc;
    [fr, fc] = this.getKeyLocation();

    if(this.isA("nubbin", [fr-1,fc-1]) && !this.isA("wall", [fr-1,fc-1])) {
      this.maze[fr-1][fc-1] = ["key"];
    } else if(this.isA("nubbin", [fr-1,fc+1]) && !this.isA("wall", [fr-1,fc+1])) {
      this.maze[fr-1][fc+1] = ["key"];
    } else if(this.isA("nubbin", [fr+1,fc-1]) && !this.isA("wall", [fr+1,fc-1])) {
      this.maze[fr+1][fc-1] = ["key"];
    } else if(this.isA("nubbin", [fr+1,fc+1]) && !this.isA("wall", [fr+1,fc+1])) {
      this.maze[fr+1][fc+1] = ["key"];
    } else {
      this.maze[fr][fc] = ["key"];
    }

  }

}