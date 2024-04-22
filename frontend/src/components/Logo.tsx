export const Logo = (props: { onClick?: () => void }) => {
  return (
    <div
      className="font-mono w-12 h-12 flex items-center justify-center text-2xl font-semibold rounded bg-logo-background text-logo-foreground border-logo-foreground border-2 cursor-pointer"
      aria-label="trace that"
      onClick={props.onClick}
    >
      <span aria-hidden>tT</span>
    </div>
  );
};
