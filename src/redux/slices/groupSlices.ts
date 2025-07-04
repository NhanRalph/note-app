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
  loadingGroup: boolean;
  error: string | null;
  lastCreatedAt: string | null;
  hasMoreGroup: boolean;
}
const initialState: GroupState = {
  groups: [],
  loadingGroup: false,
  error: null,
  lastCreatedAt: null,
  hasMoreGroup: true,
};

export const getGroupsStore = createAsyncThunk(
  "group/getGroups",
  async (
    {
      userId,
      pageSize,
      lastCreatedAt,
    }: {
      userId: string;
      pageSize: number;
      lastCreatedAt: string | null;
    },
    { rejectWithValue }
  ) => {
    try {
      const { groups, lastCreatedAt: newLastCreatedAt } = await getGroups(
        userId,
        pageSize,
        lastCreatedAt
      );
      return {
        groups,
        lastCreatedAt: newLastCreatedAt,
      };
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
      const newGroup = await createGroup(userId, name);
      dispatch(getGroupsStore({ userId, pageSize: 10, lastCreatedAt: null }));
      return newGroup;
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
      dispatch(getGroupsStore({ userId, pageSize: 10, lastCreatedAt: null }));
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
      dispatch(getGroupsStore({ userId, pageSize: 10, lastCreatedAt: null }));
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
    resetGroupState(state) {
      state.groups = [];
      state.lastCreatedAt = null;
      state.hasMoreGroup = true;
      state.error = null;
    },
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Groups (pagination)
      .addCase(getGroupsStore.pending, (state) => {
        state.loadingGroup = true;
        state.error = null;
      })
      .addCase(getGroupsStore.fulfilled, (state, action) => {
        state.loadingGroup = false;

        if (action.meta.arg.lastCreatedAt) {
          state.groups = [...state.groups, ...action.payload.groups];
        } else {
          state.groups = action.payload.groups;
        }

        state.lastCreatedAt = action.payload.lastCreatedAt;
        state.hasMoreGroup = action.payload.groups.length > 0;
      })
      .addCase(getGroupsStore.rejected, (state, action) => {
        state.loadingGroup = false;
        state.error = action.payload as string;
      })

      // Create Group
      .addCase(createGroupStore.pending, (state) => {
        state.loadingGroup = true;
        state.error = null;
      })
      // .addCase(createGroupStore.fulfilled, (state, action) => {
      //   state.loadingGroup = false;
      //   state.groups = [action.payload, ...state.groups];
      // })
      .addCase(createGroupStore.rejected, (state, action) => {
        state.loadingGroup = false;
        state.error = action.payload as string;
      })

      // Update Group
      .addCase(updateGroupStore.pending, (state) => {
        state.loadingGroup = true;
        state.error = null;
      })
      .addCase(updateGroupStore.fulfilled, (state, action) => {
        state.loadingGroup = false;
        const index = state.groups.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.groups[index].name = action.payload.name;
        }
      })
      .addCase(updateGroupStore.rejected, (state, action) => {
        state.loadingGroup = false;
        state.error = action.payload as string;
      })

      // Delete Group
      .addCase(deleteGroupStore.pending, (state) => {
        state.loadingGroup = true;
        state.error = null;
      })
      .addCase(deleteGroupStore.fulfilled, (state, action) => {
        state.loadingGroup = false;
        state.groups = state.groups.filter((g) => g.id !== action.payload.id);
      })
      .addCase(deleteGroupStore.rejected, (state, action) => {
        state.loadingGroup = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetGroupState, resetError } = groupSlice.actions;
export default groupSlice.reducer;
