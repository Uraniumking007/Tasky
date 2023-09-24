import Layout from "@/components/Layout";
import Loading from "@/components/Loading";
import { api } from "@/utils/api";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { useRouter } from "next/router";
import React, { useState, type ReactElement } from "react";
import type { Selection } from "@nextui-org/react";

import { PriorityCategories } from "./data";
import { DatePicker } from "@/components/ui/datePicker";

const EditTasksPage = (props) => {
  const router = useRouter();
  const { id } = router.query;
  const [date, setDate] = useState<Date>();
  const [values, setValues] = useState<Selection>(new Set(["cat", "dog"]));

  const { data, isLoading, error } = api.tasks.getOne.useQuery({ id });

  if (isLoading) return <Loading />;
  if (error) return <div>Something went wrong</div>;
  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <div>{id}</div>
      <div>{JSON.stringify(data)}</div>
      <div className="flex flex-col gap-4 p-8">
        <Input
          label={"Title"}
          defaultValue={data.Title}
          placeholder={"Title"}
        />
        {data.Description && (
          <Input
            label={"Description"}
            defaultValue={data.Description}
            placeholder={"Description"}
          />
        )}
        <div className="flex w-full flex-wrap gap-4 md:flex-nowrap">
          <Select
            label="Select Priority"
            className="w-[50%]"
            selectedKeys={values}
            onSelectionChange={setValues}
          >
            {PriorityCategories.map((priorityLabel) => (
              <SelectItem key={priorityLabel.value} value={priorityLabel.value}>
                {priorityLabel.label}
              </SelectItem>
            ))}
          </Select>
          <DatePicker date={date} onDateChange={setDate} />
        </div>
      </div>
    </>
  );
};

export default EditTasksPage;

EditTasksPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
