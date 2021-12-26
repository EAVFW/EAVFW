

export type EAVFormContextActions<T> = {
    onChange: (cb: (props: T) => void) => void;
}