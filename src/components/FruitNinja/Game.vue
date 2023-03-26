<template>
  <Canvas
    :width="width"
    :height="height"
    @mousemove="onMouseMove"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  >
    <Level
      :width="width"
      :height="height"
      :mouse-x="mouseX"
      :mouse-y="mouseY"
      :mouse-down="mouseDown"
    />

    <!-- Debug -->
    <DebugFpsCounter />
  </Canvas>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import Canvas from './Canvas.vue';
import DebugFpsCounter from './Debug/DebugFpsCounter.vue';
import Level from './Level.vue';

export default defineComponent({
  components: { Canvas, Level, DebugFpsCounter },
  setup() {
    const width = ref(0);
    const height = ref(0);
    const mouseX = ref(0);
    const mouseY = ref(0);
    const mouseDown = ref(false);

    // --- Events ---
    const onMouseMove = (e: MouseEvent) => {
      mouseX.value = e.pageX;
      mouseY.value = e.pageY;
    };

    const onMouseDown = () => {
      mouseDown.value = true;
    };

    const onMouseUp = () => {
      mouseDown.value = false;
    };

    const resize = () => {
      width.value = window.innerWidth;
      height.value = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    return {
      onMouseDown,
      onMouseUp,
      onMouseMove,
      mouseX,
      mouseY,
      mouseDown,
      width,
      height,
    };
  },
});
</script>
