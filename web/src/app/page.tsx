export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <h1 className="text-xl font-semibold">🗣️ Language App</h1>
        <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100">
          설정
        </button>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-sm text-gray-500">안녕, 효니!</p>
          <h2 className="mt-1 text-2xl font-bold">오늘의 학습 현황</h2>
          <p className="mt-1 text-gray-600">단어 5 · 퀴즈 2</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <a className="rounded-2xl border bg-white p-5 hover:shadow">
            <div className="text-lg font-medium">📚 단어 학습</div>
            <p className="mt-1 text-sm text-gray-600">카드로 예습하기</p>
          </a>
          <a className="rounded-2xl border bg-white p-5 hover:shadow">
            <div className="text-lg font-medium">📝 퀴즈 연습</div>
            <p className="mt-1 text-sm text-gray-600">객관식/빈칸</p>
          </a>
          <a className="rounded-2xl border bg-white p-5 hover:shadow">
            <div className="text-lg font-medium">📊 학습 기록</div>
            <p className="mt-1 text-sm text-gray-600">정답률/연속일</p>
          </a>
        </div>
      </section>

      <nav className="sticky bottom-0 border-t bg-white">
        <ul className="mx-auto flex max-w-md justify-around py-3 text-sm">
          <li className="font-semibold">🏠 홈</li>
          <li className="text-gray-500">📚 학습</li>
          <li className="text-gray-500">📊 통계</li>
          <li className="text-gray-500">👤 마이</li>
        </ul>
      </nav>
    </main>
  );
}
