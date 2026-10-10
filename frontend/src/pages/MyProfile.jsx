import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import verifiedIcon from "../assets/verified_icon.svg";

const fallbackAvatar = assets.profile_pic;

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } =
    useContext(AppContext);
  const [image, setImage] = useState(null);
  const [labFile, setLabFile] = useState(null);
  const [activeTab, setActiveTab] = useState("contact");
  const [editingField, setEditingField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateUserProfileData = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      labFile && formData.append("labFile", labFile);
      image && formData.append("image", image);
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      formData.append("familyMembers", JSON.stringify(userData.familyMembers || []));

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setImage(null);
        setLabFile(null);
        setEditingField(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "contact", label: "Contact", icon: "📞" },
    { id: "basic", label: "Basic Info", icon: "👤" },
    { id: "documents", label: "Documents", icon: "📄" },
    { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  ];

  const handleFieldChange = (field, value, nested = null) => {
    if (nested) {
      setUserData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [nested]: value },
      }));
    } else {
      setUserData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const EditableField = ({ label, field, value, type = "text", nested = null, disabled = false }) => {
    const isEditing = editingField === `${field}${nested ? `.${nested}` : ""}`;
    const fieldKey = `${field}${nested ? `.${nested}` : ""}`;

    return (
      <div className="group">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
          {label}
        </label>
        <div className="relative">
          {isEditing && !disabled ? (
            <input
              type={type}
              value={value || ""}
              onChange={(e) => handleFieldChange(field, e.target.value, nested)}
              onBlur={() => setEditingField(null)}
              autoFocus
              className="w-full px-4 py-3 bg-white border-2 border-[#009f9a] rounded-xl text-gray-800 
                         focus:outline-none focus:ring-4 focus:ring-[#ddf8f2] transition-all duration-200
                         shadow-sm"
            />
          ) : (
            <div
              onClick={() => !disabled && setEditingField(fieldKey)}
              className={`w-full px-4 py-3 bg-gray-50/80 rounded-xl text-gray-800 
                         transition-all duration-200 flex items-center justify-between
                         ${!disabled ? "cursor-pointer hover:bg-[#effcfb] hover:border-[#b2ebe0] border-2 border-transparent group-hover:shadow-md" : "border-2 border-transparent"}`}
            >
              <span className={value ? "" : "text-gray-400"}>{value || "Not set"}</span>
              {!disabled && (
                <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SelectField = ({ label, field, value, options }) => {
    const isEditing = editingField === field;

    return (
      <div className="group">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
          {label}
        </label>
        <div className="relative">
          {isEditing ? (
            <select
              value={value || ""}
              onChange={(e) => {
                handleFieldChange(field, e.target.value);
                setEditingField(null);
              }}
              onBlur={() => setEditingField(null)}
              autoFocus
              className="w-full px-4 py-3 bg-white border-2 border-[#009f9a] rounded-xl text-gray-800 
                         focus:outline-none focus:ring-4 focus:ring-[#ddf8f2] transition-all duration-200
                         shadow-sm appearance-none cursor-pointer"
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <div
              onClick={() => setEditingField(field)}
              className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-gray-800 cursor-pointer
                         transition-all duration-200 flex items-center justify-between
                         hover:bg-[#effcfb] hover:border-[#b2ebe0] border-2 border-transparent group-hover:shadow-md"
            >
              <span className={value ? "" : "text-gray-400"}>{value || "Not set"}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(110deg,#effcfb 0%,#f7fcfc 48%,#e9f8f8 100%)" }}>
      {/* Hero Section with Profile */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }} />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        {/* Content */}
        <div className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-24 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              My Profile
            </h1>
            <p className="text-[#ddf8f2] text-sm sm:text-base max-w-md mx-auto">
              Manage your personal information and keep your profile up to date
            </p>
          </motion.div>
        </div>
      </div>

      {/* Profile Card - Floating above hero */}
      <div className="px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Avatar Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-[#dceeed] p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-[#ddf8f2] shadow-lg">
                  <img
                    src={image ? URL.createObjectURL(image) : userData.image || fallbackAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = fallbackAvatar; }}
                  />
                </div>

                {/* Verified Badge */}
                {userData.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                    <img src={verifiedIcon} alt="Verified" className="w-6 h-6" />
                  </div>
                )}

                {/* Upload Overlay */}
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center 
                           opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="text-white text-center">
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs">Change</span>
                  </div>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  hidden
                />
              </div>

              {/* Name & Email */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  {editingField === "name" ? (
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      onBlur={() => setEditingField(null)}
                      autoFocus
                      className="text-xl sm:text-2xl font-bold text-gray-800 bg-transparent border-b-2 border-[#009f9a] 
                                 focus:outline-none px-1"
                    />
                  ) : (
                    <h2
                      onClick={() => setEditingField("name")}
                      className="text-xl sm:text-2xl font-bold text-gray-800 cursor-pointer hover:text-[#009f9a] transition-colors"
                    >
                      {userData.name}
                    </h2>
                  )}
                  {userData.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {userData.email}
                </p>
              </div>

              {/* Save Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={updateUserProfileData}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold 
                          rounded-xl shadow-lg shadow-[#b2ebe0] hover:shadow-xl hover:shadow-[#009f9a]/30 
                          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                          flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-1.5 mb-6 flex gap-1 shadow-sm border border-[#dceeed]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200
                           flex items-center justify-center gap-2
                           ${activeTab === tab.id
                    ? "bg-white text-[#009f9a] shadow-md"
                    : "text-gray-600 hover:text-[#009f9a] hover:bg-white/50"
                  }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-xl border border-[#dceeed] p-6 sm:p-8"
            >
              {activeTab === "contact" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#ddf8f2] rounded-xl flex items-center justify-center">
                      <span className="text-xl">📞</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
                      <p className="text-sm text-gray-500">How can we reach you?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <EditableField label="Email Address" field="email" value={userData.email} disabled />
                    <EditableField label="Phone Number" field="phone" value={userData.phone} type="tel" />
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">
                      Address
                    </label>
                    <div className="grid grid-cols-1 gap-4">
                      <EditableField label="Address Line 1" field="address" value={userData.address?.line1} nested="line1" />
                      <EditableField label="Address Line 2" field="address" value={userData.address?.line2} nested="line2" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                      <p className="text-sm text-gray-500">Your personal details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <SelectField label="Gender" field="gender" value={userData.gender} options={["Male", "Female", "Other"]} />
                    <EditableField label="Date of Birth" field="dob" value={userData.dob} type="date" />
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl">📄</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Documents</h3>
                      <p className="text-sm text-gray-500">Your medical documents and reports</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Lab Report Upload */}
                    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-6 border-2 border-dashed border-violet-200 hover:border-[#009f9a] transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">🧪</span>
                        <div>
                          <h4 className="font-semibold text-gray-800">Lab Reports</h4>
                          <p className="text-xs text-gray-500">PDF or Image files</p>
                        </div>
                      </div>

                      {labFile ? (
                        <div className="flex items-center gap-2 bg-white rounded-lg p-3">
                          <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-gray-700 truncate flex-1">{labFile.name}</span>
                          <button onClick={() => setLabFile(null)} className="text-gray-400 hover:text-red-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : userData.labFile ? (
                        <a
                          href={userData.labFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#009f9a] hover:text-[#009f9a] font-medium text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Current Report
                        </a>
                      ) : (
                        <p className="text-sm text-gray-400">No report uploaded</p>
                      )}

                      <label
                        htmlFor="lab-upload"
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white text-[#009f9a] 
                                  rounded-lg cursor-pointer hover:bg-[#ddf8f2] transition-colors text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload New
                      </label>
                      <input
                        id="lab-upload"
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={(e) => setLabFile(e.target.files[0])}
                        hidden
                      />
                    </div>

                    {/* Prescription */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-dashed border-green-200">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">💊</span>
                        <div>
                          <h4 className="font-semibold text-gray-800">Prescription</h4>
                          <p className="text-xs text-gray-500">From your doctor</p>
                        </div>
                      </div>

                      {userData.prescription ? (
                        <a
                          href={userData.prescription}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Prescription
                        </a>
                      ) : (
                        <p className="text-sm text-gray-400">No prescription found</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "family" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl">👨‍👩‍👧‍👦</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Family Members</h3>
                      <p className="text-sm text-gray-500">Manage your family profiles for easy booking</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(userData.familyMembers || []).map((member, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.relation} • {member.age} yrs • {member.gender}</p>
                        </div>
                        <button 
                          onClick={() => {
                            const newMembers = [...userData.familyMembers];
                            newMembers.splice(index, 1);
                            handleFieldChange("familyMembers", newMembers);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4 mt-6">
                    <h4 className="font-semibold mb-4 text-gray-700">Add New Family Member</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input id="new-fam-name" type="text" placeholder="Name" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#009f9a]" />
                      <input id="new-fam-relation" type="text" placeholder="Relation (e.g. Father, Daughter)" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#009f9a]" />
                      <input id="new-fam-age" type="number" placeholder="Age" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#009f9a]" />
                      <select id="new-fam-gender" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#009f9a]">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => {
                        const name = document.getElementById("new-fam-name").value;
                        const relation = document.getElementById("new-fam-relation").value;
                        const age = document.getElementById("new-fam-age").value;
                        const gender = document.getElementById("new-fam-gender").value;
                        if (!name || !relation || !age || !gender) {
                          toast.error("Please fill all fields");
                          return;
                        }
                        const newMembers = [...(userData.familyMembers || []), { name, relation, age: Number(age), gender }];
                        handleFieldChange("familyMembers", newMembers);
                        document.getElementById("new-fam-name").value = "";
                        document.getElementById("new-fam-relation").value = "";
                        document.getElementById("new-fam-age").value = "";
                        document.getElementById("new-fam-gender").value = "";
                      }}
                      className="mt-4 px-4 py-2 bg-[#ddf8f2] text-[#009f9a] font-medium rounded-lg hover:bg-[#b2ebe0] transition-colors"
                    >
                      Add Member
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default MyProfile;