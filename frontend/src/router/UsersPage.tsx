import { css } from "goober";
import { Button, ButtonProps } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { DataTable } from "primereact/datatable";
import { Dialog, DialogProps } from "primereact/dialog";
import { InputText, InputTextProps } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  ChangeEvent,
  ChangeEventHandler,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { LabeledInput } from "../components/LabeledInput";
import { useDeleteUserMutation } from "../hooks/useDeleteUserMutation";
import { useNewUserMutation } from "../hooks/useNewUserMutation";
import { useQueryGetUsers } from "../hooks/useQueryGetUsers";
import { useQueryMyUserData } from "../hooks/useQueryMyUserData";
import { useResetPasswordMutation } from "../hooks/useResetPasswordMutation";
import { ButtonEvent, RouterOutput, UnknownObject } from "../types";

type DataValue<U extends Array<UnknownObject> | undefined> =
  keyof NonNullable<U>[number];

type UserValue = DataValue<RouterOutput["users"]["getUsers"]>;

export function UsersPage() {
  const { isLoading, data: allUsers } = useQueryGetUsers();
  const { data: myUserData } = useQueryMyUserData();
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [filter, setFilter] = useState("");

  const onHide = useCallback(() => setShowAddUserDialog(false), []);
  const onFilter = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => setFilter(e.target.value),
    [],
  );

  const users = useMemo(() => {
    return allUsers?.filter(({ id }) => id !== myUserData?.id);
  }, [allUsers, myUserData?.id]);

  if (isLoading) return <ProgressSpinner />;

  return (
    <>
      <DataTable
        value={users}
        header={
          <UserTableHeader
            filterValue={filter}
            onFilter={onFilter}
            onAddUser={() => setShowAddUserDialog(true)}
          />
        }
        globalFilterMatchMode="contains"
        globalFilterFields={["username" satisfies UserValue]}
        globalFilter={filter}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 100]}
      >
        <Column
          field={"username" satisfies UserValue}
          header="Username"
          sortable
        />
        <Column
          field={"resetPassword" satisfies UserValue}
          header="PW-Reset Code"
          sortable
        />
        <Column
          body={(d) => (
            <UserContextMenu
              id={(d as RouterOutput["users"]["getUsers"][number]).id}
              username={
                (d as RouterOutput["users"]["getUsers"][number]).username
              }
            />
          )}
        />
      </DataTable>
      <AddUserDialog visible={showAddUserDialog} onHide={onHide} />
    </>
  );
}
type UserContextMenuProps = Pick<
  RouterOutput["users"]["getUsers"][number],
  "id" | "username"
>;
const UserContextMenu = memo(function UserContextMenu({
  id,
  username,
}: UserContextMenuProps) {
  const menuRef = useRef<Menu>(null!);
  const resetPwMutation = useResetPasswordMutation();
  const deleteUserMutation = useDeleteUserMutation();

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
          label: "Reset password",
          icon: "pi pi-refresh",
          template: itemRenderer,
          data: {
            onClick: (e: ButtonEvent) => {
              confirmPopup({
                target: e.currentTarget,
                message: "Do you want to reset this users password?",
                icon: "pi pi-exclamation-triangle",
                defaultFocus: "reject",
                accept: () => onConfirmPwReset(e),
              });
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
                message: `Do you want to permanently delete the user "${username}"?`,
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
    deleteUserMutation.mutate({ userId: id });
    menuRef.current.toggle(e);
  };

  const onConfirmPwReset = (e: ButtonEvent) => {
    resetPwMutation.mutate({ userId: id });
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
const AddUserDialog = memo(function AddUserDialog({
  onHide,
  visible,
}: AddUserDialogProps) {
  const [newUsername, setNewUsername] = useState("");

  const onSuccess = useCallback(() => {
    setNewUsername("");
    onHide();
  }, [onHide]);
  const mutation = useNewUserMutation(onSuccess);

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setNewUsername(e.target.value);

  const onSubmit = () => {
    mutation.mutate({ username: newUsername });
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={"Create new username"}
      contentStyle={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <LabeledInput
        value={newUsername}
        onChange={onChange}
        label="New username"
      />
      <Button
        style={{ alignSelf: "end" }}
        onClick={onSubmit}
        disabled={!newUsername}
      >
        Submit
      </Button>
    </Dialog>
  );
});

type UserTableHeaderProps = {
  filterValue: InputTextProps["value"];
  onFilter: InputTextProps["onChange"];
  onAddUser: ButtonProps["onClick"];
};
function UserTableHeader({
  filterValue,
  onFilter,
  onAddUser,
}: UserTableHeaderProps) {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <InputText
        placeholder="Search username"
        value={filterValue}
        onChange={onFilter}
      />
      <Button style={{ marginLeft: "auto" }} onClick={onAddUser}>
        Add user
      </Button>
    </div>
  );
}

const styles = { menuButton: css({ width: "100%" }) };
