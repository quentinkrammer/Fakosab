import { TRPCClientErrorLike } from "@trpc/client";
import { capitalize } from "lodash";
import { PAGES } from "../constants";

export function UniqueBookingConstraintError({
  error,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: TRPCClientErrorLike<any>;
}) {
  const isUiqueConstraintError = error.message.includes(
    "UNIQUE constraint failed",
  );
  if (!isUiqueConstraintError) return error.data?.code;

  return (
    <>
      <div>{"You can only make one booking per project and day."}</div>
      <br />
      <div>{`You can edit prior bookings on the ${capitalize(PAGES.history)}-Page`}</div>
    </>
  );
}
