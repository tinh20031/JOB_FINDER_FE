'use client'

import { useState } from "react";
import Image from "next/image";

const LogoCoverUploader = ({ onLogoChange, onCoverChange, logoPreviewUrl, coverPreviewUrl, initialLogoUrl, initialCoverUrl, isEditing }) => {
    const [logoImg, setLogoImg] = useState("");
    const [converImg, setCoverImg] = useState("");

    // logo image
    const logoHandler = (e) => {
        const file = e.target.files[0];
        setLogoImg(file);
        if(onLogoChange) {
            onLogoChange(file);
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
                                <Image
                                    src={logoPreviewUrl}
                                    alt="Logo Preview"
                                    fill
                                    style={{ objectFit: 'contain' }}
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
                                <Image
                                    src={coverPreviewUrl}
                                    alt="Cover Preview"
                                    fill
                                    style={{ objectFit: 'contain' }}
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
