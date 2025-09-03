'use client'

import { useState } from "react";
import Image from "next/image";

// Hàm crop ảnh về 90x90
const cropImageToSquare = (file, size = 90) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new window.Image();
      img.onload = function () {
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], file.name, { type: file.type });
            resolve({
              file: croppedFile,
              url: URL.createObjectURL(blob),
            });
          } else {
            reject(new Error('Crop failed'));
          }
        }, file.type);
      };
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const LogoCoverUploader = ({ onLogoChange, onCoverChange, logoPreviewUrl: logoPreviewUrlProp, coverPreviewUrl, initialLogoUrl, initialCoverUrl, isEditing }) => {
    const [logoImg, setLogoImg] = useState("");
    const [converImg, setCoverImg] = useState("");
    const [logoPreviewUrl, setLogoPreviewUrl] = useState(logoPreviewUrlProp || "");

    // logo image
    const logoHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const { file: croppedFile, url } = await cropImageToSquare(file, 90);
            setLogoImg(croppedFile);
            setLogoPreviewUrl(url);
            if(onLogoChange) {
                onLogoChange(croppedFile);
            }
        } catch (err) {
            alert("Crop image failed!");
        }
    };

    // cover image
    const coverHandler = (e) => {
        const file = e.target.files[0];
        setCoverImg(file);
        if(onCoverChange) {
            onCoverChange(file);
        }
    };

    return (
        <>
            <div className="uploading-outer">
                <div className="uploadButton">
                    <input
                        className="uploadButton-input"
                        type="file"
                        name="logoFile"
                        accept="image/*"
                        id="upload"
                        onChange={logoHandler}
                        disabled={!isEditing}
                    />
                    <label
                        className="uploadButton-button ripple-effect"
                        htmlFor="upload"
                        style={{ width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
                    >
                        {logoPreviewUrl ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                <img
                                    src={logoPreviewUrl}
                                    alt="Logo Preview"
                                    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                                />
                            </div>
                        ) : initialLogoUrl ? (
                             <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                 <Image
                                     src={initialLogoUrl}
                                     alt="Existing Logo"
                                     fill
                                     style={{ objectFit: 'contain' }}
                                 />
                             </div>
                        ) : (
                            logoImg !== "" ? logoImg?.name : " Browse Logo"
                        )}
                    </label>
                    {!logoPreviewUrl && logoImg !== "" && <span className="uploadButton-file-name">{logoImg?.name}</span>}
                </div>
                <div className="text">
                    Max file size is 1MB, Minimum dimension: 330x300 And
                    Suitable files are .jpg & .png
                </div>
            </div>

            <div className="uploading-outer">
                <div className="uploadButton">
                    <input
                        className="uploadButton-input"
                        type="file"
                        name="logoLgrFile"
                        accept="image/*, application/pdf"
                        id="upload_cover"
                        onChange={coverHandler}
                        disabled={!isEditing}
                    />
                    <label
                        className="uploadButton-button ripple-effect"
                        htmlFor="upload_cover"
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
                    >
                        {coverPreviewUrl ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                <img
                                    src={coverPreviewUrl}
                                    alt="Cover Preview"
                                    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                                />
                            </div>
                        ) : initialCoverUrl ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                <Image
                                    src={initialCoverUrl}
                                    alt="Existing Cover"
                                    fill
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        ) : (
                            converImg !== "" ? converImg?.name : "Browse Cover"
                        )}
                    </label>
                    {!coverPreviewUrl && converImg !== "" && <span className="uploadButton-file-name">{converImg?.name}</span>}
                </div>
                <div className="text">
                    Max file size is 1MB, Minimum dimension: 330x300 And
                    Suitable files are .jpg & .png
                </div>
            </div>
        </>
    );
};

export default LogoCoverUploader;
