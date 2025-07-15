import { uploadBase64ToCloudinary } from "@/src/api/imageAPI";
import { useNavigation } from "@/src/hook/useNavigation";
import { hasInternetConnection } from "@/src/utils/checkInternet";
import firestore from "@react-native-firebase/firestore";
import {
  Canvas,
  PaintStyle,
  Skia,
  Image as SkiaImage,
  Path as SkiaPath,
  SkImage,
  useCanvasRef,
  useImage,
} from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import {
  Button,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RNFS from "react-native-fs";
import ImageResizer from "react-native-image-resizer";

const { width, height } = Dimensions.get("window");

type DrawOnImageProps = {
  userId: string;
  noteId: string;
  imageUri: string;
  onSave: (url: string) => void;
  setLoading: (loading: boolean) => void;
};

export const DrawOnImage = ({
  userId,
  noteId,
  imageUri,
  onSave,
  setLoading,
}: DrawOnImageProps) => {
  const [paths, setPaths] = useState<ReturnType<typeof Skia.Path.Make>[]>([]);
  const [redoStack, setRedoStack] = useState<
    ReturnType<typeof Skia.Path.Make>[]
  >([]);
  const [strokeColor, setStrokeColor] = useState("#FF0000");

  const [showColorPicker, setShowColorPicker] = useState(false);

  const [resizedUri, setResizedUri] = useState<string | null>(null);
  const canvasRef = useCanvasRef();
  const navigation = useNavigation();

  const paint = Skia.Paint();
  paint.setColor(Skia.Color(strokeColor));
  paint.setStrokeWidth(4);
  paint.setStyle(PaintStyle.Stroke);

  const resizeImage = async (uri: string): Promise<string> => {
    try {
      const response = await ImageResizer.createResizedImage(
        uri,
        512, // width mong muốn (giảm độ phân giải)
        512, // height mong muốn (auto giữ tỉ lệ nếu keepAspectRatio = true)
        "JPEG", // định dạng
        60, // chất lượng (1-100)
        0 // rotation
      );

      return response.uri; // đường dẫn ảnh mới
    } catch (err) {
      console.error("Resize failed:", err);
      return uri; // fallback về ảnh gốc nếu có lỗi
    }
  };

  useEffect(() => {
    if (!imageUri) return;
    const processImage = async () => {
      const uri = await resizeImage(imageUri);
      setResizedUri(uri);
    };
    processImage();
  }, [imageUri]);

  const image = useImage(resizedUri || "") as SkImage;

  if (!image) return null;

  const canvasHeight = height * 0.8;

  const imgWidth = image.width();
  const imgHeight = image.height();
  console.log("Image dimensions:", imgWidth, imgHeight);
  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = width / canvasHeight;

  let drawWidth, drawHeight;
  if (imgRatio > canvasRatio) {
    // ảnh rộng hơn khung → scale theo width
    drawWidth = width;
    drawHeight = width / imgRatio;
  } else {
    // ảnh cao hơn khung → scale theo height
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imgRatio;
  }

  // ✅ Tính offset để căn giữa
  const xOffset = (width - drawWidth) / 2;
  const yOffset = (canvasHeight - drawHeight) / 2;

  const handleTouch = ({
    x,
    y,
    type,
  }: {
    x: number;
    y: number;
    type: "start" | "active";
  }) => {
    // Không cho phép vẽ ngoài vùng ảnh
    const isInsideDrawingArea =
      x >= xOffset &&
      x <= xOffset + drawWidth &&
      y >= yOffset &&
      y <= yOffset + drawHeight;

    if (!isInsideDrawingArea) return;

    if (type === "start") {
      const p = Skia.Path.Make();
      p.moveTo(x, y);
      setPaths((prev) => [...prev, p]);
      setRedoStack([]);
    } else if (type === "active") {
      setPaths((prev) => {
        const updated = [...prev];
        updated[updated.length - 1]?.lineTo(x, y);
        return updated;
      });
    }
  };

  const handleUndo = () => {
    setPaths((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRedoStack((redo) => [...redo, last]);
      return prev.slice(0, -1);
    });
  };

  const handleRedo = () => {
    setRedoStack((redo) => {
      if (redo.length === 0) return redo;
      const last = redo[redo.length - 1];
      setPaths((prev) => [...prev, last]);
      return redo.slice(0, -1);
    });
  };

  const handleClear = () => {
    setPaths([]);
    setRedoStack([]);
  };

  const handleExport = async () => {
    try {
      const isConnected = await hasInternetConnection();
      setLoading(true);
      const canvas = canvasRef.current;
      if (!canvas || !image) return;

      const imageSnapshot = canvas.makeImageSnapshot({
        x: xOffset,
        y: yOffset,
        width: drawWidth,
        height: drawHeight,
      });

      const imageBase64 = imageSnapshot.encodeToBase64();
      const uri = `data:image/png;base64,${imageBase64}`;

      if (!isConnected) {
        // 👉 Lưu local
        const localPath = `${
          RNFS.DocumentDirectoryPath
        }/offline_${Date.now()}.png`;

        onSave(`file://${localPath}`);
        navigation.goBack();

        await RNFS.writeFile(localPath, imageBase64, "base64");

        const noteRef = firestore()
          .collection("users")
          .doc(userId)
          .collection("notes")
          .doc(noteId);

        // 👉 Cập nhật Firestore với local path
        await noteRef.update({
          images: firestore.FieldValue.arrayUnion(`file://${localPath}`),
          isSynced: false,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        const url = await uploadBase64ToCloudinary(uri);

        console.log("user id", userId);
        console.log("note id", noteId);

        const noteRef = firestore()
          .collection("users")
          .doc(userId)
          .collection("notes")
          .doc(noteId);
          
        await noteRef.update({
          images: firestore.FieldValue.arrayUnion(url),
          isSynced: true,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        onSave(url);
        navigation.goBack();
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 80% vùng hiển thị vẽ */}
      <View style={{ flex: 1 }}>
        <Canvas
          style={{ width, height: canvasHeight }}
          onTouchStart={(e) =>
            handleTouch({
              x: e.nativeEvent.locationX,
              y: e.nativeEvent.locationY,
              type: "start",
            })
          }
          onTouchMove={(e) =>
            handleTouch({
              x: e.nativeEvent.locationX,
              y: e.nativeEvent.locationY,
              type: "active",
            })
          }
          ref={canvasRef}
        >
          {/* ✅ Vẽ ảnh theo tỉ lệ và căn giữa */}
          <SkiaImage
            image={image}
            x={xOffset}
            y={yOffset}
            width={drawWidth}
            height={drawHeight}
          />

          {/* ✅ Vẽ các path */}
          {paths.map((p, idx) => (
            <SkiaPath key={idx} path={p} paint={paint} />
          ))}
        </Canvas>
      </View>

      {/* 20% vùng điều khiển */}
      <View
        style={{
          height: Platform.OS === "ios" ? height * 0.05 : height * 0.2,
          justifyContent: "center",
          paddingHorizontal: 20,
          // paddingVertical: 10,
          position: "relative",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "space-between",
          }}
        >
          {/* Nút chọn màu */}
          {showColorPicker && (
            <View
              style={{
                position: "absolute",
                top: 45,
                left: 0,
                flexDirection: "row",
                backgroundColor: "#fff",
                padding: 8,
                borderRadius: 8,
                elevation: 5, // Android
                shadowColor: "#000", // iOS
                shadowOpacity: 0.2,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                zIndex: 10,
              }}
            >
              {["#FF0000", "#00C851", "#007EFC", "#F9A825", "#000000"].map(
                (color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => {
                      setStrokeColor(color);
                      setShowColorPicker(false);
                    }}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: color,
                      marginHorizontal: 4,
                      borderWidth: strokeColor === color ? 2 : 0,
                      borderColor: "#555",
                    }}
                  />
                )
              )}
            </View>
          )}
          <View>
            <Button
              title="Màu"
              onPress={() => setShowColorPicker((prev) => !prev)}
              color={strokeColor}
            />
          </View>

          {/* Các nút chức năng */}
          <TouchableOpacity
            onPress={handleUndo}
            disabled={paths.length === 0}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Hoàn tác</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRedo}
            disabled={redoStack.length === 0}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Làm lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClear}
            disabled={paths.length === 0 && redoStack.length === 0}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Xoá</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleExport}
            style={[styles.button, { backgroundColor: "#007EFC" }]}
          >
            <Text style={[styles.buttonText, { color: "#fff" }]}>Lưu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#EEE",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});
