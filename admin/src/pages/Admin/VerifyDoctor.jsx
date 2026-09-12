import { useEffect, useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import { toast } from "react-toastify";

const VerifyDoctor = () => {
  const [hireDoctors, setHireDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const { backendUrl, aToken } = useContext(AdminContext);

  // Fetch unapproved doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          backendUrl + "/api/admin/get-hireDoctor",
          { headers: { aToken } }
        );
        if (data.success) {
          setHireDoctors(data.hireDoctorData);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, [aToken]);

  // Function to open modal
  const openModal = (doctor) => {
    setSelectedDoctor(doctor);
  };

  // Function to close modal
  const closeModal = () => {
    setSelectedDoctor(null);
  };

  // Approve doctor (adds to the approved list in MongoDB)
  const handleApprove = async () => {
    if (!selectedDoctor) return;

    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/hireDoctor-add",
        { _id: selectedDoctor._id },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success("Doctor approved successfully!");
        setHireDoctors((prev) =>
          prev.filter((doc) => doc._id !== selectedDoctor._id)
        );
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error approving doctor:", error);
      toast.error("Error approving doctor!");
    }
  };

  // Reject doctor (sends rejection email)
  const handleReject = async () => {
    if (!selectedDoctor) return;

    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/reject-doctor",
        { _id:selectedDoctor._id },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success("Doctor rejection email sent!");
        setHireDoctors((prev) =>
          prev.filter((doc) => doc._id !== selectedDoctor._id)
        );
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error rejecting doctor:", error);
      toast.error("Error rejecting doctor!");
    }
  };

  return (
    <div className="w-full min-w-0 p-3 sm:p-6">
      <h2 className="text-2xl font-semibold mb-4">Verify Doctors</h2>

      {hireDoctors.length === 0 ? (
        <p className="text-gray-500">No pending doctors.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hireDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white p-4 shadow-lg rounded-xl cursor-pointer hover:shadow-xl transition"
              onClick={() => openModal(doctor)}
            >
              <img
                src={doctor.photo}
                alt={doctor.name}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              <h3 className="text-lg font-semibold">{doctor.name}</h3>
              <p className="text-gray-600">{doctor.specialization}</p>
              <p className="text-sm text-gray-500">
                Experience: {doctor.experience} years
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Popup */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-4 shadow-lg sm:p-6">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-gray-300 text-black px-3 py-1 rounded-full"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-2 text-center">
              {selectedDoctor.name}
            </h2>

            <div className="w-full flex justify-center mb-4">
              <img
                src={selectedDoctor.photo}
                alt={selectedDoctor.name}
                className="w-48 h-48 object-cover rounded-md shadow-md"
              />
            </div>

            <p>
              <strong>Specialization:</strong> {selectedDoctor.specialization}
            </p>
            <p>
              <strong>Experience:</strong> {selectedDoctor.experience} years
            </p>
            <p>
              <strong>Degree:</strong> {selectedDoctor.degree}
            </p>
            <p>
              <strong>Email:</strong> {selectedDoctor.email}
            </p>
            <p>
              <strong>License Number:</strong> {selectedDoctor.licenseNumber}
            </p>
            <p>
              <strong>Phone:</strong> {selectedDoctor.phone}
            </p>
            <p>
              <strong>Address:</strong> {selectedDoctor.address}
            </p>
            <p>
              <strong>About:</strong> {selectedDoctor.about}
            </p>

            {/* Buttons */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                onClick={handleApprove}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyDoctor;
