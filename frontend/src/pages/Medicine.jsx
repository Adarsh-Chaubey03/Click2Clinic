import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";

const Star = ({ muted = false }) => (
  <svg className={`h-4 w-4 ${muted ? "text-[#dce4e8]" : "text-[#ffc400]"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
  </svg>
);

const TruckIcon = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h11v10H3zM14 10h3l4 4v2h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 0 2 2 0 0 0 0 4Z" />
  </svg>
);

const Medicine = () => {
  const { medicineId } = useParams();
  const { medicines, token } = useContext(AppContext);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [showZoom, setShowZoom] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.warn("Login to order medicines");
      navigate("/login");
    }
  }, [token, navigate]);

  const medicine = medicines.find((item) => item._id === medicineId);

  if (!medicine) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#fbfdfd] px-4">
        <div className="text-center">
          <p className="mb-4 text-sm text-[#66788d]">Loading medicine details...</p>
          <button className="font-semibold text-[#009f9a]" onClick={() => navigate("/store")}>Back to Pharmacy</button>
        </div>
      </main>
    );
  }

  const category = medicine.category ? medicine.category.toUpperCase() : "MEDICINE";
  const totalPrice = medicine.price * quantity;

  const handleAddToCart = () => {
    if (!medicine.available) {
      toast.error("This item is out of stock");
      return;
    }
    addToCart(medicine, quantity);
    toast.success(`${quantity} × ${medicine.name} added to cart!`);
  };

  return (
    <main className="medicine-detail-page bg-white text-[#10233f]">
      {showZoom && (
        <div className="fixed inset-0 z-[60] flex cursor-zoom-out items-center justify-center bg-[#10233f]/80 p-6" onClick={() => setShowZoom(false)}>
          <img src={medicine.image} alt={medicine.name} className="max-h-[90vh] max-w-[90vw] object-contain" />
        </div>
      )}

      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-0">
        <button onClick={() => navigate("/store")} className="flex items-center gap-2 py-5 text-[12px] font-medium text-[#53667c] transition-colors hover:text-[#009f9a]">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" /></svg>
          Back to Pharmacy
        </button>

        <section className="grid grid-cols-1 gap-8 pb-5 pt-1 lg:grid-cols-[1fr_1.32fr] lg:gap-8">
          <button onClick={() => setShowZoom(true)} className="medicine-image-panel group relative flex min-h-[315px] items-center justify-center overflow-hidden rounded-2xl border border-[#e2f1f0] bg-[#f0fcfa] p-8 text-left sm:min-h-[380px] lg:min-h-[315px]">
            <img src={medicine.image} alt={medicine.name} className="max-h-[245px] w-full object-contain transition-transform duration-300 group-hover:scale-105" />
          </button>

          <div className="flex flex-col justify-center">
            <span className="mb-3 w-fit rounded-full bg-[#e9fbf7] px-3 py-1.5 text-[9px] font-bold tracking-wide text-[#009f9a]">{category}</span>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[#10233f] sm:text-[34px]">{medicine.name}</h1>

            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-0.5">{[1, 2, 3, 4].map((star) => <Star key={star} />)}<Star muted /></span>
              <span className="text-[11px] text-[#66788d]">4.2 (128 reviews)</span>
              <span className="text-[#d7e0e5]">|</span>
              <span className="text-[11px] font-semibold text-[#009f9a]">500+ sold</span>
            </div>

            <div className="mb-4">
              <p className="text-3xl font-extrabold text-[#10233f]">₹{totalPrice}</p>
              <p className="mt-1 text-[11px] font-medium text-[#009f9a]">
                Inclusive of all taxes {quantity > 1 && <span className="text-[#66788d]">(₹{medicine.price} each)</span>}
              </p>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#effcfb] px-4 py-3 text-[#009f9a]">
              <TruckIcon className="h-6 w-6 shrink-0" />
              <div className="flex-1">
                <p className="text-[12px] font-bold text-[#19334d]">Express Delivery Available</p>
                <p className="text-[11px] text-[#66788d]">Get it by tomorrow, 10 AM</p>
              </div>
              <span className="text-xl text-[#4d8793]">›</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-5 text-[12px] font-semibold text-[#53667c]">
                <span>Quantity</span>
                <div className="flex h-11 items-center overflow-hidden rounded-xl border border-[#e0e8ec] bg-[#f9fbfc]">
                  <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-full w-11 text-lg text-[#718398] hover:bg-[#effcfb]">−</button>
                  <span className="w-8 text-center text-[12px] text-[#19334d]">{quantity}</span>
                  <button onClick={() => setQuantity((value) => value + 1)} className="h-full w-11 text-lg text-[#718398] hover:bg-[#effcfb]">+</button>
                </div>
              </div>
              <button onClick={handleAddToCart} disabled={!medicine.available} className="flex h-12 flex-1 items-center justify-center gap-3 rounded-xl bg-[#08a69d] text-[14px] font-bold text-white shadow-[0_8px_18px_rgba(8,166,157,0.18)] transition-colors hover:bg-[#078f89] disabled:cursor-not-allowed disabled:bg-[#a9c3c4]">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 2.3A1 1 0 0 0 6.3 17H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></svg>
                {medicine.available ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 border-b border-[#e3ecef] pb-5 pt-1 sm:grid-cols-3">
          {[
            { icon: <TruckIcon className="h-6 w-6" />, title: "Free Delivery", sub: "Orders ₹500+" },
            { icon: <span className="text-xl">◆</span>, title: "Easy Returns", sub: "7-day policy" },
            { icon: <span className="text-xl">✿</span>, title: "Genuine Products", sub: "100% authentic" },
          ].map((item, index) => (
            <div key={item.title} className={`flex items-center gap-3 py-3 text-[#009f9a] sm:justify-center ${index > 0 ? "sm:border-l sm:border-[#e3ecef]" : ""}`}>
              {item.icon}
              <div><p className="text-[11px] font-bold text-[#19334d]">{item.title}</p><p className="text-[11px] text-[#66788d]">{item.sub}</p></div>
            </div>
          ))}
        </div>

        <section className="mt-3">
          <div className="flex gap-8 border-b border-[#e3ecef]">
            <button className="border-b-2 border-[#08a69d] px-3 py-4 text-[12px] font-bold text-[#009f9a]">Product Details</button>
            <button className="px-3 py-4 text-[12px] font-semibold text-[#66788d]">Reviews (128)</button>
          </div>
          <div className="my-4 rounded-xl bg-[#f5fafa] px-5 py-4 sm:px-6">
            <h2 className="mb-2 text-[13px] font-bold text-[#19334d]">About this product</h2>
            <p className="text-[11px] leading-relaxed text-[#66788d]">{medicine.name} provides trusted care for your everyday health needs. It is sourced from genuine manufacturers and is suitable for regular use as directed.</p>
            <ul className="mt-1 space-y-1 text-[11px] text-[#66788d]">
              <li className="before:mr-2 before:text-base before:text-[#08a69d] before:content-['•']">Trusted by millions</li>
              <li className="before:mr-2 before:text-base before:text-[#08a69d] before:content-['•']">Suitable for daily use</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Medicine;
