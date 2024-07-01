import { and, eq } from "drizzle-orm";
import { isUndefined, omitBy } from "lodash";
import { z } from "zod";
import { bookings } from "../db/schema.js";
import { adminProcedure, authedProcedure, trpc } from "../trcp/trpc.js";
import { omit } from "../utils/omit.js";

export const bookingRouter = trpc.router({
  getAllBookings: adminProcedure.query(async (opts) => {
    const {
      ctx: { db },
    } = opts;
    const allBookings = await db.query.bookings.findMany({
      orderBy: (booking, { desc }) => [desc(booking.timestamp)],
      with: {
        user: { columns: { username: true } },
        projects: { columns: { name: true } },
      },
    });
    return allBookings;
  }),
  getMyBookings: authedProcedure.query(async (opts) => {
    const {
      ctx: { db, user },
    } = opts;
    const myBookings = await db.query.bookings.findMany({
      where: (booking, { eq }) => eq(booking.userId, user.id),
      columns: { userId: false },
      orderBy: (booking, { desc }) => [desc(booking.timestamp)],
      with: {
        user: { columns: { username: true } },
        projects: { columns: { name: true } },
      },
    });
    return myBookings;
  }),
  createBooking: authedProcedure
    .input(
      z.object({
        timestamp: z.string(),
        projectId: z.number(),
        distance: z.number(),
      }),
    )
    .mutation(async (opts) => {
      const {
        input,
        ctx: { db, user },
      } = opts;
      const newBooking = await db
        .insert(bookings)
        .values({
          userId: user.id,
          distance: input.distance,
          projectId: input.projectId,
          timestamp: input.timestamp,
        })
        .returning();

      const project = await db.query.projects.findFirst({
        columns: { name: true },
        where: (project, { eq }) => eq(project.id, input.projectId),
      });

      return { ...newBooking[0]!, projectName: project?.name };
    }),
  editMyBooking: authedProcedure
    .input(
      z.object({
        id: z.number(),
        projectId: z.optional(z.number()),
        distance: z.optional(z.number()),
        timestamp: z.optional(z.string()),
      }),
    )
    .mutation(async (opts) => {
      const {
        input,
        ctx: { db, user },
      } = opts;

      const changedValues = omitBy(omit(input, "id"), isUndefined);
      const newBooking = await db
        .update(bookings)
        .set(changedValues)
        .where(and(eq(bookings.userId, user.id), eq(bookings.id, input.id)))
        .returning();
      return newBooking[0]!;
    }),
  deleteMyBooking: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async (opts) => {
      const {
        ctx: { db, user },
        input,
      } = opts;

      const deletedBooking = await db
        .delete(bookings)
        .where(and(eq(bookings.id, input.id), eq(bookings.userId, user.id)))
        .returning();
      return deletedBooking[0]!;
    }),
  deleteBooking: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async (opts) => {
      const {
        ctx: { db },
        input,
      } = opts;

      const deletedBooking = await db
        .delete(bookings)
        .where(eq(bookings.id, input.id))
        .returning();
      return deletedBooking[0]!;
    }),
});
