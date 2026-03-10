import { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { MapPin, Clock, IndianRupee, ArrowLeft, Send, Paperclip, CheckCircle } from "lucide-react";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axios, getImageUrl } = useContext(AppContext);

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
      <div className="max-w-5xl mx-auto px-6">

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
            <img src={getImageUrl(job.bannerUrl)} alt="Job Banner" className="w-full h-full object-cover" />
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
            {job.salaryRange && <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl"><IndianRupee size={16} className="text-emerald-500" /> {job.salaryRange}</span>}
          </div>
        </motion.div>

        <div className="space-y-16">
          {/* Job Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-12">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">About the Role</h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {job.requirements.map((req, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-4 list-none"
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={14} />
                      </div>
                      <span className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{req}</span>
                    </motion.li>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Application Form - Full Size */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="pt-12 border-t border-slate-200 dark:border-slate-800"
          >
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-16 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full" />

              {applied ? (
                <div className="text-center py-10 relative z-10">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Application Successfully Sent!</h3>
                  <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto">Thanks for applying. Our talent acquisition team will review your profile and get back to you within 48 hours.</p>
                  <Link to="/careers" className="mt-10 inline-block bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black px-10 py-4 rounded-full transition-transform hover:scale-105 shadow-xl">
                    Explore More Opportunities
                  </Link>
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="max-w-2xl mx-auto text-center mb-12">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Apply Now</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Fill out the form below to start your journey with us. We can't wait to meet you!</p>
                  </div>

                  <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                        <input type="text" name="applicantName" required value={formData.applicantName} onChange={handleInputChange} placeholder="Your full name" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-base focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                        <input type="email" name="applicantEmail" required value={formData.applicantEmail} onChange={handleInputChange} placeholder="your@email.com" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-base focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Phone Number</label>
                        <input type="tel" name="applicantPhone" required value={formData.applicantPhone} onChange={handleInputChange} placeholder="+91 00000 00000" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-base focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Resume (PDF)</label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-full border-2 border-dashed rounded-2xl px-6 py-3.5 flex items-center justify-between cursor-pointer transition-all ${formData.resume ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Paperclip size={20} className={formData.resume ? "text-indigo-500" : "text-slate-400"} />
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                              {formData.resume ? formData.resume.name : "Select PDF Resume"}
                            </p>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter shrink-0">MAX 5MB</span>
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 mb-10">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Cover Letter (Optional)</label>
                      <textarea name="coverLetter" value={formData.coverLetter} onChange={handleInputChange} placeholder="Tell us why you're a great fit..." rows={4} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-base focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white resize-none transition-all" />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-70 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {submitting ? "Processing Submission..." : "Submit Application"} <Send size={20} />
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-6 font-medium">By submitting, you agree to our privacy policy and terms of recruitment.</p>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default JobDetails;
