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
  loadingMoreGroup: boolean;
  hasMoreGroup: boolean;
}
const initialState: GroupState = {
  groups: [],
  loadingGroup: false,
  error: null,
  lastCreatedAt: null,
  loadingMoreGroup: false,
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
    { rejectWithValue }
  ) => {
    try {
      const newGroup = await createGroup(userId, name);
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
    { rejectWithValue }
  ) => {
    try {
      await updateGroup(userId, groupId, name);
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
    { rejectWithValue }
  ) => {
    try {
      await deleteGroup(userId, groupId);
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
      state.loadingGroup = false;
      state.loadingMoreGroup = false;
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
      .addCase(getGroupsStore.pending, (state, action) => {
        if (action.meta.arg.lastCreatedAt) {
          state.loadingMoreGroup = true;
        } else {
          state.loadingGroup = true;
        }
        state.error = null;
      })
      .addCase(getGroupsStore.fulfilled, (state, action) => {
        state.loadingGroup = false;
        state.loadingMoreGroup = false;

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
        state.loadingMoreGroup = false;
        state.error = action.payload as string;
      })

      // Create Group
      .addCase(createGroupStore.pending, (state) => {
        state.loadingGroup = true;
        state.error = null;
      })
      .addCase(createGroupStore.fulfilled, (state, action) => {
        state.loadingGroup = false;
        state.groups.unshift(action.payload);
      })
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
