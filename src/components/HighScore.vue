<template>
  <ul v-if="highscores" class="high-score" id="high-score">
    <li v-for="(score, index) in sortedHighScores" :key="index">
      <span class="order">{{ index + 1 }}.</span>
      <span class="name"> {{ score.player.toUpperCase() }}</span>
      <span class="score">score: {{ score.score }}</span>
      <span class="time">time: {{ score.time }}s</span>
    </li>
    <span v-if="highscores.length === 0" class="text-center"
      >No highscores yet</span
    >
  </ul>
</template>

<script>
import { ref, computed, watch } from "vue";
import getCollection from "../composables/getCollection";

export default {
  name: "HighScore",
  props: ["player", "modalActive"],
  setup(props) {
    const { documents: highscores } = getCollection("highscores");
    const highScoreCount = ref(10);

    const sortedHighScores = computed(() => {
      let sorted = sortArray(highscores.value);
      return sorted.slice(0, highScoreCount.value);
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
        if (props.modalActive) {
          setTimeout(() => {
            highlightIfInHighscore(
              props.player.player,
              props.player.score,
              props.player.time
            );
          }, 500);
        }
      }
    );

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

    return {
      highscores,
      highScoreCount,
      sortedHighScores,
      highlightIfInHighscore,
    };
  },
};
</script>

<style lang="scss" scoped>
.high-score {
  margin-top: 16px;
  margin-bottom: 16px;

  .highlight {
    background-color: #e29578;
  }

  li {
    line-height: 1.4em;
    list-style-type: none;
    display: flex;
    gap: 10px;
    border-bottom: 2px solid #dcdcdc;
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
  content: "????";
}
.high-score li:nth-child(2) .name:before {
  content: "????";
}
.high-score li:nth-child(3) .name:before {
  content: "????";
}
.high-score li:nth-child(3) {
  border-bottom: 2px solid #e29578;
}
</style>
