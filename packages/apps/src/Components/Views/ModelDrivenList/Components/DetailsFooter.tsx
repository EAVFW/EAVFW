import { IDetailsFooterProps, IRenderFunction, IconButton, Stack, Sticky, StickyPositionType } from "@fluentui/react";
import { usePaging } from "Components/Views/PagingContext";

export const RenderDetailsFooter: IRenderFunction<IDetailsFooterProps> = (props, defaultRender) => {
    if (!props) {
        return null;
    }

    const { currentPage, firstItemNumber, lastItemNumber, pageSize, totalRecords, moveToFirst, moveNext, movePrevious } = usePaging();
    const { selectedCount } = { selectedCount: 0 };

    return (
        <Sticky stickyPosition={StickyPositionType.Footer} isScrollSynced={true} stickyClassName="Footer">

            <Stack grow horizontal horizontalAlign="space-between">
                <Stack.Item grow className="Footer">
                    <Stack grow horizontal horizontalAlign="space-between">
                        <Stack.Item grow={1} align="center">{firstItemNumber} - {lastItemNumber} of {totalRecords} ({selectedCount} selected)</Stack.Item>
                        <Stack.Item align="center" className="FooterRight">
                            <IconButton className="FooterIcon" iconProps={{ iconName: "DoubleChevronLeft" }} onClick={moveToFirst} />
                            <IconButton className="FooterIcon" iconProps={{ iconName: "ChevronLeft" }} onClick={movePrevious} />
                            <span>Page {currentPage + 1}</span>
                            <IconButton className="FooterIcon" iconProps={{ iconName: "ChevronRight" }} onClick={moveNext} />
                        </Stack.Item>
                    </Stack>
                </Stack.Item>
            </Stack>

        </Sticky>
    );
};

export interface IScrollablePaneDetailsListExampleItem {
    key: number | string;
    name: string;
    test2: string;
    test3: string;
    test4: string;
    test5: string;
    test6: string;
}

const footerItem: IScrollablePaneDetailsListExampleItem = {
    key: 'footer',
    name: 'Footer 1',
    test2: 'Footer 2',
    test3: 'Footer 3',
    test4: 'Footer 4',
    test5: 'Footer 5',
    test6: 'Footer 6',
};