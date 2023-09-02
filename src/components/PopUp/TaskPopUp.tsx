import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { api } from "@/utils/api";
import { useState } from "react";
import { DatePickerDemo } from "../ui/datePicker";
import { MantineProvider, MultiSelect } from "@mantine/core";
import DefaultItem from "@/pages/tasks/components/defaultItem";
import { toast } from "react-hot-toast";
import SuccessToast from "../Toast/successToast";
import ErrorToast from "../Toast/errorToast";

interface Task {
  title: string;
  description: string | null;
  categories?: {
    label: string;
    value: string;
  }[];
  date?: Date;
  priority?: string;
}

const options: { label: string; value: string }[] = [
  "Personal",
  "Work",
  "Errands",
  "Goals",
].map((item) => ({
  label: item,
  value: item,
}));

export default function TaskPopUp() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [categories, setCategories] = useState<(typeof options)[number][]>([]);
  //   const [priority, setPriority] = useState<string>("No Priority");

  const [taskData, setTaskData] = useState<Task>({
    title: "",
    date,
    description: null,
    priority: "",
    categories,
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="base-outline">Create Task</Button>
      </SheetTrigger>
      <SheetContent side={"top"}>
        <SheetHeader>
          <SheetTitle>Add New Task</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label vars={"base"} htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={taskData.title}
              onChange={(e) => {
                setTaskData({ ...taskData, title: e.target.value });
              }}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={taskData.description ?? undefined}
              onChange={(e) => {
                setTaskData({ ...taskData, description: e.target.value });
              }}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Select Categories
            </Label>
            {/* <ComboboxDemo value={priority} setValue={setPriority} /> */}
            <select
              name="priority"
              disabled={isLoading}
              defaultValue={"No Priority"}
              className="select w-full border border-base-content text-base-content"
              onChange={(e) => {
                setTaskData({ ...taskData, priority: e.target.value });
              }}
            >
              <option disabled defaultValue="No Priority">
                Priority
              </option>
              <option>No Priority</option>
              <option>Low Priority</option>
              <option>Medium Priority</option>
              <option>High Priority</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Pick Deadline
            </Label>
            <DatePickerDemo date={date} setDate={setDate} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Select Category
            </Label>
            <MantineProvider
              withCSSVariables
              withGlobalStyles
              withNormalizeCSS
              // theme={{
              //   colorScheme: "dark",
              //   primaryColor: "bg-base-100",
              //   colors: {
              //     "bg-base-100": ["#000"],
              //   },
              // }}
            >
              <MultiSelect
                label="Select Categories"
                itemComponent={DefaultItem}
                disabled={isLoading}
                classNames={{
                  defaultValue: "select select-bordered select-sm",
                  input: "input input-bordered flex mr-4 w-full h-fit py-2",
                  label: "text-base-content",
                  defaultValueLabel:
                    "flex justify-center items-center text-base-content",
                  rightSection: "ml-4",
                  dropdown: "bg-base-100 text-base-content border-1 ",
                  // item: "text-base-content bg-base-100 hover:bg-base-200 visited:bg-base-200 focus:bg-base-200 active:bg-base-200",
                  // itemsWrapper:
                  //   "text-base-content bg-base-100 hover:bg-base-200 ",
                  wrapper: "text-base-content bg-base-100 hover:bg-base-200",
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
            </MantineProvider>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="submit"
              onClick={() => {
                mutate({
                  title: taskData.title,
                  description: taskData.description,
                  date: taskData.date,
                  priority: taskData.priority,
                  categories: taskData.categories,
                });
              }}
              disabled={isLoading}
            >
              Save changes
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
