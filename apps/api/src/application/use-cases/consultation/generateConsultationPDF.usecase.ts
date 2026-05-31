import { IConsultationRepository } from "../../../domain/repositories/IConsultationRepository";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

export class GenerateConsultationPDFUseCase {
    constructor(private readonly consultationRepository: IConsultationRepository) {}

    async execute(consultationId: string, userId: string, role: string): Promise<{ pdfUrl: string }> {
        const consultation = await this.consultationRepository.findById(consultationId);
        if (!consultation) throw new Error("Consultation not found");

        // Authorization Check
        const isAuthorizedDoctor = role === 'DOCTOR' && consultation.doctorId === userId;
        const isAuthorizedPatient = role === 'PATIENT' && consultation.patientId === userId;
        const isAuthorizedAdmin = role === 'ADMIN';

        if (!isAuthorizedDoctor && !isAuthorizedPatient && !isAuthorizedAdmin) {
            throw new Error("Unauthorized: You do not have permission to access this clinical record.");
        }

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];
        const stream = new PassThrough();

        doc.on('data', buffers.push.bind(buffers));
        
        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                const base64 = pdfBuffer.toString('base64');
                resolve({ pdfUrl: `data:application/pdf;base64,${base64}` });
            });

            try {
                // Background & Header Section
                doc.rect(0, 0, 612, 120).fill("#0066cc");
                doc.fontSize(22).fillColor("#ffffff").text("MEDIXFLOW CLINICAL REPORT", 50, 40, { align: "left", characterSpacing: 1 });
                doc.fontSize(10).fillColor("#dbeafe").text("Central Health Hospital, Block B | 123 Medical Square, CA", 50, 70);
                doc.text("Contact: +1 (555) 001-2026 | info@medixflow.com", 50, 85);

                doc.fontSize(10).fillColor("#ffffff").text(`Consultation ID: ${consultation.id.slice(0, 8).toUpperCase()}`, 350, 45, { align: "right" });
                doc.text(`Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, 350, 60, { align: "right" });
                
                doc.moveDown(4);
                let currentY = 140;

                // Patient & Doctor Info Bar
                doc.rect(50, currentY, 512, 60).fill("#f8fafc").stroke("#e2e8f0");
                doc.fillColor("#64748b").fontSize(8).text("PATIENT NAME", 70, currentY + 12);
                doc.fillColor("#1e293b").fontSize(11).text(`${consultation.patient.firstName} ${consultation.patient.lastName}`, 70, currentY + 25, { bold: true } as any);
                
                doc.fillColor("#64748b").fontSize(8).text("GENDER / BLOOD GROUP", 200, currentY + 12);
                doc.fillColor("#1e293b").fontSize(11).text(`${consultation.patient.gender || "N/A"} | ${consultation.patient.bloodGroup || "N/A"}`, 200, currentY + 25);

                doc.fillColor("#64748b").fontSize(8).text("CONSULTING DOCTOR", 350, currentY + 12);
                doc.fillColor("#0066cc").fontSize(11).text(`Dr. ${consultation.doctor.firstName} ${consultation.doctor.lastName}`, 350, currentY + 25, { bold: true } as any);
                doc.fillColor("#64748b").fontSize(9).text(consultation.doctor.specialization?.name || "General Physician", 350, currentY + 40);

                currentY += 80;

                // Vitals Cards
                if (consultation.vitals && consultation.vitals.length > 0) {
                    const vitals = consultation.vitals[0];
                    doc.fontSize(10).fillColor("#0f172a").text("VITALS & MEASUREMENTS", 50, currentY, { characterSpacing: 1 });
                    doc.moveTo(50, currentY + 12).lineTo(562, currentY + 12).strokeColor("#e2e8f0").stroke();
                    currentY += 25;

                    const cardWidth = 120;
                    const cardGap = 10;
                    
                    const drawVital = (label: string, value: string, x: number) => {
                        doc.rect(x, currentY, cardWidth, 45).fill("#f8fafc").stroke("#f1f5f9");
                        doc.fillColor("#94a3b8").fontSize(7).text(label, x + 10, currentY + 10, { align: "center", width: cardWidth - 20 });
                        doc.fillColor("#1e293b").fontSize(12).text(value, x + 10, currentY + 22, { align: "center", width: cardWidth - 20, bold: true } as any);
                    };

                    drawVital("BLOOD PRESSURE", vitals.bloodPressure || "N/A", 50);
                    drawVital("HEART RATE", vitals.heartRate ? `${vitals.heartRate} bpm` : "N/A", 50 + cardWidth + cardGap);
                    drawVital("TEMPERATURE", vitals.temperature ? `${vitals.temperature} F` : "N/A", 50 + (cardWidth + cardGap) * 2);
                    drawVital("WEIGHT", vitals.weight ? `${vitals.weight} kg` : "N/A", 50 + (cardWidth + cardGap) * 3);
                    
                    currentY += 65;
                }

                // Clinical Assessment
                if (consultation.medicalRecord) {
                    doc.fontSize(10).fillColor("#0f172a").text("CLINICAL ASSESSMENT", 50, currentY, { characterSpacing: 1 });
                    doc.moveTo(50, currentY + 12).lineTo(562, currentY + 12).strokeColor("#e2e8f0").stroke();
                    currentY += 25;

                    doc.fillColor("#64748b").fontSize(8).text("PRESENTING SYMPTOMS", 50, currentY);
                    doc.fillColor("#334155").fontSize(10).text(consultation.medicalRecord.symptoms, 50, currentY + 12, { width: 240 });

                    doc.fillColor("#64748b").fontSize(8).text("PRIMARY DIAGNOSIS", 310, currentY);
                    doc.fillColor("#0f172a").fontSize(11).text(consultation.medicalRecord.diagnosis, 310, currentY + 12, { width: 240, bold: true } as any);

                    currentY += Math.max(doc.heightOfString(consultation.medicalRecord.symptoms, { width: 240 }), 40) + 30;

                    if (consultation.medicalRecord.planForManagement) {
                        doc.fillColor("#64748b").fontSize(8).text("MANAGEMENT PLAN & ADVICE", 50, currentY);
                        doc.fillColor("#334155").fontSize(10).text(consultation.medicalRecord.planForManagement, 50, currentY + 12, { width: 512 });
                        currentY += doc.heightOfString(consultation.medicalRecord.planForManagement, { width: 512 }) + 30;
                    }
                }

                // Prescription
                if (consultation.prescription && consultation.prescription.medicines.length > 0) {
                    doc.fontSize(10).fillColor("#0f172a").text("TREATMENT / MEDICATIONS (Rx)", 50, currentY, { characterSpacing: 1 });
                    doc.moveTo(50, currentY + 12).lineTo(562, currentY + 12).strokeColor("#e2e8f0").stroke();
                    currentY += 25;

                    // Table Header
                    doc.rect(50, currentY, 512, 20).fill("#f1f5f9");
                    doc.fillColor("#64748b").fontSize(7).text("MEDICINE NAME", 60, currentY + 7);
                    doc.text("DOSAGE / FREQUENCY", 180, currentY + 7);
                    doc.text("FOOD TIMING", 310, currentY + 7);
                    doc.text("DURATION", 400, currentY + 7);
                    doc.text("INSTRUCTIONS", 470, currentY + 7);
                    currentY += 25;

                    consultation.prescription.medicines.forEach((med: any) => {
                        if (currentY > 700) { doc.addPage(); currentY = 50; }
                        doc.fillColor("#0066cc").fontSize(9).text(med.name, 60, currentY, { bold: true } as any);
                        doc.fillColor("#1e293b").fontSize(8).text(`${med.dosage} (${med.frequency})`, 180, currentY);
                        doc.fillColor("#1e293b").fontSize(8).text(med.foodTiming?.replace('_', ' ') || "AFTER FOOD", 310, currentY);
                        doc.text(med.duration, 400, currentY);
                        doc.fillColor("#64748b").fontSize(8).text(med.instructions || "—", 470, currentY, { italic: true, width: 90 } as any);
                        currentY += 25;
                    });

                    if (consultation.prescription.instructions) {
                        currentY += 10;
                        doc.fillColor("#64748b").fontSize(8).text("GENERAL INSTRUCTIONS", 50, currentY);
                        doc.fillColor("#334155").fontSize(9).text(consultation.prescription.instructions, 50, currentY + 12, { width: 512 });
                    }
                }

                // Signature & Footer
                const footerY = 740;
                doc.moveTo(400, footerY).lineTo(550, footerY).strokeColor("#cbd5e1").stroke();
                doc.fillColor("#1e293b").fontSize(10).text(`Dr. ${consultation.doctor.firstName} ${consultation.doctor.lastName}`, 400, footerY + 5, { align: "center", width: 150 });
                doc.fillColor("#64748b").fontSize(8).text(consultation.doctor.specialization?.name || "Family Medicine", 400, footerY + 18, { align: "center", width: 150 });

                doc.fontSize(7).fillColor("#94a3b8").text("This is a computer-generated clinical record issued via MedixFlow Platform. No physical signature required.", 50, 780, { align: "center", width: 512 });

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }
}
