import { css } from "goober";
import { Button, ButtonProps } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog, DialogProps } from "primereact/dialog";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  ChangeEvent,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { LabeledInput } from "../components/LabeledInput";
import { useNewUserMutation } from "../hooks/useNewUserMutation";
import { useQueryGetUsers } from "../hooks/useQueryGetUsers";
import { useQueryMyUserData } from "../hooks/useQueryMyUserData";
import { useResetPasswordMutation } from "../hooks/useResetPasswordMutation";
import { RouterOutput, UnknownObject } from "../types";

type DataValue<U extends Array<UnknownObject> | undefined> =
  keyof NonNullable<U>[number];

type UserValue = DataValue<RouterOutput["getUsers"]>;

export function UsersPage() {
  const { isLoading, data: allUsers } = useQueryGetUsers();
  const { data: myUserData } = useQueryMyUserData();
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);

  const onHide = useCallback(() => setShowAddUserDialog(false), []);

  const users = useMemo(() => {
    return allUsers?.filter(({ id }) => id !== myUserData?.id);
  }, [allUsers, myUserData?.id]);

  if (isLoading) return <ProgressSpinner />;

  return (
    <>
      <DataTable
        value={users}
        header={<UserTableHeader onClick={() => setShowAddUserDialog(true)} />}
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
          header="Actions"
          body={(d) => (
            <UserContextMenu id={(d as RouterOutput["getUsers"][number]).id} />
          )}
        />
      </DataTable>
      <AddUserDialog visible={showAddUserDialog} onHide={onHide} />
    </>
  );
}
type UserContextMenuProps = Pick<RouterOutput["getUsers"][number], "id">;
const UserContextMenu = memo(function UserContextMenu({
  id,
}: UserContextMenuProps) {
  const menuRef = useRef<Menu>(null!);
  const resetPwMutation = useResetPasswordMutation();

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
            onClick: (
              e: Parameters<NonNullable<ButtonProps["onClick"]>>[0],
            ) => {
              resetPwMutation.mutate({ userId: id });
              menuRef.current.toggle(e);
            },
          },
        },
        {
          label: "Delete",
          icon: "pi pi-trash",
          template: itemRenderer,
          data: { onClick: () => console.log("delete") },
        },
      ],
    },
  ];

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

type UserTableHeaderProps = Pick<ButtonProps, "onClick">;
function UserTableHeader({ onClick }: UserTableHeaderProps) {
  return (
    <div style={{ display: "flex" }}>
      <Button style={{ marginLeft: "auto" }} onClick={onClick}>
        Add user
      </Button>
    </div>
  );
}

const styles = { menuButton: css({ width: "100%" }) };
