/* eslint-disable @typescript-eslint/no-misused-promises */
import { Request, Response, Router } from 'express';
import NoteModel from '../models/note';
import ts_utils from '../utils/ts_utils';

const notesRouter = Router();

// GET all notes
notesRouter.get('/', async (_req: Request, res: Response ) => {
  const notes = await NoteModel
    .find({})
    .populate('user' ,{ notes: 0 });
  res.json(notes);
});

// GET a specific note given id
notesRouter.get('/:id', async (req: Request, res: Response) => {
  const matchingNote = await NoteModel.findById(req.params.id);
  matchingNote
    ? res.json(matchingNote)
    : res.status(404).json({ error: 'Cannot find note with that id'}).end();
});

// CREATE a new note
notesRouter.post('/', async (req: Request, res: Response) => {
  const validatedObject = ts_utils.validateNewNote(req.body);

  // Get token from request
  if (!req.token) {
    return res.status(401).json({ error: 'token not found!'});
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const user = req.user;

  if (user) {
    const newNote = new NoteModel({
      content: validatedObject.content,
      important: validatedObject.important ? validatedObject.important : false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user: user.id
    });

    const savedNote = await newNote.save();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    user.notes = user.notes.concat(savedNote._id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await user.save();
    return res.status(201).json(savedNote);
  }

  return res.status(400).json({ error: 'user not found'});
});

// DELETE a note
notesRouter.delete('/:id', async (req: Request, res: Response ) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const user = req.user;
  const noteToDelete = await NoteModel.findById(req.params.id);

  if (!noteToDelete) {
    return res.status(404).json({ error: 'cannot find note with that id'});
  }

  if (noteToDelete.user!.toString() !== user.id) {
    return res.status(401).json({ error: 'invalid user!'});
  } else {
    await NoteModel.findByIdAndDelete(req.params.id);
    return res.status(204).end();
  }
});

// UPDATE a note
notesRouter.put('/:id', async (req: Request, res: Response ) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const user = req.user;
  const noteToUpdate = await NoteModel.findById(req.params.id);

  if (!noteToUpdate) {
    return res.status(404).json({ error: 'cannot find note with that id'});
  }

  if (noteToUpdate.user!.toString() !== user.id) {
    return res.status(401).json({ error: 'invalid user!'});
  }
  const { content, important } = ts_utils.validateNewNote(req.body);

  const toUpdateNote = {
    content, important
  };

  const updatedNote = await NoteModel.findByIdAndUpdate(req.params.id, toUpdateNote, {new: true, runValidators: true, context: 'query' });
  return res.status(201).json(updatedNote);

});

export default notesRouter;