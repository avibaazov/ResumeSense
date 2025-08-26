import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useAuthStore } from "~/lib/auth";
import { useResumeStore } from "~/lib/resumeStore";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeSense" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore();
  const { getUserResumes } = useResumeStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    // Only redirect after auth is initialized to prevent hydration mismatch
    if (isInitialized && !isAuthenticated) {
      navigate("/auth?next=/");
    }
  }, [isAuthenticated, isInitialized, navigate]);

  useEffect(() => {
    const loadResumes = async () => {
      if (!isAuthenticated || !isInitialized) return;

      setLoadingResumes(true);
      try {
        const userResumes = await getUserResumes();
        setResumes(userResumes);
      } catch (error) {
        console.error("Failed to load resumes:", error);
      } finally {
        setLoadingResumes(false);
      }
    };

    loadResumes();
  }, [isAuthenticated, isInitialized, getUserResumes]);

  // Show loading during auth initialization
  if (!isInitialized || isLoading) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />
        <section className="main-section">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>
        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onResumeDeleted={() => {
                  setResumes((prev) => prev.filter((r) => r.id !== resume.id));
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
