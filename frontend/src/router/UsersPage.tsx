import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ProgressSpinner } from "primereact/progressspinner";
import { useMemo } from "react";
import { useQueryGetUsers } from "../hooks/useQueryGetUsers";
import { useQueryMyUserData } from "../hooks/useQueryMyUserData";
import { UnknownObject } from "../types";

type DataValue<U extends Array<UnknownObject> | undefined> =
  keyof NonNullable<U>[number];

export function UsersPage() {
  const { isLoading, data: allUsers } = useQueryGetUsers();
  const { data: myUserData } = useQueryMyUserData();

  const users = useMemo(() => {
    return allUsers?.filter(({ id }) => id !== myUserData?.id);
  }, [allUsers, myUserData?.id]);

  if (isLoading) return <ProgressSpinner />;

  type UserValue = DataValue<typeof users>;
  return (
    <DataTable value={users}>
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
      <Column header="Actions" body={() => 42} />
    </DataTable>
  );
}
