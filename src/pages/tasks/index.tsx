import React from "react";

const Index = (props) => {
  return (
    <div className="mt-5 flex min-h-screen flex-col items-center gap-5">
      <p className="text-center text-2xl font-bold">Manage Tasks</p>
      <form className="flex w-full flex-col items-center">
        <div className="form-control flex h-fit w-full items-center gap-3">
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-11/12 "
          />
          <button
            type="submit"
            className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default Index;
