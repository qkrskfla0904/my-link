"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface FirebaseErrorWithCode {
  code?: string;
  message?: string;
}

function getReadableAuthErrorMessage(err: unknown): string | null {
  if (typeof err === "object" && err !== null) {
    const fbErr = err as FirebaseErrorWithCode;
    switch (fbErr.code) {
      case "auth/popup-closed-by-user":
        // 사용자가 팝업 창을 닫은 경우 에러 배너를 띄우지 않음
        return null;
      case "auth/operation-not-allowed":
        return "Firebase 콘솔에 Google 로그인 제공업체가 활성화되어 있지 않습니다. [Firebase Console > Authentication > Sign-in method]에서 Google 공급업체를 '사용 설정'으로 켜주세요.";
      case "auth/unauthorized-domain":
        return "승인되지 않은 도메인입니다. [Firebase Console > Authentication > Settings > 승인된 도메인]에 현재 접속 도메인(localhost 등)을 추가해주세요.";
      case "auth/popup-blocked":
        return "브라우저에 의해 로그인 팝업창이 차단되었습니다. 주소창에서 팝업을 허용해주세요.";
      case "auth/cancelled-popup-request":
        return "이전 로그인 요청이 아직 진행 중입니다.";
      case "auth/network-request-failed":
        return "네트워크 요청에 실패했습니다. 인터넷 연결 상태를 확인해주세요.";
      case "auth/account-exists-with-different-credential":
        return "동일한 이메일로 등록된 다른 로그인 수단이 이미 존재합니다.";
      default:
        if (fbErr.code) {
          return `[${fbErr.code}] ${fbErr.message || "구글 로그인에 실패했습니다."}`;
        }
    }
  }

  if (err instanceof Error) {
    return err.message;
  }
  return "구글 로그인에 실패했습니다. 다시 시도해주세요.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        setError(null);
      },
      (authError) => {
        console.error("Firebase Auth state error:", authError);
        setError(getReadableAuthErrorMessage(authError));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      const errorMessage = getReadableAuthErrorMessage(err);
      if (errorMessage) {
        setError(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err: unknown) {
      console.error("Sign-out error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "로그아웃에 실패했습니다.";
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        loginWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
