import { useLayoutEffect, useMemo, useRef } from 'react';

type Fn<ARGS extends any[], R> = (...args: ARGS) => R;

/**
 * Polyfill compatible with React v16 that aims to provide similar functionality
 * to the `useEffectEvent` hook that may be introduced in a future version of React.
 * **IMPORTANT: The returned function should not be used during rendering.**
 *
 * `useEffectEvent` is a React Hook that lets you extract non-reactive logic
 * into an Effect Event. See the React docs for further details:
 * https://react.dev/learn/separating-events-from-effects#declaring-an-effect-event
 *
 * @param fn A function similar to one passed to useCallback.
 * @returns A stable reference to the function that was passed in the last render phase.
 */
export const useEffectEvent = <A extends any[], R>(fn: Fn<A, R>): Fn<A, R> => {
  const ref = useRef<Fn<A, R>>(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return useMemo(
    () =>
      (...args: A): R => {
        const { current } = ref;
        return current(...args);
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
};
