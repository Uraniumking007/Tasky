import TasksAccordions from "@/components/Accordions/taskAccordions";
import Layout from "@/components/Layout";
import Loading from "@/components/Loading";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import type { ReactElement } from "react";

export default function Tasks(props) {
  const { data: sessionData, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    void router.push("/login");
  }

  const { data, isFetching, error } = api.tasks.getAll.useQuery(undefined, {
    enabled: !!sessionData?.user,
  });
  console.log(error);

  if (isFetching) return <Loading />;
  if (!data) return <p>Something went wrong</p>;
  if (data?.length === 0) return <p>No tasks yet</p>;

  return (
    <div className="flex h-full w-full flex-col">
      <div>
        <h1 className="ml-10 mt-8 text-4xl">Tasks</h1>
      </div>
      <div className="m-8 flex flex-col text-black">
        <TasksAccordions tasks={data} />;
      </div>
    </div>
  );
}

Tasks.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
