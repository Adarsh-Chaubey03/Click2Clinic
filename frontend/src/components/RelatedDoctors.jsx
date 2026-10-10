import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const RelatedDoctors = ({ docId, speciality }) => {
  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();
  const [relDoc, setRelDoc] = useState([]);

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      setRelDoc(doctors.filter((d) => d.speciality === speciality && d._id !== docId));
    }
  }, [doctors, speciality, docId]);

  if (relDoc.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#dceeed] shadow-sm p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-xl font-extrabold text-[#10233f]">
            Other {speciality?.toLowerCase()}s
          </h2>
          <p className="text-sm text-[#718398] mt-0.5">
            Explore more trusted doctors in this specialty.
          </p>
        </div>
        <button
          onClick={() => { navigate(`/doctors/${speciality}`); window.scrollTo(0, 0); }}
          className="text-sm font-semibold text-[#009f9a] hover:underline flex items-center gap-1 whitespace-nowrap"
        >
          View all
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      {/* Cards — horizontal row, max 3 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relDoc.slice(0, 3).map((item) => (
          <div
            key={item._id}
            onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0); }}
            className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-[#dceeed] bg-white p-4 transition-all duration-300 hover:border-[#009f9a] hover:shadow-md"
          >
            {/* Photo */}
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#e8f9f6]">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.src = "https://via.placeholder.com/80?text=Dr"; }}
              />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-[#10233f] leading-tight group-hover:text-[#009f9a] transition-colors">
                {item.name}
              </p>
              <p className="text-xs text-[#718398] mt-0.5">{item.degree}, {item.speciality}</p>

              {/* Availability */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${item.available ? "bg-[#009f9a]" : "bg-gray-400"}`} />
                <span className={`text-xs font-semibold ${item.available ? "text-[#009f9a]" : "text-gray-400"}`}>
                  {item.available ? "Available Today" : "Not Available"}
                </span>
              </div>

              {/* Rating + View profile */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400 text-xs" />
                  <span className="text-xs font-semibold text-[#10233f]">
                    {item.rating || "4.8"}
                  </span>
                  <span className="text-xs text-[#718398]">
                    ({item.reviews || Math.floor(Math.random() * 200 + 50)} reviews)
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#009f9a] hover:underline">
                  View profile →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedDoctors;
