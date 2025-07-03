import {
  createGroup,
  deleteGroup,
  getGroups,
  GroupType,
  updateGroup,
} from "@/src/api/groupAPI";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface GroupState {
  groups: GroupType[];
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groups: [],
  loading: false,
  error: null,
};

export const getGroupsStore = createAsyncThunk(
  "group/getGroups",
  async ({ userId }: { userId: string }, { rejectWithValue }) => {
    try {
      const groups = await getGroups(userId);
      return groups;
    } catch (error: any) {
      return rejectWithValue(error.message || "Lỗi khi lấy nhóm");
    }
  }
);
export const createGroupStore = createAsyncThunk(
  "group/createGroup",
  async (
    { userId, name }: { userId: string; name: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await createGroup(userId, name);
      dispatch(getGroupsStore({ userId }));
    } catch (error: any) {
      return rejectWithValue(error.message || "Lỗi khi tạo nhóm");
    }
  }
);

export const updateGroupStore = createAsyncThunk(
  "group/updateGroup",
  async (
    {
      userId,
      groupId,
      name,
    }: { userId: string; groupId: string; name: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await updateGroup(userId, groupId, name);
      dispatch(getGroupsStore({ userId }));
      return { id: groupId, name };
    } catch (error: any) {
      return rejectWithValue(error.message || "Lỗi khi cập nhật nhóm");
    }
  }
);

export const deleteGroupStore = createAsyncThunk(
  "group/deleteGroup",
  async (
    { userId, groupId }: { userId: string; groupId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await deleteGroup(userId, groupId);
      dispatch(getGroupsStore({ userId }));
      return { id: groupId };
    } catch (error: any) {
      return rejectWithValue(error.message || "Lỗi khi xoá nhóm");
    }
  }
);

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGroupsStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGroupsStore.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(getGroupsStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createGroupStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(createGroupStore.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.groups.push(action.payload);
      // })
      .addCase(createGroupStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateGroupStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroupStore.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.groups.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.groups[index].name = action.payload.name;
        }
      })
      .addCase(updateGroupStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteGroupStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroupStore.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = state.groups.filter((g) => g.id !== action.payload.id);
      })
      .addCase(deleteGroupStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetError } = groupSlice.actions;
export default groupSlice.reducer;
