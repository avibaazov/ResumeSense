import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { useResumeStore } from "~/lib/resumeStore";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
  onResumeDeleted,
}: {
  resume: Resume;
  onResumeDeleted?: () => void;
}) => {
  const { getFileBlob, deleteResume } = useResumeStore();
  const [resumeUrl, setResumeUrl] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadResume = async () => {
      const blob = await getFileBlob(imagePath);
      if (!blob) return;
      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    };

    loadResume();

    // Cleanup function to revoke object URL when component unmounts or imagePath changes
    return () => {
      if (resumeUrl) {
        URL.revokeObjectURL(resumeUrl);
      }
    };
  }, [imagePath, getFileBlob]);

  const handleDeleteResume = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !window.confirm(
        "Are you sure you want to delete this resume? This will permanently delete the resume, its feedback, and all associated files. This action cannot be undone."
      )
    )
      return;

    setDeleting(true);
    try {
      await deleteResume(id);
      onResumeDeleted?.();
    } catch (error) {
      console.error("Failed to delete resume:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="resume-card animate-in fade-in duration-1000 relative">
      <button
        onClick={handleDeleteResume}
        disabled={deleting}
        className="absolute top-2 right-2 z-10 bg-red-500/90 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-red-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg
  transition-all duration-200"
        title="Delete resume"
      >
        {deleting ? (
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )}
      </button>
      <Link to={`/resume/${id}`} className="block h-full">
        <div className="resume-card-header">
          <div className="flex flex-col gap-2">
            {companyName && (
              <h2 className="!text-black font-bold break-words">
                {companyName}
              </h2>
            )}
            {jobTitle && (
              <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>
            )}
            {!companyName && !jobTitle && (
              <h2 className="!text-black font-bold">Resume</h2>
            )}
          </div>
          <div className="flex-shrink-0">
            <ScoreCircle score={feedback.overallScore} />
          </div>
        </div>
        {resumeUrl && (
          <div className="gradient-border animate-in fade-in duration-1000">
            <div className="w-full h-full">
              <img
                src={resumeUrl}
                alt="resume"
                className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
              />
            </div>
          </div>
        )}
      </Link>
    </div>
  );
};
export default ResumeCard;
