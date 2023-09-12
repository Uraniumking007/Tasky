function CircularButton({
  children,
  onClick,
  isLoading,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
}) {
  return (
    <button
      className="h-fit w-fit rounded-full bg-info p-2 hover:bg-primary-focus active:scale-90"
      onClick={onClick}
      disabled={isLoading}
    >
      {children}
    </button>
  );
}

export default CircularButton;
