import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AppContext } from "../context/AppContext";

// Lab test category icons/images
const categoryImages = {
  "Blood": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&fit=crop&q=80",
  "Urine": "https://images.unsplash.com/photo-1606206873764-fd15e242df52?w=400&fit=crop&q=80",
  "Thyroid": "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&fit=crop&q=80",
  "Lipid": "https://images.unsplash.com/photo-1551601651-bc60f254d532?w=400&fit=crop&q=80",
  "Liver": "https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&fit=crop&q=80",
  "Kidney": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&fit=crop&q=80",
  "Sugar": "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=400&fit=crop&q=80",
  "Diabetes": "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=400&fit=crop&q=80",
  "Heart": "https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=400&fit=crop&q=80",
  "Cardiac": "https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=400&fit=crop&q=80",
  "default": "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&fit=crop&q=80"
};

const getTestImage = (category, testname) => {
  // Check if category matches any key
  for (const key of Object.keys(categoryImages)) {
    if (category?.toLowerCase().includes(key.toLowerCase()) ||
      testname?.toLowerCase().includes(key.toLowerCase())) {
      return categoryImages[key];
    }
  }
  return categoryImages.default;
};

const LaboratoryOverview = () => {
  const navigate = useNavigate();
  const { labTests, fetchLabTests, token } = useContext(AppContext);

  useEffect(() => {
    if (token && labTests.length === 0) {
      fetchLabTests();
    }
  }, [token]);

  const displayTests = labTests.slice(0, 6);

  return (
    <section className="py-16 sm:py-20">
      <div className="section-wrap">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <span className="eyebrow mb-4 !bg-[#e6f1ff] !text-[#2167cf]">Lab Tests</span>
          <h2 className="text-3xl font-extrabold text-[#10233f] sm:text-5xl">
            Book <span className="text-[#167fc5]">Lab Tests</span> Online
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#687b90]">
            Get accurate diagnostics with home sample collection and fast results
          </p>
        </motion.div>

        {/* Tests Grid */}
        {displayTests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#b9dedd] bg-white p-10 text-center text-[#687b90]">
            Lab tests will appear here once they are available. Explore the lab section to view current services.
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayTests.map((test, index) => (
            <motion.div
              key={test._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                navigate(`/lab`);
                window.scrollTo(0, 0);
              }}
              className="group cursor-pointer overflow-hidden rounded-[22px] border border-[#dfeded] bg-white shadow-[0_8px_28px_rgba(15,80,90,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#9adbd6] hover:shadow-xl"
            >
              {/* Test Image */}
              <div className="relative h-44 overflow-hidden bg-[#eaf5fb]">
                <img
                  src={getTestImage(test.category, test.testname)}
                  alt={test.testname}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = categoryImages.default;
                  }}
                />
                {/* Home Collection Badge */}
                <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home Collection
                </div>
                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                  {test.category}
                </div>
              </div>

              {/* Test Info */}
              <div className="p-5">
                <h3 className="mb-1 text-lg font-bold text-[#10233f] transition-colors group-hover:text-[#167fc5]">
                  {test.testname || test.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Reports in {test.resultAt || "24 hours"}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-[#176bd2]">₹{test.price}</span>
                    <span className="text-gray-400 text-sm ml-2 line-through">₹{test.price + 200}</span>
                  </div>
                  <button className="rounded-xl bg-[#eaf2ff] px-4 py-2 text-sm font-semibold text-[#176bd2] transition-all duration-300 group-hover:bg-[#176bd2] group-hover:text-white">
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={() => {
              navigate("/lab");
              window.scrollTo(0, 0);
            }}
            className="primary-button"
          >
            Explore All Lab Tests
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default LaboratoryOverview;
