<template>
  <div class="home">
    <h1><span>🐍</span> Snake game <span>🐍</span></h1>
    <svg
      @click="toggleModal('info')"
      class="info-icon"
      xmlns="http://www.w3.org/2000/svg"
      height="1.5em"
      viewBox="0 0 512 512"
    >
      <path
        d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
      />
    </svg>
    <SnakeGrid
      :isListening="state.isListening"
      :isPaused="state.isPaused"
      :gameOver="state.gameOver"
      :isMoving="state.isMoving"
      :difficulty="state.difficulty"
      :player="state.player"
      @togglePaused="togglePaused"
      @gameOver="gameOver"
      @moving="toggleMoving"
      @openHighScore="toggleModal('score')"
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
    <Transition name="fade-in">
      <div v-if="state.isListening && !state.isPaused && !state.gameOver">
        <p>Use arrows or WASD to move</p>
      </div>
    </Transition>
    <Transition name="fade-in">
      <div v-if="state.isListening" class="difficulty">
        {{ state.difficulty.toUpperCase() }}
      </div>
    </Transition>
    <!-- INFO MODAL -->
    <GameModal
      :modalActive="state.infoModalActive"
      @close="($event) => toggleModal('info')"
    >
      <div class="modal-content">
        <h1>Project info</h1>
        <p class="text-balance">
          Snake game was made as an "interview test" project. The interview was
          for the Front-end game developer position at
          <a href="https://trophy-games.com/" target="_blank">Trophy Games</a>
          in April 2023. It took around 2 days of work, cca 16h.
        </p>
        <p>
          Coding test
          <a
            href="https://drive.google.com/file/d/1Psg6jTAtn4inx8JdY7vtJWpGmiuGNGHZ/view?usp=drive_link"
            target="_blank"
            >requirements</a
          >
        </p>
        <p>Project is build with Vue3 and Firebase.</p>
      </div>
    </GameModal>
    <!-- NAME MODAL -->
    <GameModal
      :modalActive="state.nameModalActive"
      @close="toggleModal('name')"
    >
      <div class="modal-content">
        <h1>Your name:</h1>
        <input
          type="text"
          :value="state.player.toUpperCase()"
          @input="state.player = $event.target.value.toUpperCase()"
          required
          placeholder="name"
        />
        <span v-if="state.nameError" class="error">{{ state.nameError }}</span>
        <h2 class="subheadline">Difficulty:</h2>
        <div class="difficulty-wrapper">
          <label for="easy">
            <input
              type="radio"
              v-model="state.difficulty"
              value="easy"
              id="easy"
              checked
            />Easy</label
          >
          <label for="medium">
            <input
              type="radio"
              v-model="state.difficulty"
              value="medium"
              id="medium"
            />
            Medium</label
          >
          <label for="hard">
            <input
              type="radio"
              v-model="state.difficulty"
              value="hard"
              id="hard"
            />Hard</label
          >
        </div>
        <button @click="saveName" type="button">Play</button>
      </div>
    </GameModal>

    <!-- HIGH SCORE MODAL -->
    <GameModal
      :modalActive="state.scoreModalActive"
      @close="toggleModal('score')"
    >
      <div class="modal-content">
        <HighScore :headline="'big'" :difficulty="state.difficulty" />
        <button @click="toggleModal('score')" type="button">Close</button>
      </div>
    </GameModal>

    <!-- GAME OVER MODAL -->
    <GameModal
      :modalActive="state.gameOverModalActive"
      @close="toggleModal('game')"
    >
      <div v-if="state.gameOverData" class="modal-content">
        <h1>Game over!</h1>
        <p class="your-score">
          Your score: {{ state.gameOverData.score }}, your time:
          {{ state.gameOverData.time }}s
        </p>
        <HighScore
          :headline="'small'"
          :player="{
            player: state.player,
            score: state.gameOverData.score,
            time: state.gameOverData.time,
          }"
          :difficulty="state.difficulty"
          :modalActive="state.gameOverModalActive"
        />
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
      difficulty: "easy",
      player: "",
      nameError: null,
      scoreModalActive: false,
      nameModalActive: false,
      gameOverModalActive: false,
      infoModalActive: false,
      isListening: false,
      isPaused: false,
      gameOver: false,
      isMoving: false,
      gameOverData: null,
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
      else if (modalType === "info")
        state.infoModalActive = !state.infoModalActive;
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

    const toggleMoving = () => {
      state.isMoving = !state.isMoving;
    };

    const toggleListening = () => {
      state.isListening = !state.isListening;
    };

    const togglePaused = () => {
      state.isPaused = !state.isPaused;
      state.isMoving = !state.isMoving;
      /* if (state.isMoving) timer(); */
    };

    const gameOver = async (data) => {
      state.gameOver = true;
      state.gameOverData = data;
      const colRef = collection(db, "highscores");
      await addDoc(colRef, state.gameOverData);
    };

    const restartGame = () => {
      window.location = "/";
    };

    return {
      state,
      toggleModal,
      saveName,
      toggleListening,
      togglePaused,
      gameOver,
      toggleMoving,
      restartGame,
    };
  },
};
</script>

<style lang="scss" scoped>
.fade-in-enter-active,
.fade-in-leave-active {
  transition: opacity 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}
.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
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
  position: relative;
  .info-icon {
    position: absolute;
    top: 20px;
    right: 0;
    cursor: pointer;
  }
  @media (max-width: 700px) {
    padding-top: 50px;
  }
  h1,
  p,
  button {
    margin-bottom: 16px;
  }
  .difficulty {
    background-color: white;
    padding: 4px 14px;
    border-radius: 4px;
    margin-bottom: 100px;
  }
}
.modal-content {
  .subheadline {
    margin-top: 32px;
  }
}
.difficulty-wrapper {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  margin-top: 16px;

  label {
    display: flex;
    cursor: pointer;
    gap: 5px;
  }
}
</style>
