export const uploadBase64ToCloudinary = async (
  base64: string
): Promise<string> => {
  const data = new FormData();
  data.append("file", base64); // phải là: data:image/png;base64,...
  data.append("upload_preset", "note-app"); // <== preset bạn tạo
  data.append("cloud_name", "dlmmripoq"); // thay bằng tên cloud của bạn

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dlmmripoq/image/upload",
    {
      method: "POST",
      body: data,
    }
  );

  const result = await res.json();
  if (!result.secure_url)
    throw new Error("Upload failed: " + JSON.stringify(result));
  return result.secure_url;
};

export const uploadToCloudinary = async (imageUri: string) => {
  try {
    const filename = imageUri.split("/").pop() || "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    const formData = new FormData();

    const fileData = {
      uri: imageUri,
      name: filename,
      type: type,
    };

    const CLOUDINARY_UPLOAD_PRESET = "note-app";
    const CLOUDINARY_URL =
      "https://api.cloudinary.com/v1_1/dlmmripoq/image/upload";

    formData.append("file", fileData as any);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        `Upload failed: ${response.status} - ${JSON.stringify(responseData)}`
      );
    }

    return responseData.secure_url;
  } catch (error: any) {
    console.log("Detailed upload error:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};
