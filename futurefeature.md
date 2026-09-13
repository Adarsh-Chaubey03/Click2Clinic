# Future Features to Implement

## 1. AI-Driven E-Pharmacy
**What it is**: Buying medicines with an intelligent "auto-add-to-cart" for recommended drugs based on prescriptions/needs.

## 2. Smart Wallet & Automated Refunds
**What it is**: Seamless payments and refund handling via Razorpay integration.

## 3. IoT & Wearable Integration (Real-Time Vitals)
**What it is**: Integrate with Apple Health, Google Fit, or Fitbit APIs.
**Why it's unique**: Doctors can see a patient's real-time or historical vitals (Heart Rate, SpO2, Sleep data, Step count) on their dashboard right as the video consultation starts, allowing for highly data-driven diagnoses.

## 4. Paid AI Skin Disease Dermatologist Review
**What it is**: An extension to the AI Skin Disease detection feature. Since AI isn't 100% accurate, users can opt to send their uploaded photo along with the AI prediction to a registered Dermatologist for manual evaluation.
**Flow & Logic**:
- **Pricing**: Fixed fee of ₹30 for the review.
- **Doctor Selection**: The user can either manually pick a Dermatologist from a list, or the system can auto-assign the case to the Dermatologist with the least amount of pending reviews.
- **Doctor Workflow**: The doctor reviews the image and the AI prediction on their dashboard. They then provide their medical evaluation. If the case is complex or unclear, the doctor can flag it to recommend a physical checkup or book a lab appointment.
- **User Workflow**: The evaluation is processed asynchronously. The user will receive their result in their portal once the doctor has completed the review.


2. Respiratory Medicine
3. Cardiology
4. Endocrinology
5. Gastroenterology
6. Hepatology
7. Nephrology & Urology
8. Neurology
9. Psychiatry
10. Rheumatology
11. Orthopedics
12. Dermatology
13. Hematology
14. Oncology
15. Ophthalmology
16. ENT
17. Obstetrics & Gynecology
18. Pediatrics
19. Allergy & Immunology
20. Emergency Medicine

| No. | Specialty                          | Approx. Diseases |
| --- | ---------------------------------- | ---------------- |
| 2   | Respiratory Medicine (Pulmonology) | 25               |
| 3   | Cardiology                         | 25               |
| 4   | Endocrinology                      | 20               |
| 5   | Gastroenterology                   | 30               |
| 6   | Hepatology                         | 15               |
| 7   | Nephrology                         | 20               |
| 8   | Urology                            | 15               |
| 9   | Neurology                          | 25               |
| 10  | Psychiatry                         | 25               |
| 11  | Rheumatology                       | 20               |
| 12  | Orthopedics                        | 25               |
| 13  | Dermatology                        | 25               |
| 14  | Hematology                         | 15               |
| 15  | Oncology                           | 50               |
| 16  | Ophthalmology                      | 20               |
| 17  | ENT (Otolaryngology)               | 20               |
| 18  | Gynecology                         | 20               |
| 19  | Obstetrics                         | 15               |
| 20  | Pediatrics                         | 25               |
| 21  | Geriatrics                         | 15               |
| 22  | Allergy and Immunology             | 15               |
| 23  | Emergency Medicine / Critical Care | 20               |
| 24  | Dentistry and Oral Medicine        | 15               |


my real aim is to collect as much as symptoms from the user after that i store that symptooms then i give these symptoms to ai like hugging face to determine the possible disease and also my system determine the possible disease priority 1 is hugging face then my system if both match then hightly possible