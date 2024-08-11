import { createStore } from '@xstate/store';

type AppContext = {
  expandedPointId: string | null;
};

const initialContext: AppContext = {
  expandedPointId: null,
};

export const store = createStore(initialContext, {
  pointToggled: (context, { pointId }: { pointId: string }) => {
    return {
      expandedPointId: context.expandedPointId !== pointId ? pointId : null,
    };
  },
});
