import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getNotes, getNotesPaginate, NoteType } from "../../api/noteAPI";

interface NoteState {
  notes: NoteType[];
  loading: boolean;
  error: string | null;
  lastDoc: any | null;
}

const initialState: NoteState = {
  notes: [],
  loading: false,
  error: null,
  lastDoc: null,
};

// Thunks
export const fetchNotes = createAsyncThunk(
  "note/fetchNotes",
  async ({ userId, groupId }: { userId: string; groupId?: string }) => {
    const notes = await getNotes(userId, groupId);
    return notes;
  }
);

export const fetchNotesPaginate = createAsyncThunk(
  "note/fetchNotesPaginate",
  async (
    {
      userId,
      limitCount,
      lastDoc,
    }: { userId: string; limitCount?: number; lastDoc?: any },
    { getState }
  ) => {
    const res = await getNotesPaginate(userId, limitCount, lastDoc);
    return res;
  }
);

const noteSlice = createSlice({
  name: "note",
  initialState,
  reducers: {
    resetNotes: (state) => {
      state.notes = [];
      state.lastDoc = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notes
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.notes = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching notes";
      })

      // Fetch Notes Paginate
      .addCase(fetchNotesPaginate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotesPaginate.fulfilled, (state, action) => {
        state.notes = [...state.notes, ...action.payload.notes];
        state.lastDoc = action.payload.lastDoc;
        state.loading = false;
      })
      .addCase(fetchNotesPaginate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching more notes";
      });
  },
});

export const { resetNotes } = noteSlice.actions;
export default noteSlice.reducer;
