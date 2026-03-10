import { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { MapPin, Clock, DollarSign, ArrowLeft, Send, Paperclip, CheckCircle } from "lucide-react";

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { axios, backendUrl } = useContext(AppContext);

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [applied, setApplied] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        applicantName: "",
        applicantEmail: "",
        applicantPhone: "",
        coverLetter: "",
        resume: null
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const { data } = await axios.get(`/api/career/${id}`);
        if (data.success) {
          setJob(data.career);
        }
      } catch (error) {
        toast.error("Job not found");
        navigate("/careers");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, axios, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setFormData(prev => ({ ...prev, resume: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resume) {
      toast.error("Resume is required");
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append("applicantName", formData.applicantName);
    data.append("applicantEmail", formData.applicantEmail);
    data.append("applicantPhone", formData.applicantPhone);
    data.append("coverLetter", formData.coverLetter);
    data.append("resume", formData.resume);

    try {
      const res = await axios.post(`/api/career/apply/${id}`, data);
      if (res.data.success) {
        toast.success("Application submitted successfully!");
        setApplied(true);
      }
    } catch (error) {
       toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Back Link */}
        <Link to="/careers" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-8">
           <ArrowLeft size={16} /> Back to Open Roles
        </Link>

        {/* Banner */}
        {job.bannerUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="w-full h-48 md:h-72 rounded-3xl overflow-hidden mb-10 shadow-xl"
          >
            <img src={`${backendUrl}/images/${job.bannerUrl}`} alt="Job Banner" className="w-full h-full object-cover" />
          </motion.div>
        )}

        {/* Job Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm font-bold bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm inline-flex">
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl"><MapPin size={16} className="text-indigo-500" /> {job.location}</span>
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl"><Clock size={16} className="text-indigo-500" /> {job.type}</span>
            {job.salaryRange && <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl"><DollarSign size={16} className="text-emerald-500" /> {job.salaryRange}</span>}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Job Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">About the Role</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
            
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Requirements</h3>
                <ul className="space-y-4">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={14} />
                      </div>
                      <span className="text-slate-600 dark:text-slate-400 leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* Application Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl sticky top-24">
              {applied ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Application Sent!</h3>
                  <p className="text-slate-500 dark:text-slate-400">Thanks for applying. Our HR team will review your profile and get back to you soon.</p>
                  <Link to="/careers" className="mt-8 inline-block bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold px-6 py-3 rounded-xl transition-colors">
                    Browse More Jobs
                  </Link>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Apply Now</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input type="text" name="applicantName" required value={formData.applicantName} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <input type="email" name="applicantEmail" required value={formData.applicantEmail} onChange={handleInputChange} placeholder="Email Address" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <input type="tel" name="applicantPhone" required value={formData.applicantPhone} onChange={handleInputChange} placeholder="Phone Number" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <textarea name="coverLetter" value={formData.coverLetter} onChange={handleInputChange} placeholder="Cover Letter (Optional)" rows={3} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white resize-none" />
                    </div>
                    
                    {/* File Upload */}
                    <div>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${formData.resume ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <Paperclip size={24} className={formData.resume ? "text-indigo-500 mb-2" : "text-slate-400 mb-2"} />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 text-center">
                          {formData.resume ? formData.resume.name : "Upload Resume (PDF)"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Max size: 5MB</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                    >
                      {submitting ? "Sending..." : "Submit Application"} <Send size={18} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
