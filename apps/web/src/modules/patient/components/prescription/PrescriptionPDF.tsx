import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles for PDF components
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#374151',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    textAlign: 'right',
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  hospitalInfo: {
    fontSize: 9,
    color: '#dbeafe',
    marginBottom: 2,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 9,
    color: '#dbeafe',
  },
  patientBar: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    padding: 12,
    marginBottom: 20,
    borderRadius: 4,
  },
  patientInfoItem: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: '#9ca3af',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 4,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 10,
    borderRadius: 6,
    minWidth: '20%',
    textAlign: 'center',
  },
  vitalLabel: {
    fontSize: 7,
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  vitalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  gridTwoCol: {
    flexDirection: 'row',
    gap: 20,
  },
  col: {
    flex: 1,
  },
  paragraph: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#4b5563',
  },
  table: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
    padding: 8,
  },
  tableCol1: { flex: 2 },
  tableCol2: { flex: 1 },
  tableCol3: { flex: 1 },
  tableCol4: { flex: 1 },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  medName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  medDetail: {
    fontSize: 9,
    color: '#4b5563',
  },
  signatureArea: {
    marginTop: 40,
    textAlign: 'right',
  },
  signatureLine: {
    width: 150,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    marginBottom: 8,
    alignSelf: 'flex-end',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerText: {
    fontSize: 7,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

interface PrescriptionPDFProps {
  data: any;
  profile: any;
  prescriptionId: string;
}

const PrescriptionPDF = ({ data, profile, prescriptionId }: PrescriptionPDFProps) => {
  const vitals = data.consultation.vitals?.[0];
  const record = data.consultation.medicalRecord;
  const rx = data.consultation.prescription;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.brandName}>MedixFlow Clinics</Text>
            <Text style={styles.hospitalInfo}>Central Health Hospital, Block B</Text>
            <Text style={styles.hospitalInfo}>123 Medical Square, Silicon Valley, CA 94043</Text>
            <Text style={styles.hospitalInfo}>Contact: +1 (555) 001-2026</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.doctorName}>Dr. {data.doctor.firstName} {data.doctor.lastName}</Text>
            <Text style={styles.doctorSpecialty}>{data.doctor.specialization?.name}</Text>
          </View>
        </View>

        {/* Patient Bar */}
        <View style={styles.patientBar}>
          <View style={styles.patientInfoItem}>
            <Text style={styles.label}>Patient Name</Text>
            <Text style={styles.value}>{profile?.name || "—"}</Text>
          </View>
          <View style={styles.patientInfoItem}>
            <Text style={styles.label}>Age / Gender</Text>
            <Text style={styles.value}>{profile?.gender || "—"}</Text>
          </View>
          <View style={styles.patientInfoItem}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{new Date(data.appointmentDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.patientInfoItem}>
            <Text style={styles.label}>Prescription ID</Text>
            <Text style={[styles.value, { color: '#2563eb' }]}>#{prescriptionId}</Text>
          </View>
        </View>

        {/* Content */}
        <View>
          {/* Vitals */}
          {vitals && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vitals</Text>
              <View style={styles.vitalsGrid}>
                {vitals.temperature && (
                  <View style={styles.vitalCard}>
                    <Text style={styles.vitalLabel}>Temp</Text>
                    <Text style={styles.vitalValue}>{vitals.temperature} °F</Text>
                  </View>
                )}
                {vitals.bloodPressure && (
                  <View style={styles.vitalCard}>
                    <Text style={styles.vitalLabel}>BP</Text>
                    <Text style={styles.vitalValue}>{vitals.bloodPressure}</Text>
                  </View>
                )}
                {vitals.heartRate && (
                  <View style={styles.vitalCard}>
                    <Text style={styles.vitalLabel}>Heart Rate</Text>
                    <Text style={styles.vitalValue}>{vitals.heartRate} bpm</Text>
                  </View>
                )}
                {vitals.weight && (
                  <View style={styles.vitalCard}>
                    <Text style={styles.vitalLabel}>Weight</Text>
                    <Text style={styles.vitalValue}>{vitals.weight} kg</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Diagnosis */}
          {record && (
            <View style={styles.section}>
              <View style={styles.gridTwoCol}>
                <View style={styles.col}>
                  <Text style={styles.sectionTitle}>Initial Symptoms</Text>
                  <Text style={styles.paragraph}>{record.symptoms}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.sectionTitle}>Diagnosis</Text>
                  <Text style={[styles.paragraph, { fontWeight: 'bold', color: '#111827' }]}>{record.diagnosis}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Medications Table */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Treatment / Medications</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={styles.tableCol1}><Text style={styles.tableHeaderText}>Medicine Name</Text></View>
                <View style={styles.tableCol2}><Text style={styles.tableHeaderText}>Dosage</Text></View>
                <View style={styles.tableCol3}><Text style={styles.tableHeaderText}>Frequency</Text></View>
                <View style={styles.tableCol4}><Text style={styles.tableHeaderText}>Duration</Text></View>
              </View>
              {rx.medicines.map((med: any, idx: number) => (
                <View key={idx} style={styles.tableRow}>
                  <View style={styles.tableCol1}><Text style={styles.medName}>{med.name}</Text></View>
                  <View style={styles.tableCol2}><Text style={styles.medDetail}>{med.dosage}</Text></View>
                  <View style={styles.tableCol3}><Text style={styles.medDetail}>{med.frequency}</Text></View>
                  <View style={styles.tableCol4}><Text style={styles.medDetail}>{med.duration}</Text></View>
                </View>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.gridTwoCol}>
            {record?.notes && (
              <View style={styles.col}>
                <Text style={styles.sectionTitle}>Plan for Management</Text>
                <Text style={styles.paragraph}>{record.notes}</Text>
              </View>
            )}
            <View style={styles.col}>
              <Text style={styles.sectionTitle}>Instructions / Follow-up</Text>
              <Text style={styles.paragraph}>{rx.instructions || "No specific follow-up instructions."}</Text>
            </View>
          </View>

          {/* Signature */}
          <View style={styles.signatureArea}>
            <View style={styles.signatureLine} />
            <Text style={[styles.value, { fontSize: 11 }]}>Dr. {data.doctor.firstName} {data.doctor.lastName}</Text>
            <Text style={[styles.vitalLabel, { fontSize: 8 }]}>{data.doctor.specialization?.name}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is a computer-generated prescription issued via MedixFlow Clinical Platform. No physical signature required.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PrescriptionPDF;
