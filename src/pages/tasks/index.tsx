/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useSession } from "next-auth/react";
import React, { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Loading from "@/components/Loading";
import TasksView from "@/components/TaskView";
import Layout from "@/components/Layout";
import toast, { Toaster } from "react-hot-toast";
import SuccessToast from "@/components/Toasts/successToast";
import ErrorToast from "@/components/Toasts/errorToast";
import TaskPopUp from "@/components/PopUp/TaskPopUp";

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
  const [date, setDate] = useState<Date | undefined>(undefined);

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
      toast.custom((t) => (
        <SuccessToast t={t} message="Task Created Successfully" />
      ));
      setDate(undefined);
      setCategories([]);
    },
    onError: () => {
      toast.custom((t) => <ErrorToast t={t} message="Task Creation Failed" />);
    },
  });

  function addTask(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const title = data.get("title") as string;
    const description = data.get("description") as string | null;
    const priority = data.get("priority") as string;
    console.log(categories);

    mutate({ title, description, categories, priority, date });
    form.reset();
  }

  return (
    <div className="mt-5 flex flex-col items-center gap-5">
      <div className="flex w-full justify-between px-36">
        <p className="text-center text-2xl font-bold">Manage Tasks</p>
        <TaskPopUp />
      </div>
      <div className="bg-base-100 -z-0 flex w-11/12 rounded-3xl p-4 py-8 drop-shadow-xl">
        {data ? <TasksView data={data} /> : <Loading />}
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{ duration: 3000 }}
        reverseOrder={true}
      />
    </div>
  );
};

export default Index;

Index.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
