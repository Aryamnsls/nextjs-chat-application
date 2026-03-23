"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, User, Mail, Lock, CheckCircle, Camera, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    twoFactor: "123456",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [authStage, setAuthStage] = useState('form'); // 'form', 'face-id', 'success'
  const [isLoading, setIsLoading] = useState(false);
  const [faceProgress, setFaceProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate initial validation
    setTimeout(() => {
      setIsLoading(false);
      setAuthStage('face-id');
      startFaceRecognition();
    }, 1000);
  };

  const startFaceRecognition = () => {
    setFaceProgress(0);
    const interval = setInterval(() => {
      setFaceProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            handleFinalAuth();
          }, 500);
          return 100;
        }
        return p + 2;
      });
    }, 50);
  };

  const handleFinalAuth = async () => {
    setAuthStage('success');
    
    // Final sign in via NextAuth
    const result = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
      name: formData.name || (isRegistering ? formData.name : "User"),
      twoFactorCode: formData.twoFactor,
    });

    if (result?.ok) {
        setTimeout(() => {
           router.push("/");
        }, 1000);
    }
  };

  return (
    <div className="login-page">
      <div className="interactive-bg"></div>
      
      <div className="login-card glass-effect">
        {authStage === 'form' && (
          <>
            <div className="login-header">
              <div className="shield-icon">
                <Shield size={32} />
              </div>
              <h1>{isRegistering ? 'Create Account' : 'Secure Login'}</h1>
              <p>{isRegistering ? 'Register to access Nova Intelligence' : 'Authenticated access required'}</p>
            </div>

            <div className="auth-tabs">
              <button 
                className={`auth-tab ${!isRegistering ? 'active' : ''}`}
                onClick={() => setIsRegistering(false)}
              >
                Login
              </button>
              <button 
                className={`auth-tab ${isRegistering ? 'active' : ''}`}
                onClick={() => setIsRegistering(true)}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {isRegistering && (
                <div className="input-field">
                  <label><User size={16} /> Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              )}

              <div className="input-field">
                <label><Mail size={16} /> Email Address</label>
                <input 
                  type="email" 
                  placeholder="admin@nova.ai"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="input-field">
                <label><Lock size={16} /> Password</label>
                <input 
                  type="password" 
                  placeholder="Password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              {!isRegistering && (
                <div className="input-field">
                  <label>2FA Verification Code (Standard)</label>
                  <div className="otp-sim">1 2 3 4 5 6</div>
                </div>
              )}

              <button className="login-btn" type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Register & Next' : 'Verify & Continue')}
              </button>
            </form>
          </>
        )}

        {authStage === 'face-id' && (
          <div className="face-id-container">
            <div className="face-scanner">
              <div className="scanner-line"></div>
              <Camera size={64} style={{ color: "var(--primary)" }} />
              <div className="scanning-feedback">
                <h3>Face Recognition Initialized</h3>
                <p>Establishing biometric identity correlation...</p>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${faceProgress}%` }}></div>
            </div>
            <p className="progress-text">{faceProgress}% Verified</p>
          </div>
        )}

        {authStage === 'success' && (
          <div className="success-container animate-bounce">
            <CheckCircle size={80} color="#10b981" />
            <h2 style={{ marginTop: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Welcome back, {formData.name || 'Agent'}</h2>
            <p>Authentication Confirmed.</p>
          </div>
        )}

        <div className="login-footer">
          <p>© 2026 Nova Labs Intelligence</p>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #020617;
          overflow: hidden;
          position: relative;
        }

        .interactive-bg {
          position: absolute;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 60%);
          animation: pulse 10s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        .login-card {
          width: 100%;
          max-width: 450px;
          padding: 2.5rem;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .shield-icon {
          width: 64px;
          height: 64px;
          background: rgba(99, 102, 241, 0.1);
          color: #818cf8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          border-radius: 20px;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        h1 { font-size: 1.75rem; font-weight: 800; color: white; margin-bottom: 0.5rem; }
        p { color: #94a3b8; font-size: 0.9rem; }

        .auth-tabs {
          display: flex;
          background: rgba(0,0,0,0.3);
          padding: 4px;
          border-radius: 12px;
          margin-top: 2rem;
          margin-bottom: 1.5rem;
        }

        .auth-tab {
          flex: 1;
          padding: 0.75rem;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .auth-tab.active {
          background: #6366f1;
          color: white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .login-form { text-align: left; }
        .input-field { margin-bottom: 1.25rem; }
        .input-field label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #94a3b8; font-weight: 600; margin-bottom: 0.5rem; }
        
        .input-field input {
          width: 100%;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          color: white;
          outline: none;
        }

        .otp-sim {
          background: rgba(0,0,0,0.5);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          font-family: monospace;
          letter-spacing: 0.5em;
          color: #6366f1;
          font-size: 1.25rem;
          font-weight: 800;
        }

        .login-btn {
          width: 100%;
          padding: 1rem;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .login-btn:hover { background: #4f46e5; transform: translateY(-2px); }

        .face-id-container { padding: 2rem 0; }
        .face-scanner {
          width: 180px;
          height: 180px;
          border: 4px solid #6366f1;
          border-radius: 40px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: rgba(99, 102, 241, 0.05);
        }

        .scanner-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: #6366f1;
          box-shadow: 0 0 15px #6366f1;
          animation: scan 2s linear infinite;
        }

        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }

        .progress-bar { width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 10px; margin-top: 1rem; overflow: hidden; }
        .progress-fill { height: 100%; background: #6366f1; transition: width 0.1s linear; }
        .progress-text { margin-top: 0.5rem; font-size: 0.8rem; color: #6366f1; font-weight: 800; }

        .login-footer { margin-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 1.5rem; font-size: 0.75rem; color: #475569; }
      `}</style>
    </div>
  );
}
