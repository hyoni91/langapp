import LearningCard from "@/components/learning/LearningCard";
import StudyTimerBadge from "@/components/timer/StudyTimerBadge";
import StudyStartButton from "@/components/timer/StudyStartButton";

export default function LessonsPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">今日のカード</h1>
        <StudyStartButton /* redirectTo="/lessons" 생략 가능 */ />

      <div className="mt-3">
          <LearningCard  />
      </div>

      <StudyTimerBadge />
      
    </main>
  );
}
