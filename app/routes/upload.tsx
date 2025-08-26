import { type FormEvent, useState } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { useAuthStore } from "~/lib/auth";
import { useResumeStore } from "~/lib/resumeStore";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";
import { analyzeResume } from "~/lib/aiService";

const Upload = () => {
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore();
  const { createResume, createFeedback } = useResumeStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    if (!isInitialized) return; // Wait for auth initialization
    
    if (!isAuthenticated) {
      navigate("/auth?next=/upload");
      return;
    }

    setIsProcessing(true);

    try {
      setStatusText("Converting to image...");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file) {
        setStatusText("Error: Failed to convert PDF to image");
        return;
      }

      setStatusText("Creating resume record...");
      const resumeId = await createResume({
        companyName,
        jobTitle,
        resumeFile: file,
        imageFile: imageFile.file,
      });

      setStatusText("Analyzing resume...");
      // Use AI service to analyze resume content
      const instructions = prepareInstructions({ jobTitle, jobDescription });
      const feedback = await analyzeResume(file, instructions);

      await createFeedback(resumeId, feedback);

      setStatusText("Analysis complete, redirecting...");
      navigate(`/resume/${resumeId}`);
    } catch (error) {
      console.error("Upload error:", error);
      setStatusText("Error: Failed to process resume");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) {
      setStatusText("Please select a resume file");
      return;
    }
    if (!companyName || !jobTitle || !jobDescription) {
      setStatusText("Please fill in all fields");
      return;
    }

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

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
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                />
              </div>

              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};
export default Upload;
