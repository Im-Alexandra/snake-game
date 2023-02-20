<template>
  <div class="high-score-wrapper">
    <h2 v-if="headline === 'small'">High score:</h2>
    <h1 v-if="headline === 'big'">High score:</h1>
    <div class="difficulty">
      <span
        :class="difficultyQuery == 'easy' ? 'active' : ''"
        @click="changeDifficulty('easy')"
        >Easy</span
      >
      <span
        :class="difficultyQuery == 'medium' ? 'active' : ''"
        @click="changeDifficulty('medium')"
        >Medium</span
      >
      <span
        :class="difficultyQuery == 'hard' ? 'active' : ''"
        @click="changeDifficulty('hard')"
        >Hard</span
      >
    </div>
    <Transition name="score" mode="out-in">
      <ul
        v-if="highscores"
        class="high-score"
        id="high-score"
        :key="difficultyQuery"
      >
        <li v-for="(score, index) in sortedHighScores" :key="index">
          <span class="order">{{ index + 1 }}.</span>
          <span class="name"> {{ score.player.toUpperCase() }}</span>
          <span class="score">score: {{ score.score }}</span>
          <span class="time">time: {{ score.time }}s</span>
        </li>
        <span v-if="sortedHighScores.length === 0" class="text-center"
          >No highscores yet</span
        >
      </ul>
    </Transition>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import getCollection from "../composables/getCollection";

export default {
  name: "HighScore",
  props: ["player", "modalActive", "headline", "difficulty"],
  setup(props) {
    let difficultyQuery = ref("easy");
    const { documents: highscores } = getCollection("highscores");
    const highScoreCount = ref(10);

    const sortedHighScores = computed(() => {
      let sorted = sortArray(highscores.value);
      let filtered = sorted.filter(
        (score) => score.difficulty === difficultyQuery.value
      );
      return filtered.slice(0, highScoreCount.value);
    });

    const sortArray = (array) => {
      array.sort((a, b) => {
        if (a.score === b.score) {
          return a.time < b.time ? -1 : 1;
        } else {
          return a.score < b.score ? 1 : -1;
        }
      });
      return array;
    };

    watch(
      () => props.modalActive,
      () => {
        if (props.modalActive && props.player) {
          setTimeout(() => {
            difficultyQuery.value = props.difficulty;
            highlightIfInHighscore(
              props.player.player,
              props.player.score,
              props.player.time
            );
          }, 100);
        }
      },
      { immediate: true }
    );

    watch(
      () => props.difficulty,
      () => {
        console.log("change");
        difficultyQuery.value = props.difficulty;
      }
    );

    watch(difficultyQuery, () => {
      if (!props.player) return;
      if (props.difficulty !== difficultyQuery.value) {
        removeHighligh();
      } else if (props.difficulty === difficultyQuery.value) {
        setTimeout(() => {
          highlightIfInHighscore(
            props.player.player,
            props.player.score,
            props.player.time
          );
        }, 1000);
      }
    });

    const highlightIfInHighscore = (player, score, time) => {
      const index = sortedHighScores.value.findIndex(
        (row) =>
          row.player.toLowerCase() === player.toLowerCase() &&
          row.score === score &&
          row.time === time
      );
      if (index !== -1) {
        //there is multiple modals with highscore in DOM -.- duh
        let el =
          document.getElementsByClassName("high-score")[1].children[index];
        el.classList.add("highlight");
      }
    };

    const removeHighligh = () => {
      const el = document.getElementsByClassName("highlight")[0];
      if (el) el.classList.remove("highlight");
    };

    const changeDifficulty = (difficulty) => {
      difficultyQuery.value = difficulty;
    };

    return {
      highscores,
      highScoreCount,
      sortedHighScores,
      highlightIfInHighscore,
      difficultyQuery,
      removeHighligh,
      changeDifficulty,
    };
  },
};
</script>

<style lang="scss" scoped>
.score-enter-active,
.score-leave-active {
  transition: all 0.5s ease-in-out;
}
.score-enter-from,
.score-leave-to {
  opacity: 0;
}

.high-score-wrapper {
  h2,
  h1 {
    text-align: center;
    margin-bottom: 16px;
  }
  .difficulty {
    display: flex;
    margin: auto;
    width: 200px;
    justify-content: space-between;
    color: #c8c7c7;
    span {
      cursor: pointer;
    }
  }
  .active {
    color: black;
  }
}
.high-score {
  margin-top: 16px;
  margin-bottom: 16px;
  height: 260px;
  padding: 10px;
  background-color: gainsboro;
  border-radius: 4px;
  display: flex;
  flex-direction: column;

  .highlight {
    background-color: #e29578;
  }

  li {
    line-height: 24px;
    list-style-type: none;
    display: flex;
    gap: 10px;
    padding-left: 5px;
    transition: all 0.2s ease;

    @media (min-width: 720px) {
      .order {
        width: 10px;
      }
      .name {
        width: 150px;
      }
      .score,
      .time {
        width: 90px;
      }
      li {
        gap: 5px;
      }
    }
  }
  .text-center {
    text-align: center;
    display: block;
  }
}
.high-score li:first-child .name:before {
  content: "🥇";
}
.high-score li:nth-child(2) .name:before {
  content: "🥈";
}
.high-score li:nth-child(3) .name:before {
  content: "🥉";
}
.high-score li:nth-child(3) {
  border-bottom: 2px solid #e29578;
}
</style>
