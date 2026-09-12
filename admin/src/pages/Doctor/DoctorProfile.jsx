import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } =
    useContext(DoctorContext);

  useEffect(() => {
    if (dToken) getProfileData();
  }, [dToken]);

  const [isEdit, setIsEdit] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const updateProfile = async () => {
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available,
        lattitude: profileData.lattitude,
        longitude: profileData.longitude,
      };

      if (newPassword.trim() !== "") {
        updateData.password = newPassword;
      }

      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        updateData,
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        setNewPassword("");
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    profileData && (
      <div className="min-h-screen w-full min-w-0 bg-gray-50 p-3 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-6 p-6 sm:p-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative group">
                <img
                  className="h-64 w-full rounded-xl object-cover shadow-md transition-transform duration-300 group-hover:scale-105 sm:w-64"
                  src={profileData.image}
                  alt={profileData.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1">
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                {/* Doctor Info */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {profileData.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-gray-600">
                  <p className="text-sm sm:text-base">
                    {profileData.degree} - {profileData.speciality}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full">
                    {profileData.experience}
                  </span>
                </div>

                {/* About Section */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700">About</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {profileData.about}
                  </p>
                </div>

                {/* Appointment Fee */}
                <div className="mt-6">
                  <label className="text-sm font-semibold text-gray-700">
                    Appointment Fee
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-gray-800 font-medium">₹</span>
                    {isEdit ? (
                      <input
                        type="number"
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            fees: e.target.value,
                          }))
                        }
                        value={profileData.fees}
                        className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">
                        {profileData.fees}
                      </span>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="mt-6">
                  <label className="text-sm font-semibold text-gray-700">
                    Address
                  </label>
                  <div className="mt-2">
                    {isEdit ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              address: { ...prev.address, line1: e.target.value },
                            }))
                          }
                          value={profileData.address.line1}
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                        <input
                          type="text"
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              address: { ...prev.address, line2: e.target.value },
                            }))
                          }
                          value={profileData.address.line2}
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        {profileData.address.line1}
                        <br />
                        {profileData.address.line2}
                      </p>
                    )}
                  </div>
                </div>

                {/* Coordinates */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Latitude
                    </label>
                    <div className="mt-2">
                      {isEdit ? (
                        <input
                          type="number"
                          step="any"
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              latitude: e.target.value,
                            }))
                          }
                          value={profileData.lattitude}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {profileData.lattitude}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Longitude
                    </label>
                    <div className="mt-2">
                      {isEdit ? (
                        <input
                          type="number"
                          step="any"
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              longitude: e.target.value,
                            }))
                          }
                          value={profileData.longitude}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {profileData.longitude}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="mt-6 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    onChange={() =>
                      isEdit &&
                      setProfileData((prev) => ({
                        ...prev,
                        available: !prev.available,
                      }))
                    }
                    checked={profileData.available}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    disabled={!isEdit}
                  />
                  <label
                    htmlFor="available"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Available
                  </label>
                </div>

                {/* Password Input */}
                {isEdit && (
                  <div className="mt-6">
                    <label className="text-sm font-semibold text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-2 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8">
                  {isEdit ? (
                    <button
                      onClick={updateProfile}
                      className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-all duration-300"
                    >
                      Save Changes
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEdit(true)}
                      className="px-6 py-2 bg-white text-primary font-semibold border border-primary rounded-lg shadow-md hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorProfile;
