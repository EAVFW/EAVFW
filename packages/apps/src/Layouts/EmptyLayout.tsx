import { Fragment, ReactNode } from 'react';

export function EmptyLayout(props: { children?: ReactNode }) {
  return <Fragment>{props.children}</Fragment>;
}
