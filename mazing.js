var Position = function(x, y) {
  this.x = x;
  this.y = y;
}

Position.prototype.toString = function() {
  return this.x + ":" + this.y;
};

var Mazing = function(id) {

  // Original JavaScript code by Chirp Internet: www.chirpinternet.eu
  // Please acknowledge use of this code by including this header.

  /* bind to HTML element */

  this.mazeContainer = document.getElementById(id);

  this.mazeScore = document.createElement("div");
  this.mazeScore.id = "maze_score";

  this.mazeMessage = document.createElement("div");
  this.mazeMessage.id = "maze_message";

  this.heroScore = parseInt(this.mazeContainer.getAttribute("data-steps"), 10) + 20;

  this.maze = [];
  this.heroPos = {};
  this.heroHasKey = false;
  this.childMode = false;

  this.utter = null;

  for(i=0; i < this.mazeContainer.children.length; i++) {
    for(j=0; j < this.mazeContainer.children[i].children.length; j++) {
      var el =  this.mazeContainer.children[i].children[j];
      this.maze[new Position(i, j)] = el;
      if(el.classList.contains("entrance")) {
        /* place hero on entrance square */
        this.heroPos = new Position(i, j);
        this.maze[this.heroPos].classList.add("hero");
      }
    }
  }

  var mazeOutputDiv = document.createElement("div");
  mazeOutputDiv.id = "maze_output";

  mazeOutputDiv.appendChild(this.mazeScore);
  mazeOutputDiv.appendChild(this.mazeMessage);

  mazeOutputDiv.style.width = this.mazeContainer.scrollWidth + "px";
  this.setMessage("Find the letter!");

  this.mazeContainer.insertAdjacentElement("afterend", mazeOutputDiv);


  this.keyPressHandler = this.mazeKeyPressHandler.bind(this);
  document.addEventListener("keydown", this.keyPressHandler, false);

  // Add mobile controls
  this.createMobileControls();

};

Mazing.prototype.createMobileControls = function() {
  const controlsDiv = document.createElement("div");
  controlsDiv.id = "mobile-controls";
  controlsDiv.innerHTML = `
    <button id="btn-up">▲</button>
    <button id="btn-left">◄</button>
    <button id="btn-down">▼</button>
    <button id="btn-right">►</button>
  `;
  
  document.body.appendChild(controlsDiv);
  
  // Add click handlers
  document.getElementById("btn-up").addEventListener("click", () => {
    this.handleMove("ArrowUp");
  });
  
  document.getElementById("btn-left").addEventListener("click", () => {
    this.handleMove("ArrowLeft");
  });
  
  document.getElementById("btn-down").addEventListener("click", () => {
    this.handleMove("ArrowDown");
  });
  
  document.getElementById("btn-right").addEventListener("click", () => {
    this.handleMove("ArrowRight");
  });
};

Mazing.prototype.handleMove = function(direction) {
  var tryPos = new Position(this.heroPos.x, this.heroPos.y);

  switch(direction) {
    case "ArrowLeft":
      this.mazeContainer.classList.remove("face-right");
      tryPos.y--;
      break;
    case "ArrowUp":
      tryPos.x--;
      break;
    case "ArrowRight":
      this.mazeContainer.classList.add("face-right");
      tryPos.y++;
      break;
    case "ArrowDown":
      tryPos.x++;
      break;
    default:
      return;
  }

  this.tryMoveHero(tryPos);
};

Mazing.prototype.enableSpeech = function() {
  this.utter = new SpeechSynthesisUtterance()
  this.setMessage(this.mazeMessage.innerText);
};

Mazing.prototype.setMessage = function(text) {

  /* display message on screen */
  this.mazeMessage.innerHTML = text;
  this.mazeScore.innerHTML = this.heroScore;

  if(this.utter && text.match(/^\w/)) {
    /* speak message aloud */
    this.utter.text = text;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(this.utter);
  }

};

Mazing.prototype.heroTakeTreasure = function() {
  this.maze[this.heroPos].classList.remove("nubbin");
  this.heroScore += 10;
  this.setMessage("Yay, Snoopy!");
};

Mazing.prototype.heroTakeKey = function() {
  this.maze[this.heroPos].classList.remove("key");
  this.heroHasKey = true;
  this.heroScore += 20;
  this.mazeScore.classList.add("has-key");
  this.maze[this.heroPos].classList.add("hero-with-key");
  this.setMessage("You found the letter!");
};

Mazing.prototype.gameOver = function(text) {
  /* de-activate control keys */
  document.removeEventListener("keydown", this.keyPressHandler, false);
  
  // Hide the entire maze container completely
  this.mazeContainer.style.display = "none";
  
  // Hide the maze output (score/message)
  const mazeOutput = document.getElementById("maze_output");
  if(mazeOutput) {
    mazeOutput.style.display = "none";
  }
  
  // Hide mobile controls
  const mobileControls = document.getElementById("mobile-controls");
  if(mobileControls) {
    mobileControls.style.display = "none";
  }
  
  // Create a full-screen game over message
  const gameOverDiv = document.createElement("div");
  gameOverDiv.id = "game_over_screen";
  gameOverDiv.textContent = text || "Sorry, you were too slow...";
  document.body.appendChild(gameOverDiv);
};

Mazing.prototype.heroWins = function() {
  this.mazeScore.classList.remove("has-key");
  this.maze[this.heroPos].classList.remove("door");
  this.heroScore += 50;
  document.removeEventListener("keydown", this.keyPressHandler, false);
  
  // Hide mobile controls when winning
  const mobileControls = document.getElementById("mobile-controls");
  if(mobileControls) {
    mobileControls.style.display = "none";
  }
  
  this.createDialogueScreen();
};

Mazing.prototype.createDialogueScreen = function() {
  const mazeElement = document.getElementById("maze");
  
  const mazeOutput = document.getElementById("maze_output");
  if(mazeOutput) {
    mazeOutput.style.display = "none";
  }
  const dialogueDiv = document.createElement("div");
  dialogueDiv.id = "dialogue_screen";
  dialogueDiv.innerHTML = `
    <div class="character-row">
      <div class="character character-left">
        <img src="jessica-happy.png" alt="Jessica">
      </div>
      <div class="character character-right">
        <img src="tk-happy.png" alt="TK">
      </div>
    </div>
    <div class="dialogue-box">
      <p class="dialogue-text"></p>
      <button class="dialogue-next">Next</button>
    </div>
  `;
  
  mazeElement.appendChild(dialogueDiv);
  
  // Dialogue sequence
  this.dialogueSequence = [
    { speaker: "You", text: "I found the letter!" },
    { speaker: "Jessica", text: "YAY you're the best!" },
    { speaker: "You", text: "What is this anyway?" },
    { speaker: "Jessica", text: "Well, it's for you..." }
  ];
  
  this.currentDialogue = 0;
  this.showDialogue();
  
  // Set up next button
  dialogueDiv.querySelector(".dialogue-next").addEventListener("click", () => {
    this.currentDialogue++;
    if (this.currentDialogue < this.dialogueSequence.length) {
      this.showDialogue();
    } else {
      this.endGame();
    }
  });
};

Mazing.prototype.showDialogue = function() {
  const dialogue = this.dialogueSequence[this.currentDialogue];
  const textElement = document.querySelector(".dialogue-text");
  textElement.textContent = `${dialogue.speaker}: ${dialogue.text}`;
  
  // Highlight speaking character
  document.querySelectorAll(".character").forEach(el => el.classList.remove("speaking"));
  if (dialogue.speaker === "You") {
    document.querySelector(".character-right").classList.add("speaking");
  } else {
    document.querySelector(".character-left").classList.add("speaking");
  }
};

Mazing.prototype.endGame = function() {
  const dialogueScreen = document.querySelector("#dialogue_screen");
  
  // Change background to white
  dialogueScreen.style.background = "white";
  
  // Replace content
  dialogueScreen.innerHTML = `
    <div id="letter">
      <img src="me.jpg" alt="Picture" class="letter-image">
      <h1>Happy Boyfriend Day!</h1>
      <p>Thank you for being the best boyfriend ever and always being so understanding and patient when I'm being a butt. 
      I'm so grateful to have you as my number one supporter, even when I'm studying every second of the day and don't have much time to talk.
      I hate that we have to be long distance, but since it's with you, I really believe we will be justttt fine.
      I really really appreciate all the love you give me hehe I love you a lot and am very excited to see you soon</p>
      <h1>- Jessica</h1>
    </div>
  `;
};

Mazing.prototype.tryMoveHero = function(pos) {

  if("object" !== typeof this.maze[pos]) {
    return;
  }

  var nextStep = this.maze[pos].className;

  /* before moving */

  if(nextStep.match(/sentinel/)) {
    /* ran into a moster - lose points */
    this.heroScore = Math.max(this.heroScore - 50, 0);

    if(!this.childMode && (this.heroScore <= 0)) {
      /* game over */
      this.gameOver("");
    } else {
      this.setMessage("HEY, WHY ARE YOU WITH ANOTHER GIRL!");
    }

    return;
  }

  if(nextStep.match(/wall/)) {
    return;
  }

  if(nextStep.match(/exit/)) {
    if(this.heroHasKey) {
      this.heroWins();
    } else {
      this.setMessage("You haven't found the letter yet!");
      return;
    }
  }

  /* move hero one step */

 this.maze[this.heroPos].classList.remove("hero");
// If hero has key, also remove the hero-with-key class from old position
if(this.heroHasKey) {
  this.maze[this.heroPos].classList.remove("hero-with-key");
}

this.maze[pos].classList.add("hero");
// If hero has key, also add the hero-with-key class to new position
if(this.heroHasKey) {
  this.maze[pos].classList.add("hero-with-key");
}
  this.heroPos = pos;

  /* check what was stepped on */

  if(nextStep.match(/nubbin/)) {
    this.heroTakeTreasure();
    return;
  }

  if(nextStep.match(/key/)) {
    this.heroTakeKey();
    return;
  }

  if(nextStep.match(/exit/)) {
    return;
  }

  if((this.heroScore >= 1) && !this.childMode) {

    this.heroScore--;

    if(this.heroScore <= 0) {
      /* game over */
      this.gameOver("Sorry, you were too slow...");
      return;
    }

  }

  this.setMessage("...");

};

Mazing.prototype.mazeKeyPressHandler = function(e) {
  this.handleMove(e.key);
  e.preventDefault();
};

Mazing.prototype.setChildMode = function() {
  this.childMode = true;
  this.heroScore = 0;
  this.setMessage("Collect all the snoopys!");
};