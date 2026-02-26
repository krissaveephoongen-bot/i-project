import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import TaskForm from "./TaskForm";
import { Task } from "@/lib/tasks";

interface TaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  projectId: string;
  onSave: (data: any) => Promise<void>;
  projects?: Array<{ id: string; name: string }>;
  users?: Array<{ id: string; name: string }>;
  milestones?: Array<{ id: string; title: string }>;
}

export default function TaskSheet({
  isOpen,
  onClose,
  task,
  projectId,
  onSave,
  projects = [],
  users = [],
  milestones = [],
}: TaskSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90vw] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {task ? "แก้ไขงาน" : "สร้างงานใหม่"}
          </SheetTitle>
          <SheetDescription>
            {task
              ? "แก้ไขรายละเอียดงานและสถานะ"
              : "กรอกข้อมูลเพื่อสร้างงานใหม่ในโครงการ"}
          </SheetDescription>
        </SheetHeader>
        <TaskForm
          task={task}
          isOpen={true} // Always true inside sheet
          onClose={onClose}
          onSave={onSave}
          projects={projects}
          users={users}
          milestones={milestones}
          projectId={projectId} // Pass projectId for default selection
        />
      </SheetContent>
    </Sheet>
  );
}
