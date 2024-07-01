import { css } from "goober";
import { Button, ButtonProps } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { DataTable } from "primereact/datatable";
import { Dialog, DialogProps } from "primereact/dialog";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { ProgressSpinner } from "primereact/progressspinner";
import { memo, useCallback, useRef, useState } from "react";
import { BookingForm } from "../components/BookingForm";
import { useDeleteMyBookingMutation } from "../hooks/useDeleteMyBookingMutation";
import { useQueryGetMyBookings } from "../hooks/useQueryGetMyBookings";
import { Booking, BookingValue, ButtonEvent } from "../types";

export function HistoryPage() {
  const { isLoading, data: bookings } = useQueryGetMyBookings();
  const [showEditBookingDialog, setEditBookingDialog] = useState(false);

  const onHide = useCallback(() => setEditBookingDialog(false), []);

  if (isLoading) return <ProgressSpinner />;

  return (
    <>
      <DataTable
        value={bookings}
        header={<TableHeader onAddBooking={() => setEditBookingDialog(true)} />}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 100]}
      >
        <Column field={"id" satisfies BookingValue} header="ID" sortable />
        <Column field={"projects.name"} header="Project" sortable />
        <Column
          field={"distance" satisfies BookingValue}
          header="Distance (km)"
          sortable
          body={(d) => `${(d as Booking).distance / 1000}`}
        />
        <Column
          field={"timestamp" satisfies BookingValue}
          header="Date"
          sortable
        />
        <Column body={(d) => <BookingContextMenu id={(d as Booking).id} />} />
      </DataTable>
      <AddBookingDialog visible={showEditBookingDialog} onHide={onHide} />
    </>
  );
}

type UserContextMenuProps = Pick<Booking, "id">;
const BookingContextMenu = memo(function BookingContextMenu({
  id,
}: UserContextMenuProps) {
  const menuRef = useRef<Menu>(null!);
  const deleteBooking = useDeleteMyBookingMutation();

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
          label: "Delete",
          icon: "pi pi-trash",
          template: itemRenderer,
          data: {
            onClick: (e: ButtonEvent) => {
              confirmPopup({
                target: e.currentTarget,
                message: `Do you want to permanently delete the Booking with ID "${id}"?`,
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
    deleteBooking.mutate({ id });
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

type AddBookingDialogProps = Pick<DialogProps, "onHide" | "visible">;
const AddBookingDialog = memo(function AddUserDialog({
  onHide,
  visible,
}: AddBookingDialogProps) {
  const onSuccess = useCallback(() => {
    onHide();
  }, [onHide]);

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={"Create new booking"}
      contentStyle={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        paddingTop: "2rem",
      }}
    >
      <BookingForm onSuccess={onSuccess} />
    </Dialog>
  );
});

type TableHeaderProps = {
  onAddBooking: ButtonProps["onClick"];
};
function TableHeader({ onAddBooking }: TableHeaderProps) {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <Button style={{ marginLeft: "auto" }} onClick={onAddBooking}>
        Add booking
      </Button>
    </div>
  );
}

const styles = { menuButton: css({ width: "100%" }) };
