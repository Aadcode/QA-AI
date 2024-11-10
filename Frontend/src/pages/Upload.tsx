import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for making API calls

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // To handle errors
  const navigate = useNavigate();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0] || null;
    setFile(uploadedFile);
    setError(null); // Clear any previous errors
  };

  const handleFileUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("pdf", file); // 'pdf' should match backend's expected field name

    setIsUploading(true); // Show loading indicator

    try {
      const response = await axios.post("/api/v1/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(response.data);
      navigate("/Ask"); // Redirect to chat page after successful upload
    } catch (error) {
      setError("File upload failed. Please try again."); // Set error message
      console.error("File upload failed", error);
    } finally {
      setIsUploading(false); // Hide loading indicator
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">Hi, Welcome to QA-AI</h1>

      <div className="flex flex-col gap-4 items-center">
        <input
          className="p-5 outline-none border border-gray-300 rounded"
          type="file"
          name="pdf"
          onChange={handleFileChange}
        />

        {/* Show loading state */}
        {isUploading ? (
          <div className="mt-4 text-lg text-blue-500">Uploading...</div>
        ) : (
          <button
            onClick={handleFileUpload}
            disabled={!file || isUploading}
            className="mt-3 p-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Upload
          </button>
        )}

        {/* Display error message */}
        {error && <div className="mt-4 text-red-500">{error}</div>}
      </div>
    </div>
  );
};

export default Upload;
