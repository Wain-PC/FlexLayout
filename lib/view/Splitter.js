import * as React from "react";
import { DragDrop } from "../DragDrop";
import { Actions } from "../model/Actions";
import { BorderNode } from "../model/BorderNode";
import { Orientation } from "../Orientation";
import { CLASSES } from "../Types";
/** @internal */
export const Splitter = (props) => {
    const { layout, node, path } = props;
    const pBounds = React.useRef([]);
    const outlineDiv = React.useRef(undefined);
    const parentNode = node.getParent();
    const onMouseDown = (event) => {
        DragDrop.instance.setGlassCursorOverride(node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize");
        DragDrop.instance.startDrag(event, onDragStart, onDragMove, onDragEnd, onDragCancel, undefined, undefined, layout.getCurrentDocument(), layout.getRootDiv());
        pBounds.current = parentNode._getSplitterBounds(node, true);
        const rootdiv = layout.getRootDiv();
        outlineDiv.current = layout.getCurrentDocument().createElement("div");
        outlineDiv.current.style.position = "absolute";
        outlineDiv.current.className = layout.getClassName(CLASSES.FLEXLAYOUT__SPLITTER_DRAG);
        outlineDiv.current.style.cursor = node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize";
        const r = node.getRect();
        if (node.getOrientation() === Orientation.VERT && r.width < 2) {
            r.width = 2;
        }
        else if (node.getOrientation() === Orientation.HORZ && r.height < 2) {
            r.height = 2;
        }
        r.positionElement(outlineDiv.current);
        rootdiv.appendChild(outlineDiv.current);
    };
    const onDragCancel = (wasDragging) => {
        const rootdiv = layout.getRootDiv();
        rootdiv.removeChild(outlineDiv.current);
    };
    const onDragStart = () => {
        return true;
    };
    const onDragMove = (event) => {
        const clientRect = layout.getDomRect();
        const pos = {
            x: event.clientX - clientRect.left,
            y: event.clientY - clientRect.top,
        };
        if (outlineDiv) {
            if (node.getOrientation() === Orientation.HORZ) {
                outlineDiv.current.style.top = getBoundPosition(pos.y - 4) + "px";
            }
            else {
                outlineDiv.current.style.left = getBoundPosition(pos.x - 4) + "px";
            }
        }
        if (layout.isRealtimeResize()) {
            updateLayout();
        }
    };
    const updateLayout = () => {
        let value = 0;
        if (outlineDiv) {
            if (node.getOrientation() === Orientation.HORZ) {
                value = outlineDiv.current.offsetTop;
            }
            else {
                value = outlineDiv.current.offsetLeft;
            }
        }
        if (parentNode instanceof BorderNode) {
            const pos = parentNode._calculateSplit(node, value);
            layout.doAction(Actions.adjustBorderSplit(node.getParent().getId(), pos));
        }
        else {
            const splitSpec = parentNode._calculateSplit(node, value);
            if (splitSpec !== undefined) {
                layout.doAction(Actions.adjustSplit(splitSpec));
            }
        }
    };
    const onDragEnd = () => {
        updateLayout();
        const rootdiv = layout.getRootDiv();
        rootdiv.removeChild(outlineDiv.current);
    };
    const getBoundPosition = (p) => {
        const bounds = pBounds.current;
        let rtn = p;
        if (p < bounds[0]) {
            rtn = bounds[0];
        }
        if (p > bounds[1]) {
            rtn = bounds[1];
        }
        return rtn;
    };
    const cm = layout.getClassName;
    let r = node.getRect();
    const style = r.styleWithPosition({
        cursor: node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize",
    });
    let className = cm(CLASSES.FLEXLAYOUT__SPLITTER) + " " + cm(CLASSES.FLEXLAYOUT__SPLITTER_ + node.getOrientation().getName());
    if (parentNode instanceof BorderNode) {
        className += " " + cm(CLASSES.FLEXLAYOUT__SPLITTER_BORDER);
    }
    else {
        if (node.getModel().getMaximizedTabset() !== undefined) {
            style.display = "none";
        }
    }
    const extra = node.getModel().getSplitterExtra();
    if (extra === 0) {
        return (React.createElement("div", { style: style, "data-layout-path": path, className: className, onTouchStart: onMouseDown, onMouseDown: onMouseDown }));
    }
    else {
        // add extended transparent div for hit testing
        // extends forward only, so as not to interfere with scrollbars
        let r2 = r.clone();
        r2.x = 0;
        r2.y = 0;
        if (node.getOrientation() === Orientation.VERT) {
            r2.width += extra;
        }
        else {
            r2.height += extra;
        }
        const style2 = r2.styleWithPosition({
            cursor: node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize"
        });
        const className2 = cm(CLASSES.FLEXLAYOUT__SPLITTER_EXTRA);
        return (React.createElement("div", { style: style, "data-layout-path": path, className: className },
            React.createElement("div", { style: style2, className: className2, onTouchStart: onMouseDown, onMouseDown: onMouseDown })));
    }
};
//# sourceMappingURL=Splitter.js.map