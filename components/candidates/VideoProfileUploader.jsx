import React, { useRef, useState, useEffect } from "react";
import { Card, Button, Spin, Typography, Upload } from "antd";
import { VideoCameraOutlined, StopOutlined, RedoOutlined, CloudUploadOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from "@/components/common/Modal";
import "@/styles/modal.css";
import videoService from "@/services/videoService";

const { Title } = Typography;
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const VIDEO_WIDTH = 720;
const VIDEO_HEIGHT = 480;

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const VideoProfileUploader = ({ candidateProfileId, onUploadSuccess, initialVideoUrl }) => {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [timer, setTimer] = useState(0);
  const [recording, setRecording] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [mode, setMode] = useState(null); // "upload" | "record"
  const [selectedFile, setSelectedFile] = useState(null);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  // Lấy webcam stream khi chọn Record
  useEffect(() => {
    if (mode !== "record") return;
    let stream;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(s => {
        setMediaStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      });
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line
  }, [mode]);

  // Gán stream cho video khi mediaStream thay đổi
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  // Dừng timer khi dừng quay
  useEffect(() => {
    if (!recording && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [recording]);

  // Đếm ngược trước khi quay
  const startCountdown = () => {
    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        setCountdown(0);
        startRecording();
      }
    }, 1000);
  };

  // Bắt đầu quay
  const startRecording = () => {
    if (!mediaStream) return;
    setShowPreview(false);
    setRecordedBlob(null);
    setRecording(true);
    setTimer(0);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);

    let localChunks = [];
    const recorder = new window.MediaRecorder(mediaStream, { mimeType: "video/webm" });
    setMediaRecorder(recorder);

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        localChunks.push(e.data);
      }
    };
    recorder.onstop = () => {
      setRecording(false);
      setTimer(0);
      if (timerRef.current) clearInterval(timerRef.current);
      const blob = new Blob(localChunks, { type: "video/webm" });
      setRecordedBlob(blob);
      setShowPreview(true);
    };
    recorder.start();
  };

  // Dừng quay
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  };

  // Quay lại từ đầu
  const resetRecording = () => {
    setShowPreview(false);
    setRecordedBlob(null);
    setTimer(0);
    setRecording(false);
  };

  // Upload video (cả file upload hoặc file quay)
  const handleUpload = async () => {
    const fileToUpload = mode === "upload" ? selectedFile : (recordedBlob ? new File([recordedBlob], "recorded-video.webm", { type: recordedBlob.type }) : null);
    if (!candidateProfileId) {
      toast.error("Profile not loaded. Please wait and try again.");
      return;
    }
    if (!fileToUpload) {
      toast.error("Please select or record a video!");
      return;
    }
    if (!ALLOWED_TYPES.includes(fileToUpload.type)) {
      toast.error("Unsupported video format. Allowed: MP4, WebM, OGG.");
      return;
    }
    setLoading(true);
    try {
      const url = await videoService.uploadProfileVideo(fileToUpload, candidateProfileId);
      setVideoUrl(url);
      setShowPreview(false);
      setModalOpen(false);
      setMode(null);
      setSelectedFile(null);
      setRecordedBlob(null);
      toast.success("Video uploaded successfully!");
      if (onUploadSuccess) onUploadSuccess(url);
    } catch (err) {
      toast.error("Upload failed: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  // Xử lý upload file từ máy
  const handleFileChange = (info) => {
    const file = info.file.originFileObj;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Unsupported video format. Allowed: MP4, WebM, OGG.");
      return;
    }
    setSelectedFile(file);
    setShowPreview(true);
    setMode("upload");
  };

  // Giao diện chọn mode
  if (!mode) {
    return (
      <Card style={{ maxWidth: 1000, margin: "40px auto", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", background: "#f8fafd" }} bodyStyle={{ padding: 32 }}>
        <Title level={4} style={{ marginBottom: 24, textAlign: "center" }}>Profile Introduction Video</Title>
        <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
          <Upload
            accept={ALLOWED_TYPES.join(",")}
            showUploadList={false}
            beforeUpload={(file) => {
              handleFileChange({ file: { originFileObj: file } });
              return false; // Ngăn upload mặc định
            }}
          >
            <Button size="large" type="primary" icon={<UploadOutlined />} style={{ height: 60, width: 200, fontSize: 20 }}>
              Upload Video
            </Button>
          </Upload>
          <Button
            size="large"
            type="primary"
            ghost
            icon={<VideoCameraOutlined />}
            style={{ height: 60, width: 200, fontSize: 20 }}
            onClick={() => setMode("record")}
          >
            Record Video
          </Button>
        </div>
        {videoUrl && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <video src={videoUrl} controls style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }} />
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card
      style={{ maxWidth: 1000, margin: "40px auto", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", background: "#f8fafd" }}
      bodyStyle={{ padding: 32 }}
    >
      <Title level={4} style={{ marginBottom: 8, textAlign: "center" }}>Profile Introduction Video</Title>
      {videoUrl && !showPreview && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <video src={videoUrl} controls style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }} />
        </div>
      )}
      {(showPreview || mode === "record") && (
        <button
          style={{
            alignSelf: 'flex-start',
            marginBottom: 8,
            background: '#f5f8ff',
            color: '#2563eb',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            padding: '6px 18px',
            fontSize: 15,
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
            position: 'relative',
            zIndex: 10
          }}
          onClick={() => {
            setShowPreview(false);
            setMode(null);
            setSelectedFile(null);
            setRecordedBlob(null);
          }}
          className="back-btn"
        >
          <i className="flaticon-left-arrow" style={{marginRight:6}}></i> Back
        </button>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
        {/* Webcam Preview khi record */}
        {mode === "record" && !showPreview && (
          <div style={{ position: 'relative', width: VIDEO_WIDTH, height: VIDEO_HEIGHT, marginBottom: 18 }}>
            <video
              ref={videoRef}
              style={{
                width: VIDEO_WIDTH,
                height: VIDEO_HEIGHT,
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                background: '#000',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
              }}
              muted
              autoPlay
            />
            {/* Countdown overlay */}
            {countdown > 0 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                borderRadius: 16,
                fontSize: 80,
                color: '#fff',
                fontWeight: 700,
              }}>{countdown}</div>
            )}
            {/* Timer overlay */}
            {recording && (
              <div style={{
                position: 'absolute',
                top: 16,
                left: 24,
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                borderRadius: 8,
                padding: '4px 14px',
                fontWeight: 600,
                fontSize: 18,
                zIndex: 2,
                letterSpacing: 1,
              }}>
                {formatTime(timer)}
              </div>
            )}
            {/* Record/Stop button */}
            {!recording && countdown === 0 && (
              <Button
                shape="circle"
                size="large"
                style={{
                  position: 'absolute',
                  bottom: 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 64,
                  height: 64,
                  background: '#ff4d4f',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(255,77,79,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 3,
                }}
                icon={<VideoCameraOutlined style={{ fontSize: 32, color: '#fff' }} />}
                onClick={startCountdown}
                disabled={recording}
              />
            )}
            {recording && (
              <Button
                shape="circle"
                size="large"
                style={{
                  position: 'absolute',
                  bottom: 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 64,
                  height: 64,
                  background: '#ff4d4f',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(255,77,79,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 3,
                }}
                icon={<StopOutlined style={{ fontSize: 32, color: '#fff' }} />}
                onClick={stopRecording}
              />
            )}
          </div>
        )}
        {/* After recording or upload: preview and upload */}
        {showPreview && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <Button
                icon={<RedoOutlined />}
                onClick={() => {
                  resetRecording();
                  setSelectedFile(null);
                  setMode(null);
                }}
                size="large"
                style={{ minWidth: 150 }}
              >
                {mode === "upload" ? "Choose Another" : "Record Again"}
              </Button>
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                onClick={() => setModalOpen(true)}
                size="large"
                style={{ minWidth: 150 }}
              >
                Upload Video
              </Button>
            </div>
            <video
              src={mode === "upload" ? URL.createObjectURL(selectedFile) : (recordedBlob ? URL.createObjectURL(recordedBlob) : undefined)}
              controls
              style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', background: '#000' }}
            />
          </div>
        )}
      </div>
      {/* Modal xác nhận custom đồng bộ giao diện source */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        title="Upload Video?"
        footer={
          <>
            <button className="btn-cancel" onClick={() => {
              setModalOpen(false);
            }}>No</button>
            <button className="btn-confirm" onClick={handleUpload} disabled={loading}>
              {loading ? "Uploading..." : "Yes"}
            </button>
          </>
        }
      >
        <div style={{textAlign: 'center', fontSize: 17, color: '#444', padding: '12px 0 4px 0'}}>
          Are you sure you want to upload this video? This will update your profile video.
        </div>
      </Modal>
    </Card>
  );
};

export default VideoProfileUploader; 