import {
  createGroup,
  deleteGroup,
  getGroups,
  getNoteStats,
  GroupType,
  updateGroup,
} from "@/src/api/groupAPI";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
interface GroupState {
  groups: GroupType[];
  loadingGroup: boolean;
  virtualGroups: GroupType[];
  error: string | null;
  lastOrder: number | null;
  loadingMoreGroup: boolean;
  hasMoreGroup: boolean;
}
const initialState: GroupState = {
  groups: [],
  virtualGroups: [
    { id: "all", name: "Tất cả", createdAt: "", noteCount: 0, order: 0 },
    { id: "pinned", name: "Ghim", createdAt: "", noteCount: 0, order: 0 },
    { id: "locked", name: "Đã khoá", createdAt: "", noteCount: 0, order: 0 },
  ],
  loadingGroup: false,
  error: null,
  lastOrder: null,
  loadingMoreGroup: false,
  hasMoreGroup: true,
};

export const getGroupsStore = createAsyncThunk(
  "group/getGroups",
  async (
    {
      userId,
      pageSize,
      lastOrder,
    }: {
      userId: string;
      pageSize: number;
      lastOrder: number | null;
    },
    { rejectWithValue }
  ) => {
    try {
      const { groups, lastOrder: newLastCreatedAt } = await getGroups(
        userId,
        pageSize,
        lastOrder
      );

      console.log("Fetched groups:", groups);
      return {
        groups,
        lastOrder: newLastCreatedAt,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Lỗi khi lấy nhóm");
    }
  }
);

export const getNoteStatsStore = createAsyncThunk(
  "group/getNoteStats",
  async ({ userId }: { userId: string }, { rejectWithValue }) => {
    try {
      const stats = await getNoteStats(userId);
      return stats; // { all: x, pinned: y, locked: z }
    } catch (error: any) {
      return rejectWithValue(error.message || "Lỗi khi lấy thống kê ghi chú");
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
      state.virtualGroups = [
        { id: "all", name: "Tất cả", createdAt: "", noteCount: 0, order: 0 },
        { id: "pinned", name: "Ghim", createdAt: "", noteCount: 0, order: 0 },
        {
          id: "locked",
          name: "Đã khoá",
          createdAt: "",
          noteCount: 0,
          order: 0,
        },
      ];
      state.lastOrder = null;
      state.loadingGroup = false;
      state.loadingMoreGroup = false;
      state.hasMoreGroup = true;
      state.error = null;
    },
    resetError(state) {
      state.error = null;
    },
    changeNoteStats(
      state,
      action: {
        payload: {
          target: "all" | "pinned" | "locked";
          type: "increment" | "decrement";
        };
      }
    ) {
      const { target, type } = action.payload;
      state.virtualGroups = state.virtualGroups.map((group) => {
        if (group.id === target) {
          group.noteCount += type === "increment" ? 1 : -1;
          group.noteCount = Math.max(0, group.noteCount);
        }
        return group;
      });
    },

    // ✅ Tăng/giảm nhiều loại cùng lúc
    batchChangeNoteStats(
      state,
      action: {
        payload: {
          target: "all" | "pinned" | "locked";
          type: "increment" | "decrement";
        }[];
      }
    ) {
      action.payload.forEach(({ target, type }) => {
        const group = state.virtualGroups.find((g) => g.id === target);
        if (group) {
          group.noteCount += type === "increment" ? 1 : -1;
          group.noteCount = Math.max(0, group.noteCount);
        }
      });
    },

    // tăng / giảm nhiều pinned / locked truyền số vào
    adjustNoteStatsFromUpdate(
      state,
      action: {
        payload: {
          allChange: number;
          pinnedChange: number;
          lockedChange: number;
        };
      }
    ) {
      const { allChange, pinnedChange, lockedChange } = action.payload;
      const allGroup = state.virtualGroups.find((g) => g.id === "all");
      if (allGroup) {
        allGroup.noteCount += allChange;
        allGroup.noteCount = Math.max(0, allGroup.noteCount);
      }

      const pinnedGroup = state.virtualGroups.find((g) => g.id === "pinned");
      if (pinnedGroup) {
        pinnedGroup.noteCount += pinnedChange;
        pinnedGroup.noteCount = Math.max(0, pinnedGroup.noteCount);
      }

      const lockedGroup = state.virtualGroups.find((g) => g.id === "locked");
      if (lockedGroup) {
        lockedGroup.noteCount += lockedChange;
        lockedGroup.noteCount = Math.max(0, lockedGroup.noteCount);
      }
    },

    increaseNoteCount(state, action: { payload: { groupId: string } }) {
      const { groupId } = action.payload;

      // Tăng nhóm thực (groupId cụ thể)
      const targetGroup = state.groups.find((g) => g.id === groupId);
      if (targetGroup) {
        targetGroup.noteCount += 1;
      }

      // Tăng nhóm ảo "all"
      const allGroup = state.virtualGroups.find((g) => g.id === "all");
      if (allGroup) {
        allGroup.noteCount += 1;
      }
    },
    moveNoteToAnotherGroup(
      state,
      action: { payload: { fromGroupId: string; toGroupId: string } }
    ) {
      const { fromGroupId, toGroupId } = action.payload;

      // Giảm noteCount nhóm cũ
      const fromGroup = state.groups.find((g) => g.id === fromGroupId);
      if (fromGroup && fromGroup.noteCount > 0) {
        fromGroup.noteCount -= 1;
      }

      // Tăng noteCount nhóm mới
      const toGroup = state.groups.find((g) => g.id === toGroupId);
      if (toGroup) {
        toGroup.noteCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Groups (pagination)
      .addCase(getGroupsStore.pending, (state, action) => {
        if (action.meta.arg.lastOrder) {
          state.loadingMoreGroup = true;
        } else {
          state.loadingGroup = true;
        }
        state.error = null;
      })
      .addCase(getGroupsStore.fulfilled, (state, action) => {
        state.loadingGroup = false;
        state.loadingMoreGroup = false;

        if (action.meta.arg.lastOrder) {
          state.groups = [...state.groups, ...action.payload.groups];
        } else {
          state.groups = action.payload.groups;
        }

        state.lastOrder = action.payload.lastOrder;
        state.hasMoreGroup = action.payload.groups.length > 0;
      })
      .addCase(getGroupsStore.rejected, (state, action) => {
        state.loadingGroup = false;
        state.loadingMoreGroup = false;
        state.error = action.payload as string;
      })

      // Get Note Stats
      .addCase(getNoteStatsStore.pending, (state) => {
        state.loadingGroup = true;
      })
      .addCase(getNoteStatsStore.fulfilled, (state, action) => {
        state.loadingGroup = false;
        const { all, pinned, locked } = action.payload;

        state.virtualGroups = [
          {
            id: "all",
            name: "Tất cả",
            createdAt: "",
            noteCount: all,
            order: 0,
          },
          {
            id: "pinned",
            name: "Ghim",
            createdAt: "",
            noteCount: pinned,
            order: 0,
          },
          {
            id: "locked",
            name: "Đã khoá",
            createdAt: "",
            noteCount: locked,
            order: 0,
          },
        ];
      })
      .addCase(getNoteStatsStore.rejected, (state, action) => {
        state.loadingGroup = false;
        state.error = action.payload as string;
      })

      // Create Group
      .addCase(createGroupStore.pending, (state) => {
        // state.loadingGroup = true;
        state.error = null;
      })
      .addCase(createGroupStore.fulfilled, (state, action) => {
        // state.loadingGroup = false;
        state.groups.unshift(action.payload);
      })
      .addCase(createGroupStore.rejected, (state, action) => {
        // state.loadingGroup = false;
        state.error = action.payload as string;
      })

      // Update Group
      .addCase(updateGroupStore.pending, (state) => {
        // state.loadingGroup = true;
        state.error = null;
      })
      .addCase(updateGroupStore.fulfilled, (state, action) => {
        // state.loadingGroup = false;
        const index = state.groups.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.groups[index].name = action.payload.name;
        }
      })
      .addCase(updateGroupStore.rejected, (state, action) => {
        // state.loadingGroup = false;
        state.error = action.payload as string;
      })

      // Delete Group
      .addCase(deleteGroupStore.pending, (state) => {
        // state.loadingGroup = true;
        state.error = null;
      })
      .addCase(deleteGroupStore.fulfilled, (state, action) => {
        // state.loadingGroup = false;
        state.groups = state.groups.filter((g) => g.id !== action.payload.id);
      })
      .addCase(deleteGroupStore.rejected, (state, action) => {
        // state.loadingGroup = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  resetGroupState,
  resetError,
  changeNoteStats,
  batchChangeNoteStats,
  adjustNoteStatsFromUpdate,
  increaseNoteCount,
  moveNoteToAnotherGroup,
} = groupSlice.actions;
export default groupSlice.reducer;
