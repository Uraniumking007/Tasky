function CircularButton({ children }: { children?: React.ReactNode }) {
    return (
      <button className="h-fit w-fit rounded-full bg-info p-2 hover:bg-primary-focus active:scale-90">
        {children}
      </button>
    );
  }

  export default CircularButton;