/**
 * fix-slot-booked.js
 *
 * 1. Removes ghost slots — entries in slot_booked with no matching
 *    active (non-cancelled) appointment.
 * 2. Removes slots for dates in the past.
 *
 * Run once:  node scripts/fix-slot-booked.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import doctorModel from '../models/doctor.models.js';
import appointmentModel from '../models/appointment.models.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB\n');

// Load all active (non-cancelled) appointments
const appointments = await appointmentModel.find({ cancelled: { $ne: true } })
  .select('docId slotData slotTime')
  .lean();

// Build a Set of "docId|slotData|slotTime" for fast lookup
const bookedSet = new Set(
  appointments.map(a => `${a.docId}|${a.slotData}|${a.slotTime}`)
);
console.log(`📋 Active appointments loaded: ${bookedSet.size}`);

// Today's date value for pruning past dates
const now = new Date();
const todayValue = Number(
  `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
);

function slotDateValue(key) {
  const m = /^(\d{1,2})_(\d{1,2})_(\d{4})$/.exec(key);
  if (!m) return 0;
  return Number(`${m[3]}${m[2].padStart(2,'0')}${m[1].padStart(2,'0')}`);
}

const doctors = await doctorModel.find({}).lean();
let totalRemoved = 0;

for (const doctor of doctors) {
  const slotBooked = doctor.slot_booked || {};
  const cleaned = {};
  let changed = false;

  for (const [dateKey, times] of Object.entries(slotBooked)) {
    // Drop past dates entirely
    if (slotDateValue(dateKey) < todayValue) {
      changed = true;
      continue;
    }

    if (!Array.isArray(times)) { changed = true; continue; }

    // Keep only slots that have a real active appointment
    const kept = times.filter(t => {
      const has = bookedSet.has(`${doctor._id}|${dateKey}|${t}`);
      if (!has) { totalRemoved++; changed = true; }
      return has;
    });

    if (kept.length > 0) cleaned[dateKey] = kept;
    else changed = true;
  }

  if (changed) {
    await doctorModel.findByIdAndUpdate(doctor._id, { slot_booked: cleaned });
    console.log(`  🧹 Cleaned ${doctor.name}`);
  }
}

console.log(`\n✅ Done. Ghost/past slots removed: ${totalRemoved}`);
await mongoose.disconnect();
