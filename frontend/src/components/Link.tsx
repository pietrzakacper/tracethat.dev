import { To } from "history";
import history from "history/browser";
import { useCallback } from "react";

type LinkProps = {
  to: To;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export const Link = ({ to, ...props }: LinkProps) => {
  const onClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) {
        return;
      }

      event.preventDefault();
      history.push(to);
    },
    [to],
  );

  return <a {...props} href={history.createHref(to)} onClick={onClick} />;
};
