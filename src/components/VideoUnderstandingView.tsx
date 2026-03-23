import React, { useState } from 'react';
import { Video, Send, Loader2, FileVideo, MessageSquare } from 'lucide-react';
import { analyzeVideo } from '../services/aiService';

export function VideoUnderstandingView() {
  const [video, setVideo] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setVideo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!video || !question.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeVideo(video, question);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze video.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
            <Video className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Video Understanding</h2>
            <p className="text-gray-500 dark:text-gray-400">Analyze videos for key information using Gemini Pro</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">Upload Video</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 group-hover:border-indigo-400 dark:group-hover:border-indigo-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all">
                  <FileVideo className="w-12 h-12 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {video ? "Video uploaded successfully" : "Click or drag to upload a video for analysis"}
                  </p>
                </div>
              </div>
              {video && (
                <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <video src={video} controls className="w-full max-h-64 object-contain bg-black" />
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">Ask a Question</label>
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What is happening in this video? Describe the fashion style..."
                  className="w-full p-4 pr-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-colors"
                  rows={4}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !video || !question.trim()}
                  className="absolute bottom-4 right-4 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl shadow-lg transition-all"
                >
                  {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col transition-colors">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Analysis Result</h3>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Gemini is watching the video...</p>
                  </div>
                ) : analysis ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{analysis}</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                    <Video className="w-16 h-16 opacity-20" />
                    <p className="text-sm">Analysis will appear here after you ask a question.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
