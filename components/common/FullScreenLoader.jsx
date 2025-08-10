'use client'

import React from 'react'

const FullScreenLoader = ({
  visible = true,
  message,
  color = '#1967d2',
  size = 56,
  backdropColor = 'rgba(255,255,255,0.85)',
  blur = true,
  zIndex = 1300,
}) => {
  if (!visible) return null

  return (
    <div
      className="fs-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        '--fs-loader-color': color,
        '--fs-backdrop': backdropColor,
        '--fs-z': zIndex,
        '--fs-size': `${size}px`,
      }}
    >
      <div className="fs-box">
        <svg
          className="fs-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
            strokeDasharray="80"
            strokeDashoffset="80"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="80;0;80"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
        {message ? <div className="fs-text">{message}</div> : null}
      </div>

      <style jsx>{`
        .fs-loader {
          position: fixed;
          inset: 0;
          z-index: var(--fs-z);
          background: var(--fs-backdrop);
          display: grid;
          place-items: center;
          animation: fsFadeIn 180ms ease-out;
          ${blur ? 'backdrop-filter: blur(2px);' : ''}
        }

        .fs-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          transform: translateY(6px) scale(0.98);
          animation: fsPop 220ms ease-out forwards;
        }

        .fs-icon {
          width: var(--fs-size);
          height: var(--fs-size);
          color: var(--fs-loader-color);
          filter: drop-shadow(0 6px 18px rgba(2, 6, 23, 0.18));
        }

        .fs-text {
          font-size: 14px;
          color: #0f172a;
          font-weight: 600;
          letter-spacing: 0.2px;
          opacity: 0.9;
          animation: fsTextFade 260ms ease-out 80ms both;
        }

        @keyframes fsFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fsPop {
          to { transform: translateY(0) scale(1); }
        }

        @keyframes fsTextFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default FullScreenLoader


