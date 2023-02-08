<template>
  <div class="home">
    <h1 @click="state.gameOver = true">
      <span class="emoji">🐍</span> Snake game <span class="emoji">🐍</span>
    </h1>
    <div class="nav">
      <p>Time: {{ state.time }}</p>
      <p>Score: {{ state.score }}</p>
      <p>Player: {{ state.player.toUpperCase() }}</p>
      <button @click="toggleModal('score')" type="button">
        See high score
      </button>
    </div>

    <!-- <SnakeCanvas :isListening="state.isListening"></SnakeCanvas> -->
    <SnakeGrid
      :isListening="state.isListening"
      :isPaused="state.isPaused"
      :gameOver="state.gameOver"
      :score="state.score"
      :isMoving="state.isMoving"
      @togglePaused="togglePaused"
      @gameOver="gameOver"
      @scored="incrementScore"
      @moving="updateTime"
    ></SnakeGrid>

    <button
      v-if="!state.isListening"
      @click="toggleModal('name')"
      type="button"
    >
      Start game
    </button>
    <button
      v-else-if="!state.nameModalActive && state.isPaused"
      @click="togglePaused"
    >
      Continue - press space
    </button>
    <button v-else-if="state.gameOver" @click="restartGame">
      Restart game
    </button>
    <button v-else type="button" @click="togglePaused">Pause - press p</button>

    <!-- NAME MODAL -->
    <GameModal
      :modalActive="state.nameModalActive"
      @close="toggleModal('name')"
    >
      <div class="modal-content">
        <h1>Your name:</h1>
        <input type="text" v-model="state.player" required placeholder="name" />
        <span v-if="state.nameError" class="error">{{ state.nameError }}</span>
        <button @click="saveName" type="button">Save</button>
      </div>
    </GameModal>

    <!-- HIGH SCORE MODAL -->
    <GameModal
      :modalActive="state.scoreModalActive"
      @close="toggleModal('score')"
    >
      <div class="modal-content">
        <h1>High score:</h1>
        <HighScore />
        <button @click="toggleModal('score')" type="button">Close</button>
      </div>
    </GameModal>

    <!-- GAME OVER MODAL -->
    <GameModal
      :modalActive="state.gameOverModalActive"
      @close="toggleModal('game')"
    >
      <div class="modal-content">
        <h1>Game over!</h1>
        <p class="your-score">
          Your score: {{ state.score }}, your time: {{ state.time }}s
        </p>
        <h2>High score:</h2>
        <HighScore />
        <button @click="restartGame" type="button">Restart game</button>
      </div>
    </GameModal>
  </div>
</template>

<script>
import GameModal from "@/components/GameModal.vue";
import SnakeGrid from "@/components/SnakeGrid.vue";
import HighScore from "@/components/HighScore.vue";

import { reactive, watch } from "vue";
import { db } from "@/firebase/config";
import { addDoc, collection } from "@firebase/firestore";

export default {
  name: "HomeView",
  components: { GameModal, SnakeGrid, HighScore },
  setup() {
    const state = reactive({
      scoreModalActive: false,
      nameModalActive: false,
      gameOverModalActive: false,
      score: 0,
      time: 0,
      player: "",
      nameError: null,
      isListening: false,
      isPaused: false,
      gameOver: false,
      isMoving: false,
    });

    watch(
      () => state.gameOver,
      (currentValue) => {
        if (currentValue) {
          toggleModal("game");
        }
      }
    );

    const toggleModal = (modalType) => {
      if (modalType === "score")
        state.scoreModalActive = !state.scoreModalActive;
      else if (modalType === "name")
        state.nameModalActive = !state.nameModalActive;
      else if (modalType === "game")
        state.gameOverModalActive = !state.gameOverModalActive;
    };

    const saveName = () => {
      state.nameError = null;
      if (state.player) {
        toggleModal("name");
        toggleListening();
      } else {
        state.nameError = "Name is required";
      }
    };

    const updateTime = () => {
      state.isMoving = true;
      timer();
    };

    const timer = () => {
      if (!state.isMoving || state.gameOver) return;
      state.time++;
      setTimeout(timer, 1000);
    };

    const incrementScore = (increment) => {
      state.score += increment;
    };

    const toggleListening = () => {
      state.isListening = !state.isListening;
    };

    const togglePaused = () => {
      state.isPaused = !state.isPaused;
      state.isMoving = !state.isMoving;
      if (state.isMoving) timer();
    };

    const gameOver = async () => {
      state.gameOver = true;
      const playerToAdd = {
        player: state.player.toUpperCase(),
        score: state.score,
        time: state.time,
      };
      const colRef = collection(db, "highscores");
      await addDoc(colRef, playerToAdd);
    };

    const restartGame = () => {
      window.location = "/";
    };

    return {
      state,
      toggleModal,
      saveName,
      incrementScore,
      toggleListening,
      togglePaused,
      gameOver,
      updateTime,
      restartGame,
    };
  },
};
</script>

<style lang="scss" scoped>
.emoji {
  transition: all 0.2s ease-in-out;
}
.emoji:hover {
  transform: rotate(90deg);
}
.your-score {
  margin-bottom: 32px;
  border-bottom: 2px solid #d8cc34;
}
.home {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 800px;
  width: 80%;
  padding-top: 120px;
  margin: auto;
  @media (max-width: 700px) {
    padding-top: 50px;
  }
  h1,
  p,
  button {
    margin-bottom: 16px;
  }
  .nav {
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: 20px;
    width: 100%;
    max-width: 700px;
    p {
      min-width: 100px;
    }
    @media (max-width: 700px) {
      flex-direction: column;
      gap: 0;
    }
    button {
      margin-left: auto;
      @media (max-width: 700px) {
        margin: auto;
        margin-bottom: 16px;
      }
    }
  }
}
</style>
