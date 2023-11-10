// import React, { useEffect, useState } from 'react';
// import {
//     SelectionMode,
//     IColumn,
//     IDetailsFooterProps,
//     IRenderFunction,
// } from "@fluentui/react";
// import { IRecord } from '@eavfw/manifest';
// import { isMobileDevice } from '@eavfw/utils/src/isMobileDevice';
// import { DesktopListComponent } from './DesktopListComponent';
// import MobileList from '../Mobile/MobileList';

// export type ModelDrivenListProps = {
//     onChange?: (data: any) => void
//     formData?: any;
//     onRenderDetailsFooter?: IRenderFunction<IDetailsFooterProps>
//     onRenderItemColumn: (item?: any, index?: number, column?: IColumn) => React.ReactNode
//     className?: string
//     selectionMode: SelectionMode
//     setKey: string,
//     items: any[],
//     onItemInvoked: (item: IRecord) => void
// }

// export const ModelDrivenList: React.FC<ModelDrivenListProps> = (props: ModelDrivenListProps) => {

//     const [isMobile, setIsMobile] = useState(isMobileDevice());

//     /* Handles when screen-size is modified */
//     useEffect(() => {
//         const handleResize = () => {
//             setIsMobile(isMobileDevice());
//         };
//         if (typeof window !== "undefined" && window) {
//             window.addEventListener('resize', handleResize);
//             return () => {
//                 window.removeEventListener('resize', handleResize);
//             };
//         }
//     }, []);

//     return isMobile ? <MobileList {...props} /> : <DesktopListComponent {...props} />;
// }

// export default ModelDrivenList;