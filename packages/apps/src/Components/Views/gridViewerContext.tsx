import React, { createContext, PropsWithChildren, useContext } from 'react';

import { ModelDrivenGridViewerContextProps } from './gridViewerTypes';

// Use a no-op placeholder instead of importing DefaultPrimaryFieldRender from
// ./gridViewerRenderers to break a circular dependency (renderers imports from
// this file via useModelDrivenGridViewerContext). The real renderer is always
// provided through the context provider at runtime.
const ModelDrivenGridViewerContext = createContext<ModelDrivenGridViewerContextProps>({
  onRenderPrimaryField: (() => null) as ModelDrivenGridViewerContextProps['onRenderPrimaryField'],
});

/**
 * Hook to access the ModelDrivenGridViewer context, which provides
 * the primary field render function and any additional context props.
 */
export function useModelDrivenGridViewerContext<T>() {
  return useContext<ModelDrivenGridViewerContextProps>(
    ModelDrivenGridViewerContext,
  ) as ModelDrivenGridViewerContextProps & T;
}

/**
 * Provider component for the ModelDrivenGridViewer context.
 */
export function ModelDrivenGridViewerContextProvider<T>({
  children,
  ...props
}: PropsWithChildren<ModelDrivenGridViewerContextProps & T>) {
  return (
    <ModelDrivenGridViewerContext.Provider value={props}>
      {children}
    </ModelDrivenGridViewerContext.Provider>
  );
}
