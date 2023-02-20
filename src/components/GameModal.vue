<template>
  <teleport to="body">
    <transition name="modal-animation">
      <div v-show="modalActive" class="modal">
        <transition name="modal-animation-inner">
          <div v-show="modalActive" class="modal-inner">
            <font-awesome-icon
              class="clickable icon"
              @click="close"
              icon="fa-solid fa-xmark"
            />
            <!-- Modal content -->
            <slot />
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  props: ["modalActive"],
  /* emit is deconstructured from context, using composition API here*/
  emits: ["close"],
  setup(props, { emit }) {
    const close = () => {
      emit("close");
    };
    return { close };
  },
};
</script>

<style lang="scss" scoped>
/* MODAL BACKGROUND ANIMATIONS */
.modal-animation-enter-active,
.modal-animation-leave-active {
  transition: opacity 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}
.modal-animation-enter-from,
.modal-animation-leave-to {
  opacity: 0;
}
.modal-animation-enter-to,
.modal-animation-leave-from {
  opacity: 1;
}
/* MODAL INNER ANIMATIONS */
.modal-animation-inner-enter-active {
  transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02) 0.15s;
}
.modal-animation-inner-leave-active {
  transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}
.modal-animation-inner-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
.modal-animation-inner-leave-to {
  transform: scale(0.8);
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  .modal-inner {
    position: relative;
    max-width: 640px;
    width: 60%;
    min-width: 320px;
    max-width: 550px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    background-color: #edf6f9;
    padding: 64px 16px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    .icon {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 25px;
    }
  }
}
</style>
