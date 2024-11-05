import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0] || null;
    setFile(uploadedFile);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/Ask");
    } catch (error) {
      console.error("File upload failed", error);
    }
  };

  return (
    <div>
      <h1>Hi, Welcome to QA-AI</h1>
      <div className="flex flex-col gap-4 justify-center">
        <input
          className="p-5 outline-none"
          type="file"
          name="pdf"
          onChange={handleFileChange}
        />
        <button
          onClick={handleFileUpload}
          disabled={!file}
          className="mt-3 p-2 bg-blue-500 text-white rounded"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default Upload;
