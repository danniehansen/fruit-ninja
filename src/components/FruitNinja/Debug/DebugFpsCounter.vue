<script lang="ts">
import { defineComponent, getCurrentInstance, onBeforeUnmount } from 'vue';
import { CanvasApi } from '../Types';

export default defineComponent({
  name: 'DebugFpsCounter',
  render() {
    console.log('render');
  },
  setup(_props, context) {
    const instance = getCurrentInstance();
    let fpsCounter = 0;
    let currentFps = 0;
    let fpsTimeCounter = 0;

    const update = (api: CanvasApi) => {
      if (api.deltaTime === undefined) {
        return;
      }

      if (fpsTimeCounter + api.deltaTime >= 1000) {
        currentFps = fpsCounter;
        fpsTimeCounter = api.deltaTime;
        fpsCounter = 1;
      } else {
        fpsCounter++;
        fpsTimeCounter += api.deltaTime;
      }
    };

    const render = (api: CanvasApi) => {
      if (!api.context) {
        return;
      }

      api.context.fillStyle = '#fff';
      api.context.fillText(`FPS: ${currentFps}`, 25, 25);
    };

    const componentId = instance?.parent?.exposed?.register({
      name: 'debug-fps-counter',
      update,
      render,
    });

    onBeforeUnmount(() => {
      instance?.parent?.exposed?.deregister(componentId);
    });

    return {};
  },
});
</script>
