<template>
  <Canvas
    :width="width"
    :height="height"
    @mousemove="onMouseMove"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="onMouseLeave"
  >
    <!-- Components -->
    <Slicer :x="mouseX" :y="mouseY" :interact="mouseDown" />

    <!-- Debug -->
    <DebugFpsCounter />
  </Canvas>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Canvas from './Canvas.vue';
import DebugFpsCounter from './Debug/DebugFpsCounter.vue';
import Slicer from './Slicer.vue';

export default defineComponent({
  components: { Canvas, Slicer, DebugFpsCounter },
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

    const onMouseLeave = () => {
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
      onMouseLeave,
      mouseX,
      mouseY,
      mouseDown,
      width,
      height,
    };
  },
});
</script>
