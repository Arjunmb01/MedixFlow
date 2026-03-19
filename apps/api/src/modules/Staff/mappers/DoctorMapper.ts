export class DoctorMapper {
  static toProfile(doctor: any) {
    if (!doctor) return null;
    
    return {
      ...doctor,
      specialty: doctor.specialization?.name || doctor.specialty
    };
  }

  static toCollection(doctors: any[], total: number) {
    return {
      doctors: doctors.map(d => this.toProfile(d)),
      total
    };
  }
}
