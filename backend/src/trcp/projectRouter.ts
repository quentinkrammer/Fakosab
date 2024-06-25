import { eq } from "drizzle-orm";
import { z } from "zod";
import { projects } from "../db/schema.js";
import { adminProcedure, authedProcedure, trpc } from "../trcp/trpc.js";

export const projectRouter = trpc.router({
  getProjects: authedProcedure.query(async (opts) => {
    const db = opts.ctx.db;
    const projects = await db.query.projects.findMany();
    return projects;
  }),
  createProject: adminProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async (opts) => {
      const {
        input,
        ctx: { db },
      } = opts;
      const newProject = await db.insert(projects).values({ name: input.name });
      return newProject;
    }),
  renameProject: adminProcedure
    .input(z.object({ id: z.number(), name: z.string() }))
    .mutation(async (opts) => {
      const {
        ctx: { db },
        input,
      } = opts;
      const changedProject = await db
        .update(projects)
        .set({ name: input.name })
        .where(eq(projects.id, input.id))
        .returning();
      return changedProject;
    }),
  setIsDisabled: adminProcedure
    .input(
      z.object({
        id: z.number(),
        disabled: z.boolean(),
      }),
    )
    .mutation(async (opts) => {
      const {
        ctx: { db },
        input,
      } = opts;
      const changedProject = await db
        .update(projects)
        .set({ disabled: input.disabled })
        .where(eq(projects.id, input.id))
        .returning();
      return changedProject;
    }),
  deleteProject: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async (opts) => {
      const {
        ctx: { db },
        input,
      } = opts;

      const deletedProject = await db
        .delete(projects)
        .where(eq(projects.id, input.id))
        .returning();
      return deletedProject[0]!;
    }),
});
