import NetInfo from "@react-native-community/netinfo";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { syncOfflineNoteImages } from "../utils/syncImage";
// Import đối tượng i18n đã cấu hình
import i18n from "../i18n/i18n"; // Đảm bảo đường dẫn chính xác đến file i18n của bạn

const withSyncLoading = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const SyncLoadingComponent = (props: P) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0); // Lưu trữ tiến trình đồng bộ

    useEffect(() => {
      const unsubscribe = NetInfo.addEventListener(async (state) => {
        if (state.isConnected) {
          Toast.show({
            type: "success",
            text1: i18n.t("sync_loading.internet_connected_title"), // Dịch "Kết nối Internet"
            text2: i18n.t("sync_loading.internet_connected_message"), // Dịch "Thiết bị của bạn đã kết nối internet. Bắt đầu đồng bộ dữ liệu..."
          });
          const userId = auth().currentUser?.uid;

          if (userId) {
            setIsSyncing(true);
            setSyncProgress(0); // Reset tiến trình khi bắt đầu đồng bộ
            try {
              await firestore().disableNetwork();
              console.log("Firestore network disabled.");

              // Giả sử hàm `syncOfflineNoteImages` có thể nhận một callback để cập nhật tiến trình
              await syncOfflineNoteImages(userId, (progress: number) => {
                setSyncProgress(progress);
              });

              console.log("All images uploaded and Firestore data synced.");
            } catch (error) {
              console.error("Error during sync process: ", error);
            } finally {
              await firestore().enableNetwork();
              console.log("Firestore network enabled.");
              setIsSyncing(false);
            }
          }
        } else {
          Toast.show({
            type: "error",
            text1: i18n.t("sync_loading.internet_disconnected_title"), // Dịch "Mất kết nối Internet"
            text2: i18n.t("sync_loading.internet_disconnected_message"), // Dịch "Thiết bị của bạn không có kết nối internet. Vui lòng kiểm tra lại."
          });
        }
      });

      return () => unsubscribe();
    }, []);

    return (
      <>
        <WrappedComponent {...props} />

        {isSyncing && (
          <View style={styles.syncContainer}>
            <View style={styles.syncBox}>
              <ActivityIndicator size="small" color="gray" />
              <Text style={styles.loadingText}>
                {syncProgress < 100
                  ? i18n.t("sync_loading.sync_progress", { progress: syncProgress }) // Dịch "Đang đồng bộ dữ liệu: {{progress}}%"
                  : i18n.t("sync_loading.sync_complete")} {/* Dịch "Đồng bộ thành công!" */}
              </Text>
            </View>
          </View>
        )}
      </>
    );
  };

  SyncLoadingComponent.displayName = `withSyncLoading(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return SyncLoadingComponent;
};

const styles = StyleSheet.create({
  syncContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 999, // Đảm bảo nó nằm trên tất cả các phần tử khác
  },
  syncBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#fff",
  },
});

export default withSyncLoading;
