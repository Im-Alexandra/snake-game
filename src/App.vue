<template>
  <router-view v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>
</template>

<style lang="scss">
/* basic css reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* Headings */
@import url("https://fonts.googleapis.com/css2?family=Yeseva+One&display=swap");
/* Other */
@import url("https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@200;300;400&display=swap");
body {
  font-family: "Josefin Sans", sans-serif;
}
#app {
  width: 100vw;
  height: 100vh;
  background-color: #ffddd2;
}
h1,
h2,
h3 {
  font-family: "Yeseva One", cursive;
}
button {
  background: none;
  border: none;
  border-radius: 4px;
  background-color: #e29578;
  cursor: pointer;
  color: white;
  font-family: "Josefin Sans", sans-serif;
  text-transform: uppercase;
  font-size: 1em;
  height: 38px;
  min-height: 38px;
  padding: 0 25px;
  margin-top: 16px;
  margin-bottom: 16px;
}
button:disabled {
  background-color: #b2e6ea;
}
.clickable {
  cursor: pointer;
}
.error {
  color: #d43232;
}

/* had to put this into main css because of the teleport - there is probably a better solution */
.modal-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h1,
  p {
    margin-bottom: 16px;
  }
  input {
    font-family: "Josefin Sans", sans-serif;
    text-transform: uppercase;
    font-size: 1em;
    height: 38px;
    min-height: 38px;
    padding: 0 25px;
    border-radius: 4px;
    border: none;
    background-color: #d7d7d7;
    margin-bottom: 16px;
    &:focus {
      border: none;
      outline: none;
    }
  }
}

/* router transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
