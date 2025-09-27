'use client';

import { Toaster } from "@/components/ui/toaster";

/**
 * Client-side Toaster 컴포넌트
 * Next.js 15의 Server Component 제약을 해결하기 위해 별도 분리
 */
export default function ClientToaster() {
  return <Toaster />;
}
