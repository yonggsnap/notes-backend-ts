
export interface NoteTable {
  id: Generated<number>;
  content: string;
  important: boolean;
  user: string;
}

export type NewNote = Pick<Note, 'content' | 'important'>;

export interface User {
  id: string;
  username: string;
  name: string;
  password: string;
}

export type NewUser = Omit<User, 'id'>;

