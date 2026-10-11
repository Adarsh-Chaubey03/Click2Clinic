import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import ProfileSidebar from "../components/ProfileSidebar.jsx";

const fallbackAvatar = assets.profile_pic;

/* ── small reusable input wrapper ─────────────────────────────── */
const Field = ({ label, value, onChange, type = "text", disabled = false, icon, placeholder }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-[#5f7185] uppercase tracking-wide">{label}</label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ab5c0]">{icon}</span>
      )}
      <input
        type={type}
        value={value || ""}
        onChange={(e) => !disabled && onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder || ""}
        className={`w-full ${icon ? "pl-9" : "pl-4"} pr-4 py-3 rounded-xl border border-[#dceeed] text-sm text-[#10233f]
          placeholder:text-[#b0bec5] focus:outline-none focus:border-[#009f9a] focus:ring-2 focus:ring-[#ddf8f2]
          transition-all bg-white ${disabled ? "bg-[#f5fdfc] cursor-not-allowed text-[#9ab5c0]" : ""}`}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, icon }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-[#5f7185] uppercase tracking-wide">{label}</label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ab5c0]">{icon}</span>
      )}
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${icon ? "pl-9" : "pl-4"} pr-4 py-3 rounded-xl border border-[#dceeed] text-sm text-[#10233f]
          focus:outline-none focus:border-[#009f9a] focus:ring-2 focus:ring-[#ddf8f2] transition-all bg-white appearance-none cursor-pointer`}
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ab5c0]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  </div>
);

/* ── SVG icons ────────────────────────────────────────────────── */
const IconPhone = <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z"/></svg>;
const IconMail = <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const IconPin = <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>;
const IconCity = <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6Zm-8 8H5v-2h2v2Zm0-4H5v-2h2v2Zm0-4H5v-2h2v2Zm6 8h-2v-2h2v2Zm0-4h-2v-2h2v2Zm0-4h-2v-2h2v2Zm0-4h-2V7h2v2Zm6 12h-2v-2h2v2Zm0-4h-2v-2h2v2Z"/></svg>;
const IconUser = <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4Z"/></svg>;
const IconDoc = <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm2 16H8v-2h8v2Zm0-4H8v-2h8v2Zm-3-5V3.5L18.5 9H13Z"/></svg>;
const IconFamily = <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"/></svg>;

/* ── Tab definitions ──────────────────────────────────────────── */
const TABS = [
  { id: "contact",   label: "Contact Information", icon: IconPhone },
  { id: "basic",     label: "Basic Information",   icon: IconUser  },
  { id: "documents", label: "Documents",            icon: IconDoc   },
  { id: "family",    label: "Family",               icon: IconFamily },
];

/* ── Empty family member form state ──────────────────────────── */
const EMPTY_MEMBER = { name: "", relation: "", age: "", gender: "" };

/* ═══════════════════════════════════════════════════════════════ */
const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext);
  const [image, setImage]       = useState(null);
  const [labFile, setLabFile]   = useState(null);
  const [activeTab, setActiveTab] = useState("contact");
  const [isSaving, setIsSaving] = useState(false);
  const [newMember, setNewMember] = useState(EMPTY_MEMBER);

  /* ── field helpers ── */
  const set = (field, value) =>
    setUserData((p) => ({ ...p, [field]: value }));
  const setAddr = (key, value) =>
    setUserData((p) => ({ ...p, address: { ...p.address, [key]: value } }));

  /* ── save ── */
  const save = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      if (labFile) fd.append("labFile", labFile);
      if (image)   fd.append("image",   image);
      fd.append("name",          userData.name);
      fd.append("phone",         userData.phone);
      fd.append("address",       JSON.stringify(userData.address));
      fd.append("gender",        userData.gender);
      fd.append("dob",           userData.dob);
      fd.append("familyMembers", JSON.stringify(userData.familyMembers || []));

      const { data } = await axios.post(
        `${backendUrl}/api/user/update-profile`, fd, { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setImage(null);
        setLabFile(null);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  /* ── add family member ── */
  const addMember = () => {
    const { name, relation, age, gender } = newMember;
    if (!name || !relation || !age || !gender) {
      toast.error("Please fill all fields"); return;
    }
    const updated = [...(userData.familyMembers || []), { name, relation, age: Number(age), gender }];
    set("familyMembers", updated);
    setNewMember(EMPTY_MEMBER);
  };

  const removeMember = (idx) => {
    const updated = userData.familyMembers.filter((_, i) => i !== idx);
    set("familyMembers", updated);
  };

  if (!userData) return null;

  const avatarSrc = image ? URL.createObjectURL(image) : (userData.image || fallbackAvatar);

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen pt-6 pb-14 px-4 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(110deg,#effcfb 0%,#f7fcfc 48%,#e9f8f8 100%)" }}
    >
      <div className="max-w-5xl mx-auto">

        {/* ── Page title ── */}
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-[#10233f]">My Profile</h1>
          <p className="text-sm text-[#718398] mt-0.5">
            Manage your personal information and keep your profile up to date.
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex gap-6 items-start">

          {/* ── LEFT — Sidebar ── */}
          <ProfileSidebar />

          {/* ── RIGHT — Content ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* ── Profile header card ── */}
            <div className="bg-white rounded-2xl border border-[#dceeed] shadow-sm px-6 py-5">
              <div className="flex items-center gap-5">

                {/* Avatar + camera button */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-[#dde8f0] overflow-hidden ring-2 ring-[#dceeed]">
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = fallbackAvatar; }}
                    />
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#009f9a] rounded-full flex items-center
                               justify-center cursor-pointer shadow border-2 border-white hover:bg-[#008eaa] transition-colors"
                  >
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} hidden />
                </div>

                {/* Name + email */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-extrabold text-[#10233f] uppercase tracking-wide truncate">
                    {userData.name || "Your Name"}
                  </h2>
                  <p className="flex items-center gap-1.5 text-sm text-[#718398] mt-0.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    {userData.email}
                  </p>
                </div>

                {/* Edit Profile button */}
                <button
                  onClick={save}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                             text-[#009f9a] border border-[#b2ebe0] bg-[#f0fafa] hover:bg-[#e0f7f5]
                             transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                  )}
                  {isSaving ? "Saving…" : "Edit Profile"}
                </button>
              </div>
            </div>

            {/* ── Tab bar ── */}
            <div className="bg-white rounded-2xl border border-[#dceeed] shadow-sm overflow-hidden">

              {/* Tab headers */}
              <div className="flex border-b border-[#dceeed]">
                {TABS.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-semibold
                                  transition-colors border-b-2 -mb-px ${
                        active
                          ? "text-[#009f9a] border-[#009f9a]"
                          : "text-[#9ab5c0] border-transparent hover:text-[#5f7185]"
                      }`}
                    >
                      <span className={active ? "text-[#009f9a]" : "text-[#b0bec5]"}>{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Tab body ── */}
              <div className="p-6">

                {/* ───── CONTACT ───── */}
                {activeTab === "contact" && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f9f6] text-[#009f9a]">{IconPhone}</span>
                        <div>
                          <h3 className="text-sm font-bold text-[#10233f]">Contact Information</h3>
                          <p className="text-xs text-[#718398]">How can we reach you?</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label="Email Address"
                          value={userData.email}
                          disabled
                          icon={IconMail}
                          placeholder="your@email.com"
                        />
                        <Field
                          label="Phone Number"
                          value={userData.phone}
                          onChange={(v) => set("phone", v)}
                          icon={IconPhone}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <p className="text-xs font-bold text-[#10233f] uppercase tracking-wide mb-4">Address</p>
                      <div className="space-y-4">
                        <Field
                          label="Address Line 1"
                          value={userData.address?.line1}
                          onChange={(v) => setAddr("line1", v)}
                          icon={IconPin}
                          placeholder="Enter your address line 1"
                        />
                        <Field
                          label="Address Line 2 (Optional)"
                          value={userData.address?.line2}
                          onChange={(v) => setAddr("line2", v)}
                          icon={IconPin}
                          placeholder="Enter your address line 2"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Field
                            label="City"
                            value={userData.address?.city}
                            onChange={(v) => setAddr("city", v)}
                            icon={IconCity}
                            placeholder="Enter city"
                          />
                          <Field
                            label="State"
                            value={userData.address?.state}
                            onChange={(v) => setAddr("state", v)}
                            icon={IconCity}
                            placeholder="Enter state"
                          />
                          <Field
                            label="Pincode"
                            value={userData.address?.pincode}
                            onChange={(v) => setAddr("pincode", v)}
                            icon={IconPin}
                            placeholder="Enter pincode"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer actions */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-[#dceeed]">
                      <button
                        onClick={loadUserProfileData}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#5f7185] border border-[#dceeed] hover:bg-[#f5fdfc] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={save}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                      >
                        {isSaving ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ───── BASIC INFO ───── */}
                {activeTab === "basic" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f9f6] text-[#009f9a]">{IconUser}</span>
                      <div>
                        <h3 className="text-sm font-bold text-[#10233f]">Basic Information</h3>
                        <p className="text-xs text-[#718398]">Your personal details</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Full Name"
                        value={userData.name}
                        onChange={(v) => set("name", v)}
                        icon={IconUser}
                        placeholder="Enter your full name"
                      />
                      <Field
                        label="Date of Birth"
                        value={userData.dob}
                        onChange={(v) => set("dob", v)}
                        type="date"
                        placeholder=""
                      />
                      <SelectField
                        label="Gender"
                        value={userData.gender}
                        onChange={(v) => set("gender", v)}
                        options={["Male", "Female", "Other"]}
                        icon={IconUser}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-[#dceeed]">
                      <button
                        onClick={loadUserProfileData}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#5f7185] border border-[#dceeed] hover:bg-[#f5fdfc] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={save}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}
                      >
                        {isSaving ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ───── DOCUMENTS ───── */}
                {activeTab === "documents" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f9f6] text-[#009f9a]">{IconDoc}</span>
                      <div>
                        <h3 className="text-sm font-bold text-[#10233f]">Documents</h3>
                        <p className="text-xs text-[#718398]">Your medical documents and reports</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Lab Report */}
                      <div className="rounded-2xl border-2 border-dashed border-[#b2ebe0] bg-[#f5fdfc] p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f9f6]">
                            <svg className="w-5 h-5 text-[#009f9a]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7 2v2h1v9.27A4 4 0 0 0 9.72 22h4.56A4 4 0 0 0 16 13.27V4h1V2H7Z"/>
                            </svg>
                          </span>
                          <div>
                            <p className="text-sm font-bold text-[#10233f]">Lab Reports</p>
                            <p className="text-xs text-[#718398]">PDF or Image files</p>
                          </div>
                        </div>

                        {labFile ? (
                          <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-[#dceeed]">
                            <svg className="w-4 h-4 text-[#009f9a] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <span className="flex-1 text-xs text-[#10233f] truncate">{labFile.name}</span>
                            <button onClick={() => setLabFile(null)} className="text-[#b0bec5] hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                        ) : userData.labFile ? (
                          <a href={userData.labFile} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[#009f9a] text-sm font-medium hover:underline">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                            View Current Report
                          </a>
                        ) : (
                          <p className="text-xs text-[#b0bec5]">No report uploaded yet</p>
                        )}

                        <label htmlFor="lab-upload"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#b2ebe0] text-[#009f9a]
                                     rounded-xl cursor-pointer hover:bg-[#e8f9f6] transition-colors text-xs font-semibold w-fit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                          </svg>
                          Upload New
                        </label>
                        <input id="lab-upload" type="file" accept="application/pdf,image/*"
                          onChange={(e) => setLabFile(e.target.files[0])} hidden />
                      </div>

                      {/* Prescription */}
                      <div className="rounded-2xl border-2 border-dashed border-[#dceeed] bg-[#f5fdfc] p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f9f6]">
                            <svg className="w-5 h-5 text-[#009f9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                          </span>
                          <div>
                            <p className="text-sm font-bold text-[#10233f]">Prescription</p>
                            <p className="text-xs text-[#718398]">From your doctor</p>
                          </div>
                        </div>
                        {userData.prescription ? (
                          <a href={userData.prescription} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[#009f9a] text-sm font-medium hover:underline">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                            View Prescription
                          </a>
                        ) : (
                          <p className="text-xs text-[#b0bec5]">No prescription found</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-[#dceeed]">
                      <button onClick={loadUserProfileData}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#5f7185] border border-[#dceeed] hover:bg-[#f5fdfc] transition-colors">
                        Cancel
                      </button>
                      <button onClick={save} disabled={isSaving}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}>
                        {isSaving ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ───── FAMILY ───── */}
                {activeTab === "family" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f9f6] text-[#009f9a]">{IconFamily}</span>
                      <div>
                        <h3 className="text-sm font-bold text-[#10233f]">Family Members</h3>
                        <p className="text-xs text-[#718398]">Manage family profiles for easy appointment booking</p>
                      </div>
                    </div>

                    {/* Existing members */}
                    {(userData.familyMembers || []).length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#dceeed] bg-[#f5fdfc] py-8 text-center">
                        <p className="text-sm text-[#9ab5c0]">No family members added yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userData.familyMembers.map((m, i) => (
                          <div key={i}
                            className="flex items-center justify-between gap-4 bg-[#f5fdfc] border border-[#dceeed] rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f9f6] text-[#009f9a] font-bold text-sm flex-shrink-0">
                                {m.name?.[0]?.toUpperCase() || "?"}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-[#10233f]">{m.name}</p>
                                <p className="text-xs text-[#718398]">
                                  {m.relation} · {m.age} yrs · {m.gender}
                                </p>
                              </div>
                            </div>
                            <button onClick={() => removeMember(i)}
                              className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new member */}
                    <div className="rounded-2xl border border-[#dceeed] bg-white p-5">
                      <p className="text-sm font-bold text-[#10233f] mb-4">Add New Family Member</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <Field label="Full Name" value={newMember.name}
                          onChange={(v) => setNewMember((p) => ({ ...p, name: v }))}
                          icon={IconUser} placeholder="e.g. Rahul Chaubey" />
                        <Field label="Relation" value={newMember.relation}
                          onChange={(v) => setNewMember((p) => ({ ...p, relation: v }))}
                          placeholder="e.g. Father, Daughter" />
                        <Field label="Age" value={newMember.age} type="number"
                          onChange={(v) => setNewMember((p) => ({ ...p, age: v }))}
                          placeholder="Age in years" />
                        <SelectField label="Gender" value={newMember.gender}
                          onChange={(v) => setNewMember((p) => ({ ...p, gender: v }))}
                          options={["Male", "Female", "Other"]} icon={IconUser} />
                      </div>
                      <button onClick={addMember}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}>
                        + Add Member
                      </button>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-[#dceeed]">
                      <button onClick={loadUserProfileData}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#5f7185] border border-[#dceeed] hover:bg-[#f5fdfc] transition-colors">
                        Cancel
                      </button>
                      <button onClick={save} disabled={isSaving}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#04a99d,#008eaa)" }}>
                        {isSaving ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}

              </div>{/* /tab body */}
            </div>{/* /tab card */}

          </div>{/* /right */}
        </div>{/* /two-col */}
      </div>
    </div>
  );
};

export default MyProfile;
