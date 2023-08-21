/* eslint-disable @typescript-eslint/no-unused-vars */
import { useSession } from "next-auth/react";
import React, { type FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Loading from "@/components/Loading";
import TasksView from "@/components/TaskView";
import Layout from "@/components/Layout";

const Index = (props) => {
  const { data: SessionData, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!SessionData?.user && status !== "loading") {
      void router.push("/login");
    }
  }, [SessionData?.user, router, status]);

  const { data } = api.tasks.getAll.useQuery(undefined, {
    enabled: !!SessionData?.user,
  });

  const ctx = api.useContext();

  const { mutate, isLoading } = api.tasks.createTasky.useMutation({
    onSuccess: () => {
      void ctx.tasks.getAll.invalidate();
    },
  });

  function addTask(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const title = data.get("title") as string;
    const description = data.get("description") as string | null;

    const categories = [];
    const priority = data.get("categories") as string;
    mutate({ title, description, categories, priority });
    form.reset();
  }

  return (
    <div className="mt-5 flex flex-col items-center gap-5">
      <p className="text-center text-2xl font-bold">Manage Tasks</p>
      <form
        className="flex w-full flex-col items-center"
        onSubmit={addTask}
        action=""
      >
        <div className="form-control flex h-fit w-full items-center gap-3">
          <input
            type="text"
            placeholder="Enter Task Here"
            name="title"
            disabled={isLoading}
            className="input input-bordered w-11/12 "
          />
          <select
            name="categories"
            disabled={isLoading}
            className="select w-full max-w-xs"
          >
            <option disabled selected>
              Priority
            </option>
            <option>No Priority</option>
            <option>Low Priority</option>
            <option>Medium Priority</option>
            <option>High Priority</option>
          </select>
          <button
            type="submit"
            disabled={isLoading}
            className="btn flex items-center justify-center px-10 py-5 align-middle sm:btn-md md:btn-md lg:btn-lg"
          >
            Add
          </button>
        </div>
      </form>
      {data ? <TasksView data={data} /> : <Loading />}
    </div>
  );
};

export default Index;

Index.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
