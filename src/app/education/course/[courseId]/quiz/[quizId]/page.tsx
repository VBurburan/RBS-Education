"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight } from "lucide-react";

export default function QuizPage({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    supabase.from("lms_quizzes").select("*").eq("id", quizId).single().then(({ data }) => setQuiz(data));
    supabase.from("lms_quiz_questions").select("*").eq("quiz_id", quizId).order("sort_order").then(({ data }) => setQuestions(data || []));
  }, [quizId]);

  function handleSubmit() {
    let correct = 0;
    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      const correctAnswer = q.correct_answer;
      if (q.type === "single" && userAnswer === correctAnswer) correct++;
      else if (q.type === "multi" && JSON.stringify(userAnswer?.sort()) === JSON.stringify(correctAnswer?.sort())) correct++;
    });
    setScore(Math.round((correct / questions.length) * 100));
    setSubmitted(true);
  }

  if (!quiz) return <div className="p-8"><div className="animate-pulse h-8 bg-navy-100 rounded w-1/3" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <Link href={`/education/course/${courseId}`} className="inline-flex items-center gap-1 text-sm text-navy-500 hover:text-navy-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Course
      </Link>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-2">{quiz.title}</h1>
      <p className="text-navy-500 text-sm mb-6">Passing score: {quiz.passing_score}%</p>

      {submitted && (
        <div className={`p-4 rounded-xl mb-6 ${score >= quiz.passing_score ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <div className="flex items-center gap-2">
            {score >= quiz.passing_score ? <CheckCircle2 className="w-5 h-5 text-green-700" /> : <XCircle className="w-5 h-5 text-red-600" />}
            <span className={`font-semibold ${score >= quiz.passing_score ? "text-green-800" : "text-red-800"}`}>
              Score: {score}% â {score >= quiz.passing_score ? "Passed!" : "Not passed"}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-white rounded-xl border border-navy-100 p-5">
            <p className="font-medium text-navy-800 mb-3">{i + 1}. {q.question_text}</p>
            <div className="space-y-2">
              {(q.options || []).map((opt: any, j: number) => {
                const value = typeof opt === "string" ? opt : opt.value || opt.text || opt;
                const label = typeof opt === "string" ? opt : opt.label || opt.text || opt;
                const selected = q.type === "multi" ? (answers[q.id] || []).includes(value) : answers[q.id] === value;
                return (
                  <button key={j} disabled={submitted}
                    onClick={() => {
                      if (q.type === "multi") {
                        const current = answers[q.id] || [];
                        setAnswers({ ...answers, [q.id]: selected ? current.filter((x: string) => x !== value) : [...current, value] });
                      } else {
                        setAnswers({ ...answers, [q.id]: value });
                      }
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border transition-colors ${
                      selected ? "border-navy-600 bg-navy-50 text-navy-900 font-medium" : "border-navy-100 text-navy-700 hover:bg-navy-50"
                    } ${submitted ? "cursor-default" : "cursor-pointer"}`}>
                    {label}
                  </button>
                );
              })}
            </div>
            {submitted && q.rationale && (
              <p className="mt-3 text-sm text-navy-600 bg-navy-50 p-3 rounded-lg">{q.rationale}</p>
            )}
          </div>
        ))}
      </div>

      {!submitted && questions.length > 0 && (
        <button onClick={handleSubmit}
          className="mt-6 px-6 py-3 bg-navy-900 text-white rounded-lg font-medium text-sm hover:bg-navy-800 transition-colors">
          Submit Quiz
        </button>
      )}
    </div>
  );
}
