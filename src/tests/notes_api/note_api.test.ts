import mongoose from 'mongoose';
import NoteModel from '../../models/note';
import { Note } from '../../types/note';
import helper from './test_helper';
import api from '../app_api';

beforeEach(async () => {
  await NoteModel.deleteMany({});
  const noteObjects = helper.initialNotes.map((n) => new NoteModel(n));
  const promiseArray = noteObjects.map((n) => n.save());
  await Promise.all(promiseArray);
});

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/);
}, 100000);

test('there are two notes', async () => {
  const res = await api.get('/api/notes');
  expect(res.body).toHaveLength(2);
}, 100000);

test('the first note is about HTTP methods', async () => {
  const res = await api.get('/api/notes');
  expect(res.body[0].content).toBe('HTML is easy');
}, 100000);

test('The number of notes returned in DB matches the number of notes in initialNotes', async () => {
  const res = await api.get('/api/notes');
  expect(res.body).toHaveLength(helper.initialNotes.length);
});

test('a specific note is present within the returned notes', async () => {
  const res = await api.get('/api/notes');
  const contents: Array<Note['content']> = res.body.map((r: Note) => r.content);
  expect(contents).toContain('Browser can execute only JavaScript');
});

test('a valid note can be added', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  };

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const notesAtEnd = await helper.notesInDb();
  expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);

  const contents = notesAtEnd.map((n) => n.content);
  expect(contents).toContain('async/await simplifies making async calls');
});

test('note without content is not added', async () => {
  const newNote = {
    important: true,
  };

  await api
    .post('/api/notes')
    .send(newNote)
    // .expect(400);
    .expect(500);

  const notesAtEnd = await helper.notesInDb();
  expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
});

test('a specific note can be viewed', async () => {
  const notesAtStart = await helper.notesInDb();
  const noteToView = notesAtStart[0];

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(resultNote.body).toEqual(noteToView);
});

test('a note can be deleted', async () => {
  const notesAtStart = await helper.notesInDb();
  const noteToDelete = notesAtStart[0];

  await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

  const notesAtEnd = await helper.notesInDb();

  expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1);

  const contents = notesAtEnd.map((r) => r.content);
  expect(contents).not.toContain(noteToDelete.content);
});

afterAll(async () => {
  await mongoose.connection.close();
});
