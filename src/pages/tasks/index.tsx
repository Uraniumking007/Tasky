/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useSession } from "next-auth/react";
import React, { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Loading from "@/components/Loading";
import TasksView from "@/components/TaskView";
import Layout from "@/components/Layout";
import { MultiSelect } from "@mantine/core";

const options: { label: string; value: string }[] = [
  "Personal",
  "Work",
  "Errands",
  "Goals",
].map((item) => ({
  label: item,
  value: item,
}));

const Index = (props) => {
  const { data: SessionData, status } = useSession();
  const [categories, setCategories] = useState<(typeof options)[number][]>([]);
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
    const date = new Date(data.get("deadline") as string);
    const priority = data.get("priority") as string;
    console.log(categories);

    mutate({ title, description, categories, priority, date });
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
            name="priority"
            disabled={isLoading}
            defaultValue={"No Priority"}
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
          <input
            type="date"
            name="deadline"
            id="deadline"
            className="bg-base-200 px-4 py-2 text-base-content"
          />
          <MultiSelect
            label="Select Categories"
            classNames={{
              defaultValue: "select select-bordered select-sm",
              input: "input input-bordered flex mr-4 w-full",
              label: "text-base-content",
              defaultValueLabel:
                "flex justify-center items-center text-base-content",
              values: "",
              rightSection: "ml-4",
            }}
            data={options}
            placeholder="Select items"
            searchable
            creatable
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) => {
              const item = { value: query, label: query };
              setCategories((current) => [...current, item]);
              return item;
            }}
            onChange={(query) => {
              setCategories(
                query.map((item) => ({
                  label: item,
                  value: item,
                }))
              );
            }}
          />
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
