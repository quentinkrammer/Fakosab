import { css } from "goober";
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
import { useDeleteProjectMutation } from "../hooks/useDeleteProjectMutation";
import { useNewProjectMutation } from "../hooks/useNewProjectMutation";
import { useQueryGetProjects } from "../hooks/useQueryGetProjects";
import { useSetProjectDisabledMutation } from "../hooks/useSetProjectDisabledMutation";
import { ButtonEvent, RouterOutput, UnknownObject } from "../types";

type DataValue<U extends Array<UnknownObject> | undefined> =
  keyof NonNullable<U>[number];

type ProjectsValue = DataValue<RouterOutput["projects"]["getProjects"]>;

export function ProjectsPage() {
  const { isLoading, data: projects } = useQueryGetProjects();
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);

  const onHide = useCallback(() => setShowAddProjectDialog(false), []);
  const onAdd = useCallback(() => setShowAddProjectDialog(true), []);

  if (isLoading) return <ProgressSpinner />;

  return (
    <>
      <DataTable value={projects} header={<TableHeader onAddUser={onAdd} />}>
        <Column field={"name" satisfies ProjectsValue} header="Name" sortable />
        <Column
          header="Is Active"
          sortable
          body={(props) =>
            !(props as RouterOutput["projects"]["getProjects"][number]).disabled
          }
        />
        <Column
          body={(props) => (
            <ProjectContextMenu
              {...(props as RouterOutput["projects"]["getProjects"][number])}
            />
          )}
        />
      </DataTable>
      <AddProjectDialog visible={showAddProjectDialog} onHide={onHide} />
    </>
  );
}
type ProjectContextMenuProps = RouterOutput["projects"]["getProjects"][number];
const ProjectContextMenu = memo(function ProjectContextMenu({
  id,
  disabled,
  name,
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
            onClick: (e: ButtonEvent) => {
              onToggleAvailability(e);
            },
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

type AddUserDialogProps = Pick<DialogProps, "onHide" | "visible">;
const AddProjectDialog = memo(function AddUserDialog({
  onHide,
  visible,
}: AddUserDialogProps) {
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
