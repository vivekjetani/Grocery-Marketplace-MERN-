import { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Save,
  Users,
  MapPin,
  IndianRupee,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Mail,
  Phone,
  Paperclip,
  Check,
  X
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const AdminCareers = () => {
  const { axios, backendUrl, getImageUrl } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("jobs"); // 'jobs' | 'applications'

  // Jobs State
  const [jobs, setJobs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef(null);

  // Applications State
  const [applications, setApplications] = useState([]);

  // Confirm Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Data
  const fetchJobs = async () => {
    try {
      const { data } = await axios.get("/api/career/admin/list");
      if (data.success) setJobs(data.careers);
    } catch (err) {
      toast.error("Failed to fetch jobs");
    }
  };

  const fetchApplications = async () => {
    try {
      const { data } = await axios.get("/api/career/applications");
      if (data.success) setApplications(data.applications);
    } catch (err) {
      toast.error("Failed to fetch applications");
    }
  };

  useEffect(() => {
    if (activeTab === "jobs") fetchJobs();
    else fetchApplications();
  }, [activeTab]);

  // Form Initial State
  const initialForm = {
    title: "",
    description: "",
    requirements: "", // Line separated
    location: "Remote",
    type: "Full-time",
    salaryRange: "",
    status: "Open",
    banner: null
  };

  const [formData, setFormData] = useState(initialForm);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImgSrc(URL.createObjectURL(file));
      setIsCropModalOpen(true);
    }
  };

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const cropUnit = makeAspectCrop(
      { unit: '%', width: 90 },
      4 / 1,
      width,
      height
    );
    const centeredCrop = centerCrop(cropUnit, width, height);
    setCrop(centeredCrop);
  }

  async function getCroppedImg() {
    if (!completedCrop || !imgRef.current) return;
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        const file = new File([blob], 'banner-cropped.jpg', { type: 'image/jpeg' });
        resolve({ file, preview: URL.createObjectURL(blob) });
      }, 'image/jpeg');
    });
  }

  const applyCrop = async () => {
    const cropped = await getCroppedImg();
    if (cropped) {
      setFormData((prev) => ({ ...prev, banner: cropped.file }));
      setBannerPreview(cropped.preview);
    }
    setIsCropModalOpen(false);
  };

  const openCreateModal = () => {
    setFormData(initialForm);
    setBannerPreview(null);
    setImgSrc('');
    setIsEditing(false);
    setCurrentJob(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements.join("\\n"),
      location: job.location,
      type: job.type,
      salaryRange: job.salaryRange,
      status: job.status,
      banner: null
    });
    setBannerPreview(job.bannerUrl ? getImageUrl(job.bannerUrl) : null);
    setImgSrc('');
    setIsEditing(true);
    setCurrentJob(job);
    setIsModalOpen(true);
  };

  const saveJob = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    // Convert newlines to JSON array string
    const reqArray = formData.requirements.split("\\n").filter((r) => r.trim() !== "");
    data.append("requirements", JSON.stringify(reqArray));
    data.append("location", formData.location);
    data.append("type", formData.type);
    data.append("salaryRange", formData.salaryRange);
    data.append("status", formData.status);
    if (formData.banner) {
      data.append("banner", formData.banner);
    }

    try {
      setIsSaving(true);
      if (isEditing) {
        const res = await axios.put(`/api/career/update/${currentJob._id}`, data);
        if (res.data.success) toast.success("Job updated");
      } else {
        const res = await axios.post("/api/career/create", data);
        if (res.data.success) toast.success("Job created");
      }
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save job");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteJob = async () => {
    if (!jobToDelete) return;
    try {
      setIsDeleting(true);
      const { data } = await axios.delete(`/api/career/delete/${jobToDelete}`);
      if (data.success) {
        toast.success("Job deleted");
        fetchJobs();
      }
    } catch (err) {
      toast.error("Failed to delete job");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setJobToDelete(null);
    }
  };

  const confirmDelete = (id) => {
    setJobToDelete(id);
    setShowDeleteConfirm(true);
  };

  const updateAppStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`/api/career/applications/${id}`, { status });
      if (data.success) {
        toast.success(`Application marked as ${status}`);
        fetchApplications();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const StatusBadge = ({ status }) => {
    let colors = "bg-slate-100 text-slate-700";
    if (status === "Open" || status === "Shortlisted") colors = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (status === "Closed" || status === "Rejected") colors = "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
    if (status === "Draft" || status === "Pending") colors = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    if (status === "Reviewed") colors = "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";

    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full ${colors}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Briefcase className="text-indigo-600 dark:text-indigo-400" size={32} />
            Careers Hub
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your recruitment, job openings, and applicant tracking.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center shadow-inner">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "jobs" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}
          >
            Job Openings
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "applications" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}
          >
            Applications
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* JOBS TAB */}
        {activeTab === "jobs" && (
          <motion.div
            key="jobs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="flex justify-end">
              <button
                onClick={openCreateModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
              >
                <Plus size={18} /> Add New Job
              </button>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <Briefcase size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">No Job Openings</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Create your first job posting to attract top talent.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div key={job._id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col transition-all hover:-translate-y-1">
                    {/* Banner */}
                    <div className="h-32 bg-slate-200 dark:bg-slate-700 relative overflow-hidden group">
                      {job.bannerUrl ? (
                        <img src={getImageUrl(job.bannerUrl)} alt="Banner" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon size={32} className="opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => openEditModal(job)} className="p-2 bg-white/90 dark:bg-slate-800/90 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-white transition-colors backdrop-blur-sm">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => confirmDelete(job._id)} className="p-2 bg-white/90 dark:bg-slate-800/90 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-white transition-colors backdrop-blur-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">{job.title}</h3>
                        <StatusBadge status={job.status} />
                      </div>

                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">
                        <p className="flex items-center gap-2"><MapPin size={14} /> {job.location}</p>
                        <p className="flex items-center gap-2"><Clock size={14} /> {job.type}</p>
                        {job.salaryRange && <p className="flex items-center gap-2"><IndianRupee size={14} /> {job.salaryRange}</p>}
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        <span>{job.requirements?.length || 0} Req.</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === "applications" && (
          <motion.div
            key="applications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden"
          >
            {applications.length === 0 ? (
              <div className="text-center py-20">
                <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">No Applications Yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">When candidates apply, they will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                      <th className="p-5 font-bold text-slate-800 dark:text-white text-sm">Applicant INFO</th>
                      <th className="p-5 font-bold text-slate-800 dark:text-white text-sm">Position</th>
                      <th className="p-5 font-bold text-slate-800 dark:text-white text-sm">Date</th>
                      <th className="p-5 font-bold text-slate-800 dark:text-white text-sm text-center">Resume</th>
                      <th className="p-5 font-bold text-slate-800 dark:text-white text-sm">Status / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {applications.map(app => (
                      <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="p-5">
                          <div className="font-bold text-slate-900 dark:text-white">{app.applicantName}</div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1"><Mail size={12} /> {app.applicantEmail}</span>
                            {app.applicantPhone && <span className="flex items-center gap-1"><Phone size={12} /> {app.applicantPhone}</span>}
                          </div>
                        </td>
                        <td className="p-5 font-medium text-slate-700 dark:text-slate-300">
                          {app.careerId?.title || <span className="text-rose-500 text-xs">(Deleted Role)</span>}
                        </td>
                        <td className="p-5 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-5 text-center">
                          <a
                            href={getImageUrl(app.resumeUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors"
                          >
                            <Paperclip size={18} />
                          </a>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <StatusBadge status={app.status} />
                            <select
                              value={app.status}
                              onChange={(e) => updateAppStatus(app._id, e.target.value)}
                              className="bg-slate-100 dark:bg-slate-700 border-none rounded-xl text-xs font-bold px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Reviewed">Reviewed</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* JOB MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                  {isEditing ? "Edit Job Opening" : "Create New Job Opening"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form id="jobForm" onSubmit={saveJob} className="space-y-6">

                  {/* Banner Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1 block">Banner (4:1 Ratio, e.g. 1584 x 396)</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group ${bannerPreview ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                    >
                      {bannerPreview ? (
                        <div className="w-full h-full relative">
                          <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold flex items-center gap-2"><Edit2 size={16} /> Change Banner</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <ImageIcon size={32} className="text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Click to upload banner image</p>
                          <p className="text-xs text-slate-400 mt-1">Recommended size: 1584x396px</p>
                        </>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Title & Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Job Title</label>
                      <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Senior Frontend Engineer" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Employment Type</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  {/* Location, Salary, Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Location</label>
                      <input type="text" name="location" required value={formData.location} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Remote / City" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Salary Range</label>
                      <input type="text" name="salaryRange" value={formData.salaryRange} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="₹80k - ₹120k" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Status</label>
                      <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Job Description</label>
                    <textarea name="description" required value={formData.description} onChange={handleInputChange} rows={4} className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Brief overview of the role..." />
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Requirements (Separate by new paragraph lines)</label>
                    <textarea name="requirements" value={formData.requirements} onChange={handleInputChange} rows={5} className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="• 3+ years experience&#10;• React / Node.js skills..." />
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
                <button
                  disabled={isSaving}
                  type="submit"
                  form="jobForm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:bg-slate-300 dark:disabled:bg-slate-700"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> {isEditing ? "Save Changes" : "Publish Job"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CROP MODAL */}
      <AnimatePresence>
        {isCropModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setIsCropModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-lg font-black text-slate-800 dark:text-white">Crop Banner</h3>
                <button onClick={() => setIsCropModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 bg-black/5 flex-1 overflow-auto flex items-center justify-center">
                {imgSrc && (
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={4 / 1}
                    className="max-w-full max-h-[60vh] rounded-xl overflow-hidden shadow-2xl"
                  >
                    <img
                      ref={imgRef}
                      src={imgSrc}
                      alt="Crop me"
                      onLoad={onImageLoad}
                      className="max-h-[60vh] w-auto object-contain"
                    />
                  </ReactCrop>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-4">
                <button onClick={() => setIsCropModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700">
                  Cancel
                </button>
                <button onClick={applyCrop} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2">
                  <Check size={18} /> Apply Crop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={deleteJob}
        title="Delete Job"
        message="Are you sure you want to delete this job opening? This will permanently remove the job and all submitted applications. This action cannot be undone."
        confirmText="Delete Job"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminCareers;
