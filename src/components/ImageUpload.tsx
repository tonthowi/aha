import React, { useState, useRef } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
}

export default function ImageUpload({ onImageChange }: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onImageChange(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      {imagePreview ? (
        <div className="relative w-full h-64 rounded-xl overflow-hidden card-shadow-hover">
          <Image
            src={imagePreview}
            alt="Preview"
            layout="fill"
            objectFit="cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black text-white p-1 rounded-full hover:bg-black/80 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <label
          htmlFor="image"
          className="flex flex-col items-center justify-center w-full h-64 border border-[#e6e6e6] rounded-xl cursor-pointer bg-[#f7f7f7] hover:bg-[#f0f0f0] transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <ImageIcon className="w-10 h-10 mb-3 text-[#666666]" />
            <p className="mb-2 text-sm text-black">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-[#666666]">PNG, JPG or GIF (MAX. 800x400px)</p>
          </div>
        </label>
      )}
      <input
        type="file"
        id="image"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        ref={fileInputRef}
      />
    </div>
  );
}
