import { To } from "history";
import history from "history/browser";
import { useCallback } from "react";

type LinkProps = {
  to: To;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export const Link = ({ to, onClick: externalOnClick, ...props }: LinkProps) => {
  const onClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      externalOnClick?.(event);

      if (event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) {
        return;
      }

      event.preventDefault();
      history.push(to);
    },
    [externalOnClick, to],
  );

  return <a {...props} href={history.createHref(to)} onClick={onClick} />;
};
