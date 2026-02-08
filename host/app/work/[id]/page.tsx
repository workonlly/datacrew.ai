"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, X, Globe, LayoutTemplate, Loader2, AlertCircle, Save, Code, Eye, Copy, Check } from "lucide-react";

export default function CreateComponentPage() {
  const router = useRouter();
  const params = useParams(); 

  // Check for Edit Mode
  // Safely handle params to avoid type errors
  const maskId = params?.id ? String(params.id) : null;
  const isEditMode = !!maskId;

  // --- State for Data ---
  const [title, setTitle] = useState(""); 
  const [description, setDescription] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [currentApiKey, setCurrentApiKey] = useState("");
  
  // --- State for UI/Network ---
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // --- State for Embed/Preview ---
  const [embedCode, setEmbedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // --- 1. Fetch User ID on Mount ---
  useEffect(() => {
    const storedId = localStorage.getItem("user_id");
    if (storedId) {
      setUserId(storedId);
    } else {
      setError("User not logged in. Please sign in first.");
    }
  }, []);

  // --- 2. Fetch Existing Data & Generate Snippet ---
  useEffect(() => {
    if (isEditMode && maskId) {
      setLoading(true);
      fetch(`http://localhost:8000/describing/${maskId}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch data");
          return res.json();
        })
        .then((data) => {
          setTitle(data.title || "");
          setDescription(data.description || "");
          
          if (Array.isArray(data.site_url)) {
            setUrls(data.site_url);
          } else {
            setUrls([]);
          }

          // Generate the Embed Snippet based on the fetched ID
          const snippet = `<iframe 
  src="http://localhost:8000/embed/${maskId}" 
  width="100%" 
  height="600" 
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"
  title="${data.title || 'AI Widget'}">
</iframe>`;
          setEmbedCode(snippet);
        })
        .catch((err) => {
          console.error(err);
          setError("Could not load existing details.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [maskId, isEditMode]);

  // --- 3. Fetch Live Preview HTML ---
  useEffect(() => {
    if (isEditMode && maskId) {
      setPreviewLoading(true);
      
      const fetchPreview = async () => {
        try {
          const response = await fetch(`http://localhost:8000/jobs/by-mask/${maskId}`);
          
          if (!response.ok) {
            if (response.status === 404) {
              setPreviewHtml("<div style='display: flex; align-items: center; justify-content: center; height: 100%; font-family: system-ui; color: #64748b;'><p>Job is still processing... Refresh to check.</p></div>");
              return;
            }
            throw new Error("Failed to fetch preview");
          }

          const data = await response.json();
          
          if (data.html_code) {
            setPreviewHtml(data.html_code);
          } else {
            setPreviewHtml("<div style='display: flex; align-items: center; justify-content: center; height: 100%; font-family: system-ui; color: #ef4444;'><p>No HTML generated yet.</p></div>");
          }
        } catch (err) {
          console.error("Preview fetch error:", err);
          setPreviewHtml("<div style='display: flex; align-items: center; justify-content: center; height: 100%; font-family: system-ui; color: #ef4444;'><p>Error loading preview.</p></div>");
        } finally {
          setPreviewLoading(false);
        }
      };

      fetchPreview();
      
      // Optional: Poll every 5 seconds to check if job completed
      const interval = setInterval(fetchPreview, 5000);
      return () => clearInterval(interval);
    }
  }, [maskId, isEditMode]);

  // --- 4. Helper to add links ---
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUrl && !urls.includes(currentUrl)) {
      try {
        new URL(currentUrl); 
        setUrls([...urls, currentUrl]);
        setCurrentUrl("");
      } catch (_) {
        alert("Please enter a valid URL (e.g., https://google.com)");
      }
    }
  };

  // --- 5. Helper to add API keys ---
  const handleAddApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentApiKey && !apiKeys.includes(currentApiKey)) {
      setApiKeys([...apiKeys, currentApiKey]);
      setCurrentApiKey("");
    }
  };

  // --- 6. Helper to remove items ---
  const removeUrl = (urlToRemove: string) => {
    setUrls(urls.filter((url) => url !== urlToRemove));
  };

  const removeApiKey = (keyToRemove: string) => {
    setApiKeys(apiKeys.filter((key) => key !== keyToRemove));
  };

  // --- 7. Clipboard Copy ---
  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- 8. Submit Handler ---
  const handleSubmit = async () => {
    if (!title.trim()) return;

    if (!isEditMode && !userId) {
       setError("User ID missing.");
       return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    
    // Backend API Requirements:
    formData.append("mask_name", title.trim());
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    
    if (userId) formData.append("user_id", userId);

    urls.forEach(url => formData.append("site_url", url));
    apiKeys.forEach(key => formData.append("api_keys", key));

    try {
      let response;
      if (isEditMode) {
        response = await fetch(`http://localhost:8000/describing/update/${maskId}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        response = await fetch("http://localhost:8000/masks/add/", {
          method: "POST",
          body: formData,
        });
      }

      if (response.ok) {
        // If creating new, we might want to redirect to the edit page to show the embed code
        // For now, simple refresh
        router.refresh(); 
      } else {
        const errText = await response.text();
        setError(`Failed to ${isEditMode ? 'update' : 'create'}: ${errText}`);
      }
    } catch (err) {
      setError("Network error. Ensure backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
      
      {/* 1. Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
            {isEditMode ? "Edit Widget" : "Create New Widget"}
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
            Configure your AI scraper settings below.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Card: Basic Info */}
          <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <LayoutTemplate className="text-rose-500" size={20} />
              Component Details
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What is your component about? <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Crypto Price Ticker"
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description / AI Prompt
                </label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe how you want the data to be structured or displayed..."
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400 resize-none"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Our AI will use this description to format your scraped data.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Data Sources */}
          <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Globe className="text-rose-500" size={20} />
              Data Sources
            </h3>
             
            {/* URL Input */}
            <form onSubmit={handleAddUrl} className="flex gap-3 mb-6">
              <input 
                type="text" 
                value={currentUrl}
                onChange={(e) => setCurrentUrl(e.target.value)}
                placeholder="https://example.com/news"
                className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
              <button 
                type="submit"
                className="px-6 py-4 bg-slate-900 text-white rounded-xl hover:bg-rose-600 transition-colors font-medium flex items-center gap-2"
              >
                <Plus size={20} /> Add
              </button>
            </form>

            {/* URL List */}
            <div className="flex flex-wrap gap-3 mb-8">
              {urls.length === 0 && (
                <p className="text-sm text-slate-400 italic py-2">No links added yet.</p>
              )}
              {urls.map((url, index) => (
                <div key={index} className="flex items-center gap-3 pl-4 pr-3 py-2 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-sm font-medium">
                  <span className="truncate max-w-[200px]">{url}</span>
                  <button onClick={() => removeUrl(url)} className="p-1 hover:bg-rose-100 rounded-full transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* API Key Input */}
            <form onSubmit={handleAddApiKey} className="flex gap-3 mb-6 border-t border-slate-100 pt-6">
              <input 
                type="text" 
                value={currentApiKey}
                onChange={(e) => setCurrentApiKey(e.target.value)}
                placeholder="Enter API Key (Optional)"
                className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
              <button 
                type="submit"
                className="px-6 py-4 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium flex items-center gap-2"
              >
                <Plus size={20} /> Add Key
              </button>
            </form>

            {/* API Key List */}
            <div className="flex flex-wrap gap-3">
              {apiKeys.length === 0 && <p className="text-sm text-slate-400 italic">No API keys.</p>}
              {apiKeys.map((key, index) => (
                <div key={index} className="flex items-center gap-3 pl-4 pr-3 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-sm font-medium">
                  <span className="truncate max-w-[200px]">{key}</span>
                  <button onClick={() => removeApiKey(key)} className="p-1 hover:bg-blue-100 rounded-full transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={loading || !title || (!isEditMode && !userId)}
            className="w-full py-5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-rose-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                {isEditMode ? <Save size={20} /> : <Plus size={20} />}
                {isEditMode ? "Save Changes" : "Generate Widget"}
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Preview & Embed (Only in Edit Mode) */}
        {isEditMode && (
          <div className="lg:col-span-1 space-y-6">
            
            {/* Live Preview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[70vh]">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Eye className="text-indigo-500" size={18} />
                <h3 className="font-bold text-slate-700">Live Preview</h3>
              </div>
              <div className="flex-1 bg-slate-100 relative overflow-auto">
                {previewLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="animate-spin text-rose-500 mx-auto mb-2" size={32} />
                      <p className="text-sm text-slate-600">Loading preview...</p>
                    </div>
                  </div>
                ) : (
                  <iframe 
                    srcDoc={previewHtml}
                    className="w-full h-full min-h-[600px] border-none"
                    title="Widget Preview"
                    sandbox="allow-scripts"
                  />
                )}
              </div>
            </div>

            {/* Embed Code Card */}
            {embedCode && (
              <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Code className="text-green-400" size={18} />
                    Integration Code
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">HTML</span>
                </div>
                
                <div className="relative group">
                  <pre className="bg-black/50 p-4 rounded-xl text-slate-300 text-xs font-mono overflow-x-auto border border-white/10 whitespace-pre-wrap break-all">
                    {embedCode}
                  </pre>
                  <button 
                    onClick={handleCopyCode}
                    className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-md transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                
                <div className="mt-8 pt-4 border-t border-white/5">
                  <p className="text-xs text-slate-500 mb-1">Direct API Endpoint</p>
                  <code className="text-green-400 text-xs break-all">
                    GET http://localhost:8000/embed/{maskId}
                  </code>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}