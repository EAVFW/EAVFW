import { Link, ProgressBar, Toast, ToastBody, Toaster, ToasterProps, ToastTitle, useId, useToastController } from "@fluentui/react-components";
import { useEffect, useRef, useState } from "react";
import { useWizard } from "./useWizard";



const intervalDelay = 100;
const intervalIncrement = 5;

const DownloadProgressBar: React.FC<{ onDownloadEnd: () => void }> = ({
    onDownloadEnd,
}) => {
    const [value, setValue] = useState(100);
    // This effect simulates progress value based on state/remote data
    useEffect(() => {
        if (value > 0) {
            const timeout = setTimeout(() => {
                setValue((v) => Math.max(v - intervalIncrement, 0));
            }, intervalDelay);

            return () => clearTimeout(timeout);
        }

        if (value === 0) {
            onDownloadEnd();
        }
    }, [value, onDownloadEnd]);

    return <ProgressBar value={value} max={100} />;
};

export const WizardToaster: React.FC<{ id?: string, position?: ToasterProps["position"] }> = ({ id = "toaster", position="top-end" }) => {

    const toasterId = useId(id);
    const { dispatchToast, dismissToast } = useToastController(toasterId);
    const [{ messages = {} }] = useWizard();

    const messageState = useRef({});
    useEffect(() => {
        for (let [x, m] of Object.entries(messages)) {
            if (!(x in messageState.current)) {
                dispatchToast(
                    <Toast>
                        <ToastTitle action={<Link onClick={() => dismissToast(x)}>dismiss</Link>}>{m.title}</ToastTitle>
                        <ToastBody>
                            {m.message}
                            <br />
                            {m.detailedMessage}
                            <DownloadProgressBar onDownloadEnd={() => dismissToast(x)} />
                        </ToastBody>

                    </Toast>,
                    {
                        intent: m.intent,
                        timeout: -1,
                        toastId: x
                        // onStatusChange: (e, { status }) => setUnmounted(status === "unmounted")   
                    }
                );
            }
        }
    }, [messages]);

    return <Toaster inline toasterId={toasterId} position={position} />
}