<template>
  <div id="placeholder"></div>
  <div class="wrapper">
    <img
      class="intro-img"
      src="@/assets/intro.png"
      alt="snake game"
      id="snake-img"
    />
    <div id="grid-board"></div>
  </div>
</template>

<script>
import { onMounted, watch } from "vue";
import scored from "../assets/scored.wav";
import error from "../assets/error.wav";

export default {
  name: "SnakeGrid",
  props: ["isListening", "isPaused", "gameOver", "score", "isMoving"],
  emits: ["moving", "togglePaused", "gameOver", "scored"],
  setup(props, { emit }) {
    let lastRenderTime = 0;
    //how many times per second (cca) the snake moves
    let speed = 4;
    const snake = [{ x: 11, y: 11 }];
    const growRate = 1;
    let newSnakeSegments = 0;
    let food = { x: 1, y: 1 };
    const foodValue = 1;
    let direction = { x: 0, y: 0 };
    let lastDirection = { x: 0, y: 0 };
    const gridSize = 21;
    let foodColor = "#258EA6";

    onMounted(() => {
      food = getRandomFoodPos();
      foodColor = getRandomFoodColor();
    });

    watch(
      () => props.isListening,
      (currentValue) => {
        if (currentValue) {
          document.getElementById("snake-img").classList.add("remove");
          //add event listener for direction
          window.addEventListener("keydown", (e) => {
            if (props.gameOver) return;
            switch (e.key) {
              case "w":
              case "ArrowUp":
                if (lastDirection.y !== 0 || props.isPaused) break;
                if (!props.isMoving) {
                  emit("moving");
                }
                direction = { x: 0, y: -1 };
                break;
              case "s":
              case "ArrowDown":
                if (lastDirection.y !== 0 || props.isPaused) break;
                if (!props.isMoving) {
                  emit("moving");
                }
                direction = { x: 0, y: 1 };
                break;
              case "a":
              case "ArrowLeft":
                if (lastDirection.x !== 0 || props.isPaused) break;
                if (!props.isMoving) {
                  emit("moving");
                }
                direction = { x: -1, y: 0 };
                break;
              case "d":
              case "ArrowRight":
                if (lastDirection.x !== 0 || props.isPaused) break;
                if (!props.isMoving) {
                  emit("moving");
                }
                direction = { x: 1, y: 0 };
                break;
              case props.isPaused && " ":
                emit("togglePaused");
                break;
              case !props.isPaused && "p":
                if (!props.isMoving) return;
                emit("togglePaused");
                break;
            }
          });
          window.requestAnimationFrame(mainLoop);
        }
      }
    );

    watch(
      () => props.isPaused,
      (currentValue) => {
        if (!currentValue) {
          //if unpaused call the mainloop again
          window.requestAnimationFrame(mainLoop);
        }
      }
    );

    /* GAME METHODS */
    const mainLoop = (currentTime) => {
      //current time is in miliseconds
      if (props.isPaused || props.gameOver) return;

      //this will give available frame in 60 fps - different on different pcs
      window.requestAnimationFrame(mainLoop);
      const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
      if (secondsSinceLastRender < 1 / speed) return; //makes sure the snake doesnt move unless it needs to

      lastRenderTime = currentTime;
      update();
      draw();
    };
    const update = () => {
      updateSnake();
      updateFood();
      checkDeath();
    };
    const draw = () => {
      //this removes the old pieces
      document.getElementById("grid-board").innerHTML = "";
      drawSnake();
      drawFood();
    };
    const randomGridPos = () => {
      //0 is not on grid so between 1 and 21
      return {
        x: Math.floor(Math.random() * gridSize) + 1,
        y: Math.floor(Math.random() * gridSize) + 1,
      };
    };
    const checkDeath = () => {
      //either head is outside of grid or the snake intersected
      if (outsideGrid(getSnakeHead()) || snakeIntersection()) {
        const audio = new Audio(error);
        audio.play();
        emit("gameOver");
      }
    };
    const outsideGrid = (pos) => {
      return pos.x < 1 || pos.x > gridSize || pos.y < 1 || pos.y > gridSize;
    };

    /* SNAKE METHODS */
    const updateSnake = () => {
      growSnake();
      lastDirection = direction;
      //starting from the last piece of snake we loop through
      //every body piece except head will be moved to the previous piece position
      for (let i = snake.length - 2; i >= 0; i--) {
        snake[i + 1] = { ...snake[i] };
      }
      //updating head
      snake[0].x += direction.x;
      snake[0].y += direction.y;
    };
    const drawSnake = () => {
      snake.forEach((piece) => {
        const el = document.createElement("div");
        el.style.gridRowStart = piece.y;
        el.style.gridColumnStart = piece.x;
        el.classList.add("snake");
        document.getElementById("grid-board").appendChild(el);
      });
    };
    const addSnakeSegments = (amount) => {
      newSnakeSegments += amount;
    };
    const growSnake = () => {
      for (let i = 0; i < newSnakeSegments; i++) {
        //new duplicate of snake is added as a new last segment
        snake.push({ ...snake[snake.length - 1] });
      }

      //has to be reseted to 0, otherwise the snake continually grows
      newSnakeSegments = 0;
    };
    const onSnake = (position, { ignoreHead = false } = {}) => {
      //check if any array elements pass the test - if any has same position as food
      return snake.some((piece, index) => {
        if (ignoreHead && index === 0) return false;
        return equalPositions(piece, position);
      });
    };
    const equalPositions = (pos1, pos2) => {
      return pos1.x === pos2.x && pos1.y === pos2.y;
    };
    const getSnakeHead = () => {
      return snake[0];
    };
    const snakeIntersection = () => {
      //check if head is touching any other parts
      return onSnake(snake[0], { ignoreHead: true });
    };

    /* FOOD METHODS */
    const updateFood = () => {
      if (onSnake(food)) {
        animateScored();
        emit("scored", foodValue);
        addSnakeSegments(growRate);
        food = getRandomFoodPos();
        foodColor = getRandomFoodColor();
        if ((props.score & 1) !== 1) speed += 0.5;
      }
    };
    const drawFood = () => {
      const el = document.createElement("div");
      el.style.backgroundColor = foodColor;
      el.style.gridRowStart = food.y;
      el.style.gridColumnStart = food.x;
      el.classList.add("food");
      document.getElementById("grid-board").appendChild(el);
    };
    const getRandomFoodPos = () => {
      let newFoodPos;
      //will loop until it finds a good position
      while (newFoodPos == null || onSnake(newFoodPos)) {
        newFoodPos = randomGridPos();
      }
      return newFoodPos;
    };
    const getRandomFoodColor = () => {
      let colors = [
        "#D8CC34",
        "#83C5BE",
        "#7C5869",
        "#A3333D",
        "#e29578",
        "#258EA6",
      ];

      return colors[Math.floor(Math.random() * colors.length)];
    };

    const animateScored = () => {
      const audio = new Audio(scored);
      audio.play();
      const rect = document
        .getElementsByClassName("food")[0]
        .getBoundingClientRect();
      const plusOne = document.createElement("div");
      plusOne.classList.add("plus-one");
      plusOne.innerHTML += "+1";
      plusOne.style.position = "absolute";
      plusOne.style.left = rect.left + "px";
      plusOne.style.top = rect.top + "px";
      document.getElementById("placeholder").appendChild(plusOne);
      const addedEls = document.getElementsByClassName("plus-one");
      if (addedEls.length < 1) {
        addedEls.forEach((el) => {
          el.addEventListener("animationend", () => {
            el.remove();
          });
        });
      } else {
        addedEls[0].addEventListener("animationend", () => {
          addedEls[0].remove();
        });
      }
    };

    return {
      getRandomFoodPos,
      getRandomFoodColor,
      lastRenderTime,
      speed,
      snake,
      growRate,
      newSnakeSegments,
      food,
      foodColor,
      direction,
      lastDirection,
      gridSize,
    };
  },
};
</script>

<style lang="scss">
.wrapper {
  width: 100%;
  aspect-ratio: 1/1;
  max-width: 700px;
  max-height: 700px;
  margin: auto;
}
.intro-img {
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
  width: 70%;
  padding: 20px;
  padding-top: 30px;
  max-width: 600px;
  transition: all 0.5s ease-in-out;
}
.remove {
  opacity: 0;
}
#grid-board {
  background-color: white;
  width: 100%;
  aspect-ratio: 1 / 1;
  max-width: 700px;
  max-height: 700px;
  margin: auto;
  display: grid;
  //21 rows and collumns which are evenly split up
  grid-template-rows: repeat(21, 1fr);
  grid-template-columns: repeat(21, 1fr);
}
.snake {
  background-color: #006d77;
  //border will scale with the board
  border: 0.35vmin solid black;
}
.food {
  border: 0.35vmin solid black;
  border-radius: 50%;
}
.plus-one {
  font-size: 2em;
  font-family: "Yeseva One", cursive;
  color: #a3333d;
  text-shadow: 2px 2px 8px white;
  animation: scored 1s ease-in-out;
}
@keyframes scored {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-40px);
  }
}
</style>
