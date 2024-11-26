import NoteModel from '../../models/note';

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
  },
];

const nonExistingId = async () => {
  const note = new NoteModel({
    content: 'willremovethissoon',
  });
  await note.save();
  await note.deleteOne();
  return note._id.toString();
};

const notesInDb = async () => {
  const notes = await NoteModel.find({});
  return notes.map((n) => n.toJSON());
};

export default {
  initialNotes,
  nonExistingId,
  notesInDb,
};
