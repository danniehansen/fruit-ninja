import {
  ComponentInternalInstance,
  onBeforeUnmount,
  getCurrentInstance,
} from 'vue';

import { CanvasApi } from './Types';

const findInstance = (node: ComponentInternalInstance) => {
  let current = node;

  while (current !== null && current.parent) {
    if (current.exposed?.register) {
      return current;
    }

    current = current.parent;
  }

  return null;
};

export const registerComponent = (
  name: string,
  update: (api: CanvasApi) => void,
  render: (api: CanvasApi) => void
) => {
  const instance = getCurrentInstance();
  const instanceToUse = findInstance(instance);

  if (instanceToUse) {
    const componentId = instanceToUse.exposed?.register({
      name,
      update,
      render,
    });

    onBeforeUnmount(() => {
      instanceToUse?.exposed?.deregister(componentId);
    });
  } else {
    throw new Error('Unable to register component');
  }
};
