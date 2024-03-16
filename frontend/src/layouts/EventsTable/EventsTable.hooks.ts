import { useRef, useState, useEffect } from "react";

export const useHandleTableScroll = () => {
  const tableRef = useRef<HTMLTableElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const tableHeightRef = useRef<number>(0);
  const tableWrapperHeightRef = useRef<number>(0);

  const [wasScrolledToBottom, setWasScrolledToBottom] = useState(false);
  useEffect(() => {
    if (tableRef.current == null || tableWrapperRef.current == null || wasScrolledToBottom) {
      return;
    }

    const $table = tableRef.current;
    const $tableWrapper = tableWrapperRef.current;

    function updateAndCheckScroll() {
      tableHeightRef.current = $table.clientHeight;
      tableWrapperHeightRef.current = $tableWrapper.clientHeight;

      if (tableHeightRef.current > tableWrapperHeightRef.current) {
        setWasScrolledToBottom(true);
        $tableWrapper.scrollTop = $tableWrapper.scrollHeight;

        return false;
      }

      return true;
    }

    const shouldContinue = updateAndCheckScroll();
    if (!shouldContinue) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      updateAndCheckScroll();
    });

    resizeObserver.observe(tableWrapperRef.current);
    resizeObserver.observe(tableRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [wasScrolledToBottom]);

  return {
    tableRef,
    tableWrapperRef,
  };
};
