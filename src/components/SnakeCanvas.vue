<template>
  <canvas ref="canvasRef" width="550" height="550"></canvas>
  <p v-if="props.isListening">isListening</p>
</template>

<script>
import { reactive } from "vue";
import { onMounted, watch } from "vue";
import { ref } from "vue";

export default {
  name: "SnakeCanvas",
  props: ["isListening"],
  setup(props) {
    const canvasRef = ref(null);
    const state = reactive({
      isMoving: false,
      snake: [{}],
      cellSize: 10,
      speed: 10,
    });

    //Vue lifecycle -> beforCreate, created, beforeMount, mounted, beforeUpdate, updated, beforeDestroy, destroyed
    //composition API doesnt have created because setup is run there instead
    onMounted(() => {
      state.canvasContext = canvasRef.value.getContext("2d");
    });
    watch(
      () => props.isListening,
      (currentValue) => {
        if (currentValue) {
          resetSnake();
          move();
        }
      }
    );

    const resetSnake = () => {
      console.log("reset snake called");
      state.snake = [
        {
          x: 10,
          y: 10,
        },
      ];
    };

    const move = () => {
      if (!props.isListening) return;
      state.snake.forEach((obj) => drawCell(obj.x, obj.y));
    };

    const drawCell = (x, y) => {
      console.log("draw cell called");
      state.canvasContext.rect(
        x * state.cellSize,
        y * state.cellSize,
        state.cellSize,
        state.cellSize
      );
      state.canvasContext.fillStyle = "black";
      canvasRef.value.getContext("2d").fill();
    };

    /*  const getMoveDelay = () => {
      //in miliseconds
      return (2 / Number(state.speed)) * 1000;
    }; */

    resetSnake();
    return { canvasRef, props, state, resetSnake, move, drawCell };
  },
};
</script>

<style lang="scss" scoped>
canvas {
  border: 1px solid black;
}
</style>
