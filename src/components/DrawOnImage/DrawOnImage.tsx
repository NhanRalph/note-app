import { uploadToCloudinary } from "@/src/api/imageAPI";
import { useNavigation } from "@/src/hook/useNavigation";
import {
  Canvas,
  PaintStyle,
  Skia,
  Image as SkiaImage,
  Path as SkiaPath,
  useCanvasRef,
  useImage,
} from "@shopify/react-native-skia";
import { useRef, useState } from "react";
import {
  Button,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";

const { width, height } = Dimensions.get("window");

type DrawOnImageProps = {
  imageUri: string;
  onSave: (url: string) => void;
  setLoading: (loading: boolean) => void;
};

export const DrawOnImage = ({ imageUri, onSave, setLoading }: DrawOnImageProps) => {
  const [paths, setPaths] = useState<ReturnType<typeof Skia.Path.Make>[]>([]);
  const [redoStack, setRedoStack] = useState<
    ReturnType<typeof Skia.Path.Make>[]
  >([]);
  const [strokeColor, setStrokeColor] = useState("#FF0000");

  const [showColorPicker, setShowColorPicker] = useState(false);
  const canvasRef = useCanvasRef();
  const viewShotRef = useRef<ViewShot>(null);
  const navigation = useNavigation();

  const paint = Skia.Paint();
  paint.setColor(Skia.Color(strokeColor));
  paint.setStrokeWidth(4);
  paint.setStyle(PaintStyle.Stroke);

  const image = useImage(imageUri);

  const handleTouch = ({
    x,
    y,
    type,
  }: {
    x: number;
    y: number;
    type: "start" | "active";
  }) => {
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
      setLoading(true);
      if (!viewShotRef.current) {
        throw new Error("ViewShot reference is null");
      }

      setTimeout(async () => {
        const uri = await captureRef(viewShotRef.current!, {
          format: "png",
          quality: 0.8,
        });
        
        if (!uri) {
          throw new Error("Failed to capture image");
        }
  
        console.log("Captured image URI:", uri);
        const url = await uploadToCloudinary(uri);
        onSave(url);
        navigation.goBack();
      }, 100);

      
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setLoading(false);
    }
  };

  const canvasHeight = height * 0.8;

  if (!image) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* 80% vùng hiển thị vẽ */}
      <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
      <View collapsable={false}>
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
          <SkiaImage
            image={image}
            x={0}
            y={0}
            width={width}
            height={canvasHeight}
          />
          {paths.map((p, idx) => (
            <SkiaPath key={idx} path={p} paint={paint} />
          ))}
        </Canvas>
      </View>
      </ViewShot>

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
