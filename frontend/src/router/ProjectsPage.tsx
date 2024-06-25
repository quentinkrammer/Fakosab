import { css } from "goober";
import { isNil } from "lodash";
import { Button, ButtonProps } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { DataTable } from "primereact/datatable";
import { Dialog, DialogProps } from "primereact/dialog";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { ProgressSpinner } from "primereact/progressspinner";
import { ChangeEvent, memo, useCallback, useRef, useState } from "react";
import { LabeledInput } from "../components/LabeledInput";
import { STRING_NOT_FOUND } from "../constants";
import { useDeleteProjectMutation } from "../hooks/useDeleteProjectMutation";
import { useNewProjectMutation } from "../hooks/useNewProjectMutation";
import { useQueryGetProjects } from "../hooks/useQueryGetProjects";
import { useRenameProjectMutation } from "../hooks/useRenameProjectMutation";
import { useSetProjectDisabledMutation } from "../hooks/useSetProjectDisabledMutation";
import { ButtonEvent, RouterOutput, UnknownObject } from "../types";

type DataValue<U extends Array<UnknownObject> | undefined> =
  keyof NonNullable<U>[number];

type ProjectsValue = DataValue<RouterOutput["projects"]["getProjects"]>;
type Project = RouterOutput["projects"]["getProjects"][number];
type ProjectShort = Pick<Project, "id" | "name">;

export function ProjectsPage() {
  const { isLoading, data: projects } = useQueryGetProjects();
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  const [showRenameProjectDialog, setShowRenameProjectDialog] =
    useState<ProjectShort>();

  const onHideAddDialog = useCallback(() => setShowAddProjectDialog(false), []);
  const onHideRenameDialog = useCallback(
    () => setShowRenameProjectDialog(undefined),
    [],
  );
  const onOpenRenameDialog = useCallback(
    (project: ProjectShort) => setShowRenameProjectDialog(project),
    [],
  );
  const onAdd = useCallback(() => setShowAddProjectDialog(true), []);

  if (isLoading) return <ProgressSpinner />;

  return (
    <>
      <DataTable value={projects} header={<TableHeader onAddUser={onAdd} />}>
        <Column field={"name" satisfies ProjectsValue} header="Name" sortable />
        <Column
          header="Is Active"
          field={"disabled" satisfies ProjectsValue}
          sortable
          body={(props) =>
            !(props as RouterOutput["projects"]["getProjects"][number]).disabled
          }
        />
        <Column
          body={(props) => (
            <ProjectContextMenu
              {...(props as Project)}
              onOpenRenameForm={onOpenRenameDialog}
            />
          )}
        />
      </DataTable>
      <AddDialog visible={showAddProjectDialog} onHide={onHideAddDialog} />
      <RenameDialog
        onHide={onHideRenameDialog}
        id={showRenameProjectDialog?.id}
        name={showRenameProjectDialog?.name}
      />
    </>
  );
}
type ProjectContextMenuProps = Project & {
  onOpenRenameForm: (project: { id: number; name: string }) => void;
};
const ProjectContextMenu = memo(function ProjectContextMenu({
  id,
  name,
  disabled,
  onOpenRenameForm,
}: ProjectContextMenuProps) {
  const menuRef = useRef<Menu>(null!);
  const disabledMutation = useSetProjectDisabledMutation();
  const deleteMutation = useDeleteProjectMutation();

  const itemRenderer = (item: MenuItem) => {
    return (
      <Button
        icon={item.icon}
        label={item.label}
        onClick={item.data["onClick"]}
        text
        className={styles.menuButton}
      />
    );
  };

  const items: MenuItem[] = [
    {
      label: "Options",
      items: [
        {
          label: disabled ? "Enable" : "Disable",
          icon: disabled ? "pi pi-check-circle" : "pi pi-ban",
          template: itemRenderer,
          data: {
            onClick: (e: ButtonEvent) => onToggleAvailability(e),
          },
        },
        {
          label: "Rename",
          icon: "pi pi-file-edit",
          template: itemRenderer,
          data: {
            onClick: () => onOpenRenameForm({ id, name }),
          },
        },
        {
          label: "Delete",
          icon: "pi pi-trash",
          template: itemRenderer,
          data: {
            onClick: (e: ButtonEvent) => {
              confirmPopup({
                target: e.currentTarget,
                message: `Do you want to permanently delete the project "${name}"?`,
                icon: "pi pi-exclamation-triangle",
                defaultFocus: "reject",
                acceptClassName: "p-button-danger",
                acceptLabel: "Delete now",
                accept: () => onConfirmDelete(e),
              });
            },
          },
        },
      ],
    },
  ];

  const onConfirmDelete = (e: ButtonEvent) => {
    deleteMutation.mutate({ id });
    menuRef.current.toggle(e);
  };

  const onToggleAvailability = (e: ButtonEvent) => {
    disabledMutation.mutate({ id, disabled: !disabled });
    menuRef.current.toggle(e);
  };

  return (
    <>
      <Button
        icon="pi pi-ellipsis-h"
        onClick={(e) => menuRef.current.toggle(e)}
        aria-haspopup
        rounded
        text
      />
      <Menu model={items} popup ref={menuRef} />
      <ConfirmPopup />
    </>
  );
});

type AddDialogProps = Pick<DialogProps, "onHide" | "visible">;
const AddDialog = memo(function AddDialog({ onHide, visible }: AddDialogProps) {
  const [newProject, setNewProject] = useState("");

  const onSuccess = useCallback(() => {
    setNewProject("");
    onHide();
  }, [onHide]);
  const mutation = useNewProjectMutation(onSuccess);

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setNewProject(e.target.value);

  const onSubmit = () => {
    mutation.mutate({ name: newProject });
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={"Create new project"}
      contentStyle={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <LabeledInput
        value={newProject}
        onChange={onChange}
        label="New project name"
      />
      <Button
        style={{ alignSelf: "end" }}
        onClick={onSubmit}
        disabled={!newProject}
      >
        Submit
      </Button>
    </Dialog>
  );
});

type RenameDialogProps = Pick<DialogProps, "onHide"> & {
  id: number | undefined;
  name: string | undefined;
};

const RenameDialog = memo(function AddDialog({
  onHide,
  id,
  name,
}: RenameDialogProps) {
  const [newName, setNewName] = useState(name);

  const onSuccess = useCallback(() => onHide(), [onHide]);

  const renameMutation = useRenameProjectMutation({
    name: name ?? STRING_NOT_FOUND,
    onSuccess,
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setNewName(e.target.value);

  const onSubmit = () => {
    if (!newName || isNil(id)) return;
    renameMutation.mutate({ id, name: newName });
  };

  return (
    <Dialog
      visible={!!name}
      onHide={onHide}
      header={`Rename project "${name}"`}
      contentStyle={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <LabeledInput
        value={newName}
        onChange={onChange}
        label="New project name"
      />
      <Button
        style={{ alignSelf: "end" }}
        onClick={onSubmit}
        disabled={!newName || newName === name}
      >
        Submit
      </Button>
    </Dialog>
  );
});

type TableHeaderProps = {
  onAddUser: ButtonProps["onClick"];
};
function TableHeader({ onAddUser }: TableHeaderProps) {
  return (
    <div style={{ display: "flex" }}>
      <Button style={{ marginLeft: "auto" }} onClick={onAddUser}>
        Add project
      </Button>
    </div>
  );
}

const styles = { menuButton: css({ width: "100%" }) };
