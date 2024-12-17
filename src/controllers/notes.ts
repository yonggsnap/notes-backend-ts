import { Request, Response, Router } from "express";
import validator from "../utils/validator";
import { prisma } from "../utils/db";

const notesRouter = Router();

// GET all notes
notesRouter.get("/", async (_req: Request, res: Response) => {
  const notes = await prisma.note.findMany();
  res.json(notes);
});

// GET a specific note
notesRouter.get("/:id", async (req: Request, res: Response) => {
  const matchingNote = await prisma.note.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  matchingNote
    ? res.json(matchingNote)
    : res.status(404).json({ error: "Cannot find note with that id" }).end();
});

// CREATE a new note
notesRouter.post("/", async (req, res: Response) => {
  const validatedObject = validator.newNote(req.body);

  if (validatedObject) {
    const newNote = await prisma.note.create({
      data: {
        content: validatedObject.content,
        important: validatedObject.important
          ? validatedObject.important
          : false,
      },
    });
    res.status(201).json(newNote);
  }
});

// DELETE a note
notesRouter.delete("/:id", async (req, res) => {
  const deletedNote = await prisma.note.delete({
    where: {
      id: Number(req.params.id),
    },
  });

  res.status(204).json(deletedNote);
});

// UPDATE a note
notesRouter.put("/:id", async (req: Request, res: Response) => {
  const validatedObject = validator.newNote(req.body);
  const updateNote = await prisma.note.update({
    where: {
      id: Number(req.params.id),
    },
    data: {
      content: validatedObject.content,
      important: validatedObject.important,
    },
  });

  if (!updateNote) {
    res.status(404).json({ error: "cannot find note with that id" });
  }

  res.status(201).json(updateNote);
});

export default notesRouter;
