"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export default function CallbackPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center">ログイン処理中です…</p>}> {/* fallback : ローディング表示 */}
      <CallbackClient /> {/*children :  レンダリングする実際のUI */}
    </Suspense>
  );
}
