// Modelo do jogo
class GameModel {
  constructor() {
    this.playerScore = 0;
    this.round = 1;
    this.maxRounds = 10;
    this.playerCard = null;
    this.iaCard = null;
    this.gameState = "waiting"; // waiting, comparing, roundEnd, gameEnd
  }

  getRandomCard() {
    const cards = [
      {
        title: "Ação Tech",
        value: 1000,
        icon: "📈",
        rentabilidade: 15,
        risco: "Alto",
        liquidez: "Alta",
      },
      {
        title: "CDB",
        value: 1000,
        icon: "🏦",
        rentabilidade: 8,
        risco: "Baixo",
        liquidez: "Média",
      },
      {
        title: "Tesouro Direto",
        value: 1000,
        icon: "💰",
        rentabilidade: 6,
        risco: "Baixo",
        liquidez: "Baixa",
      },
    ];
    return cards[Math.floor(Math.random() * cards.length)];
  }

  compareAttributes(attribute) {
    const playerValue = this.playerCard[attribute];
    const iaValue = this.iaCard[attribute];

    if (attribute === "rentabilidade" || attribute === "liquidez") {
      return playerValue > iaValue
        ? "win"
        : playerValue < iaValue
        ? "lose"
        : "draw";
    } else if (attribute === "risco") {
      const riskOrder = { "Muito Alto": 0, Alto: 1, Médio: 2, Baixo: 3 };
      return riskOrder[playerValue] < riskOrder[iaValue]
        ? "win"
        : riskOrder[playerValue] > riskOrder[iaValue]
        ? "lose"
        : "draw";
    }
  }

  updateScore(result) {
    if (result === "win") {
      this.playerScore++;
    }
  }

  nextRound() {
    this.round++;
    if (this.round > this.maxRounds) {
      this.gameState = "gameEnd";
    } else {
      this.gameState = "waiting";
      this.dealCards();
    }
  }

  dealCards() {
    this.playerCard = this.getRandomCard();
    this.iaCard = this.getRandomCard();
  }

  startGame() {
    this.playerScore = 0;
    this.round = 1;
    this.gameState = "waiting";
    this.dealCards();
  }
}

// Visualização do jogo
class GameView {
  constructor() {
    this.playerCardElement = document.querySelector(".card:first-child");
    this.iaCardElement = document.querySelector(".card:last-child");
    this.gameStatus = document.querySelector(".game-status");
    this.roundInfo = document.querySelector(".round-info");
    this.scoreElement = document.querySelector(".player-stats .score");
    this.attributeButtons = document.querySelectorAll(".attribute-button");
    this.resultMessage = document.querySelector(".result-message");
    this.progressBar = document.getElementById("progressBar");
    this.helpButton = document.querySelector(".help-button");
    this.tutorialOverlay = document.getElementById("tutorialOverlay");
    this.prevButton = document.getElementById("prevStep");
    this.nextButton = document.getElementById("nextStep");
    this.startButton = document.getElementById("startGame");
    this.tutorialSteps = document.querySelectorAll(".tutorial-step");
    this.currentStep = 0;
  }

  updateCards(playerCard, iaCard) {
    this.updateCard(this.playerCardElement, playerCard);
    this.updateCard(this.iaCardElement, iaCard);
  }

  updateCard(cardElement, card) {
    if (!cardElement || !card) return;

    cardElement.querySelector(".card-value").textContent = `R$ ${card.value}`;
    cardElement.querySelector(".card-icon").textContent = card.icon;
    cardElement.querySelector(".card-title").textContent = card.title;

    const attributes = cardElement.querySelectorAll(".attribute");
    attributes[0].querySelector(
      ".attribute-value"
    ).textContent = `${card.rentabilidade}%`;
    attributes[1].querySelector(".attribute-value").textContent = card.risco;
    attributes[2].querySelector(".attribute-value").textContent = card.liquidez;
  }

  updateGameStatus(message) {
    this.gameStatus.textContent = message;
  }

  updateRoundInfo(round, score) {
    this.roundInfo.innerHTML = `
      <div>Rodada: <span class="score">${round}/10</span></div>
      <div>Vitórias: <span class="score">${score}</span></div>
    `;
  }

  updateScore(score) {
    this.scoreElement.textContent = `Pontos: ${score}`;
  }

  updateProgress(percentage) {
    this.progressBar.style.width = `${percentage}%`;
  }

  showResultMessage(result, attribute) {
    if (!this.resultMessage) return;

    const messages = {
      win: {
        rentabilidade: "Sua rentabilidade é maior!",
        risco: "Seu risco é menor!",
        liquidez: "Sua liquidez é maior!",
      },
      lose: {
        rentabilidade: "Sua rentabilidade é menor!",
        risco: "Seu risco é maior!",
        liquidez: "Sua liquidez é menor!",
      },
      draw: {
        rentabilidade: "Rentabilidade igual!",
        risco: "Risco igual!",
        liquidez: "Liquidez igual!",
      },
    };

    this.resultMessage.textContent = messages[result][attribute];
    this.resultMessage.className = `result-message ${result} show`;

    setTimeout(() => {
      this.resultMessage.classList.remove("show");
    }, 2000);
  }

  highlightAttribute(attribute, result) {
    const attributeIndex = ["rentabilidade", "risco", "liquidez"].indexOf(
      attribute
    );
    const playerValue =
      this.playerCardElement.querySelectorAll(".attribute-value")[
        attributeIndex
      ];
    const iaValue =
      this.iaCardElement.querySelectorAll(".attribute-value")[attributeIndex];

    playerValue.classList.add(
      result === "win"
        ? "highlight-win"
        : result === "lose"
        ? "highlight-lose"
        : "highlight-draw"
    );
    iaValue.classList.add(
      result === "win"
        ? "highlight-lose"
        : result === "lose"
        ? "highlight-win"
        : "highlight-draw"
    );

    this.playerCardElement.classList.add(result);
    this.iaCardElement.classList.add(
      result === "win" ? "lose" : result === "lose" ? "win" : "draw"
    );

    this.showResultMessage(result, attribute);
  }

  removeHighlights() {
    document.querySelectorAll(".attribute-value").forEach((el) => {
      el.classList.remove("highlight-win", "highlight-lose", "highlight-draw");
    });
    this.playerCardElement.classList.remove("win", "lose", "draw");
    this.iaCardElement.classList.remove("win", "lose", "draw");
  }

  showTutorial() {
    this.tutorialOverlay.style.display = "flex";
    this.currentStep = 0;
    this.showTutorialStep(this.currentStep);
  }

  showTutorialStep(step) {
    this.tutorialSteps.forEach((s, index) => {
      s.classList.toggle("active", index === step);
    });

    this.prevButton.style.display = step === 0 ? "none" : "block";
    this.nextButton.style.display =
      step === this.tutorialSteps.length - 1 ? "none" : "block";
    this.startButton.style.display =
      step === this.tutorialSteps.length - 1 ? "block" : "none";
  }

  prevTutorialStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.showTutorialStep(this.currentStep);
    }
  }

  nextTutorialStep() {
    if (this.currentStep < this.tutorialSteps.length - 1) {
      this.currentStep++;
      this.showTutorialStep(this.currentStep);
    }
  }
}

// Controlador do jogo
class GameController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.view.controller = this;

    this.initializeEventListeners();
    this.startGame();
  }

  initializeEventListeners() {
    // Botões de atributo
    this.view.attributeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const attribute = button.getAttribute("data-attribute");
        this.handleAttributeSelection(attribute);
      });
    });

    // Botão de ajuda
    this.view.helpButton.addEventListener("click", () => {
      this.view.showTutorial();
    });

    // Botões do tutorial
    this.view.prevButton.addEventListener("click", () => {
      this.view.prevTutorialStep();
    });

    this.view.nextButton.addEventListener("click", () => {
      this.view.nextTutorialStep();
    });

    this.view.startButton.addEventListener("click", () => {
      this.startGame();
    });
  }

  startGame() {
    this.model.startGame();
    this.view.tutorialOverlay.style.display = "none";
    this.updateView();
  }

  handleAttributeSelection(attribute) {
    if (this.model.gameState !== "waiting") return;

    const result = this.model.compareAttributes(attribute);
    this.model.updateScore(result);
    this.view.highlightAttribute(attribute, result);

    setTimeout(() => {
      this.view.removeHighlights();
      this.model.nextRound();
      this.updateView();
    }, 2000);
  }

  updateView() {
    if (this.model.gameState === "gameEnd") {
      this.view.updateGameStatus(
        `Fim de jogo! Você obteve ${this.model.playerScore} vitórias.`
      );
      return;
    }

    this.view.updateCards(this.model.playerCard, this.model.iaCard);
    this.view.updateRoundInfo(this.model.round, this.model.playerScore);
    this.view.updateScore(this.model.playerScore);
    this.view.updateProgress((this.model.round / this.model.maxRounds) * 100);
    this.view.updateGameStatus("Escolha um atributo para comparar");
  }
}

// Inicialização do jogo
document.addEventListener("DOMContentLoaded", () => {
  const model = new GameModel();
  const view = new GameView();
  const controller = new GameController(model, view);
});
