<template>
  <div class="wrapper" :style="`width:${width}px;height:${height}px;`">
    <canvas ref="canvas"></canvas>

    <slot />
  </div>
</template>

<script lang="ts">
import { CanvasApi } from './Types';

interface CanvasComponent {
  id: number;
  name: string;
  update: (api: CanvasApi) => void;
  render: (api: CanvasApi) => void;
}

import { defineComponent, onBeforeMount, onMounted, onUpdated, ref } from 'vue';

export default defineComponent({
  props: {
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
  },
  setup(props, context) {
    const canvas = ref<HTMLCanvasElement>();
    const api: CanvasApi = {
      width: 0,
      height: 0,
      context: null,
    };

    const components: CanvasComponent[] = [];

    let canvasContext: CanvasRenderingContext2D | null = null;
    let lastKnownTime: number | null = null;
    let frameId = 0;
    let componentId = 0;

    // --- Rendering ---
    const update = (delta: number) => {
      api.deltaTime = delta;
      components.forEach((component) => component.update(api));
    };

    const render = () => {
      if (!canvasContext || !canvas.value) {
        return;
      }

      canvasContext.fillStyle = '#000';
      canvasContext.fillRect(0, 0, canvas.value.width, canvas.value.height);

      components.forEach((component) => component.render(api));
    };

    const frame = (time: number) => {
      const delta = lastKnownTime === null ? time : time - lastKnownTime;
      lastKnownTime = time;

      frameId = requestAnimationFrame(frame);

      update(delta);
      render();
    };

    const setSize = () => {
      api.width = props.width;
      api.height = props.height;

      if (canvas.value) {
        canvas.value.width = props.width;
        canvas.value.height = props.height;
      }
    };

    // --- Events ----
    onMounted(async () => {
      if (canvas.value) {
        setSize();
        canvasContext = api.context = canvas.value.getContext('2d');
        frameId = requestAnimationFrame(frame);
      }
    });

    onBeforeMount(() => {
      cancelAnimationFrame(frameId);
    });

    onUpdated(setSize);

    context.expose({
      register(component: CanvasComponent) {
        componentId++;
        components.push({
          ...component,
          id: componentId,
        });

        return componentId;
      },
      deregister(id: number) {
        const component = components.find((comp) => comp.id === id);

        if (!component) {
          throw new Error(`Failed to deregister component ${id}`);
        }

        components.splice(components.indexOf(component), 1);
      },
    });

    return { canvas };
  },
});
</script>

<style lang="scss" scoped>
.wrapper {
  display: block;

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    user-select: none;
  }
}
</style>
