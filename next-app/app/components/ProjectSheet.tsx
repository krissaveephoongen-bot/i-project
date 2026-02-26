import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import ProjectForm from "./ProjectForm";
import { Project } from "../lib/projects";

interface ProjectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSave: (data: Partial<Project>) => Promise<void> | void;
}

export default function ProjectSheet({
  isOpen,
  onClose,
  project,
  onSave,
}: ProjectSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90vw] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {project ? "แก้ไขโครงการ" : "สร้างโครงการใหม่"}
          </SheetTitle>
          <SheetDescription>
            {project
              ? "แก้ไขรายละเอียดโครงการและงวดงาน"
              : "กรอกข้อมูลเพื่อสร้างโครงการใหม่"}
          </SheetDescription>
        </SheetHeader>
        <ProjectForm
          project={project || null}
          onSave={async (data) => {
            await onSave(data);
            onClose();
          }}
          onCancel={onClose}
        />
      </SheetContent>
    </Sheet>
  );
}
