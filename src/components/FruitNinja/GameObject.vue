<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { CanvasApi } from './Types';
import { registerComponent } from './Utils';

export default defineComponent({
  props: {
    image: {
      type: Object as PropType<HTMLImageElement>,
      required: true,
    },

    x: {
      type: Number,
      required: true,
    },

    y: {
      type: Number,
      required: true,
    },

    mouseX: {
      type: Number,
      required: true,
    },

    mouseY: {
      type: Number,
      required: true,
    },

    mouseDown: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['dead'],
  render() {},
  setup(props, context) {
    let dead = false;

    const update = (api: CanvasApi) => {
      if (api.deltaTime === undefined) {
        return;
      }

      if (
        !dead &&
        props.mouseDown &&
        props.mouseX >= props.x &&
        props.mouseX <= props.x + props.image.width &&
        props.mouseY >= props.y &&
        props.mouseY <= props.y + props.image.height
      ) {
        dead = true;
        context.emit('dead');
      }
    };

    const render = (api: CanvasApi) => {
      if (!api.context) {
        return;
      }

      api.context.drawImage(props.image, props.x, props.y);
    };

    registerComponent('game-object', update, render);
  },
});
</script>
