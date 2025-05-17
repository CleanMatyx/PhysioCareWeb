const mongoose = require('mongoose');
const Patient = require('./models/patient');
const Physio = require('./models/physio');
const Record = require('./models/record');

// Function to load initial data
async function loadData() {
    try {
      // Clean existing collections
      await Patient.deleteMany({});
      await Physio.deleteMany({});
      await Record.deleteMany({});
      
     // Create some patients  
      const patients = [
          new Patient({
              name: 'José',
              surname: 'López',
              birthDate: new Date('1985-06-15'),
              address: 'Calle Mayor 123, Alicante',
              insuranceNumber: '123456789',
              email: 'jose.lopez@example.com'
          }),
          new Patient({
              name: 'Ana',
              surname: 'Pérez',
              birthDate: new Date('1990-09-22'),
              address: 'Avenida del Sol 45, Valencia',
              insuranceNumber: '987654321',
              email: 'ana.perez@example.com'
          }),
          new Patient({
              name: 'Luis',
              surname: 'Martínez',
              birthDate: new Date('1975-03-11'),
              address: 'Calle de la Luna 89, Alicante',
              insuranceNumber: '456789123',
              email: 'luis.martinez@example.com'
          }),
          new Patient({
              name: 'María',
              surname: 'Sanz',
              birthDate: new Date('1992-05-30'),
              address: 'Plaza Mayor 22, Valencia',
              insuranceNumber: '321654987',
              email: 'maria.sanz@example.com'
          })
      ];
  
      // Save all patients using Promise.all
      const savedPatients = await Promise.all(patients.map(patient => patient.save()));
      console.log('Added patients:', savedPatients);
      
      // Create several physios, at least one for each specialty
      const physios = [
          new Physio({
              name: 'Javier',
              surname: 'Martínez',
              specialty: 'Sports',
              licenseNumber: 'A1234567',
              email: 'javier.martinez@example.com'
          }),
          new Physio({
              name: 'Ainhoa',
              surname: 'Fernández',
              specialty: 'Neurological',
              licenseNumber: 'B7654321',
              email: 'ainhoa.fernandez@example.com'
          }),
          new Physio({
              name: 'Mario',
              surname: 'Sánchez',
              specialty: 'Pediatric',
              licenseNumber: 'C9876543',
              email: 'mario.sanchez@example.com'
          }),
          new Physio({
              name: 'Andrea',
              surname: 'Ortega',
              specialty: 'Pediatric',
              licenseNumber: 'D8796342',
              email: 'andrea.ortega@example.com'
          }),
          new Physio({
              name: 'Ana',
              surname: 'Rodríguez',
              specialty: 'Geriatric',
              licenseNumber: 'E6543210',
              email: 'ana.rodriguez@example.com'
          }),
          new Physio({
              name: 'Marcos',
              surname: 'Gómez',
              specialty: 'Oncological',
              licenseNumber: 'F4321098',
              email: 'marcos.gomez@example.com'
          })
      ];
  
      // Save all physios using Promise.all
      const savedPhysios = await Promise.all(physios.map(physio => physio.save()));
      console.log('Added physios:', savedPhysios);
  
      // Create records with appointments
      const records = [
          new Record({
              patient: savedPatients[0]._id,
              medicalRecord: 'Paciente con antecedentes de lesiones en rodilla y cadera. Historial de múltiples intervenciones quirúrgicas en la rodilla izquierda y sesiones de fisioterapia prolongadas. Actualmente presenta molestias ocasionales al caminar largas distancias.',
              appointments: [
                  {
                      id: new mongoose.Types.ObjectId(),
                      appointmentId: new mongoose.Types.ObjectId(),
                      date: new Date('2023-12-10T10:00:00Z'),
                      physio: savedPhysios[0]._id,
                      diagnosis: 'Distensión de ligamentos de la rodilla',
                      treatment: 'Rehabilitación con ejercicios de fortalecimiento',
                      observations: 'Se recomienda evitar actividad intensa por 6 semanas',
                      price: 150
                  },
                  {
                      id: new mongoose.Types.ObjectId(),
                      appointmentId: new mongoose.Types.ObjectId(),
                      date: new Date('2024-01-15T14:00:00Z'),
                      physio: savedPhysios[0]._id,
                      diagnosis: 'Mejoría notable, sin dolor agudo',
                      treatment: 'Continuar con ejercicios, añadir movilidad funcional',
                      observations: 'Próxima revisión en un mes',
                      price: 120
                  },
                  {
                      id: new mongoose.Types.ObjectId(),
                      appointmentId: new mongoose.Types.ObjectId(),
                      date: new Date('2025-06-01T09:00:00Z'),
                      physio: savedPhysios[0]._id,
                      diagnosis: 'Pendiente de evaluación',
                      treatment: 'Pendiente de evaluación',
                      observations: 'Pendiente de evaluación',
                      price: 100
                  },
                  {
                      id: new mongoose.Types.ObjectId(),
                      appointmentId: new mongoose.Types.ObjectId(),
                      date: new Date('2025-07-15T11:30:00Z'),
                      physio: savedPhysios[0]._id,
                      diagnosis: 'Pendiente de evaluación',
                      treatment: 'Pendiente de evaluación',
                      observations: 'Pendiente de evaluación',
                      price: 80
                  }
              ]
          }),
          new Record({
              patient: savedPatients[1]._id,
              medicalRecord: 'Paciente con problemas neuromusculares desde la infancia. Ha recibido múltiples tratamientos para mejorar la movilidad y reducir la rigidez muscular. Actualmente en seguimiento para evaluar progresos.',
              appointments: [
                  {
                    id: new mongoose.Types.ObjectId(),
                    appointmentId: new mongoose.Types.ObjectId(),
                    date: new Date('2023-11-20T09:30:00Z'),
                    physio: savedPhysios[1]._id,
                    diagnosis: 'Debilidad muscular en miembros inferiores',
                    treatment: 'Terapia neuromuscular y estiramientos',
                    observations: 'Revisar la evolución en 3 semanas',
                    price: 90
                  },
                  {
                    id: new mongoose.Types.ObjectId(),
                    appointmentId: new mongoose.Types.ObjectId(),
                    date: new Date('2024-02-15T10:00:00Z'),
                    physio: savedPhysios[1]._id,
                    diagnosis: 'Mejoría en la fuerza muscular, pero persiste rigidez',
                    treatment: 'Añadir ejercicios de resistencia y movilidad',
                    observations: 'Próxima revisión en 6 semanas',
                    price: 110
                  },
                  {
                    id: new mongoose.Types.ObjectId(),
                    appointmentId: new mongoose.Types.ObjectId(),
                    date: new Date('2025-05-20T15:00:00Z'),
                    physio: savedPhysios[1]._id,
                    diagnosis: 'Pendiente de evaluación',
                    treatment: 'Pendiente de evaluación',
                    observations: 'Pendiente de evaluación',
                    price: 130
                  },
                  {
                    id: new mongoose.Types.ObjectId(),
                    appointmentId: new mongoose.Types.ObjectId(),
                    date: new Date('2025-06-25T10:30:00Z'),
                    physio: savedPhysios[1]._id,
                    diagnosis: 'Pendiente de evaluación',
                    treatment: 'Pendiente de evaluación',
                    observations: 'Pendiente de evaluación',
                    price: 140
                  }
              ]
          }),
          new Record({
              patient: savedPatients[2]._id,
              medicalRecord: 'Lesión de hombro recurrente con movilidad limitada. Historial de tendinitis crónica en el manguito rotador. Tratamientos previos han mostrado mejorías temporales.',
              appointments: [
                  {
                      id: new mongoose.Types.ObjectId(),
                      appointmentId: new mongoose.Types.ObjectId(),
                      date: new Date('2023-10-05T08:00:00Z'),
                      physio: savedPhysios[2]._id,
                      diagnosis: 'Tendinitis en el manguito rotador',
                      treatment: 'Ejercicios de movilidad y fortalecimiento',
                      observations: 'Revisar en 4 semanas',
                      price: 70
                  },
                  {
                      id: new mongoose.Types.ObjectId(),
                      appointmentId: new mongoose.Types.ObjectId(),
                      date: new Date('2024-01-25T09:00:00Z'),
                      physio: savedPhysios[2]._id,
                      diagnosis: 'Mejoría en la movilidad, pero persiste dolor leve',
                      treatment: 'Continuar con ejercicios y añadir terapia manual',
                      observations: 'Próxima revisión en 2 meses',
                      price: 60
                  },
                  {
                      id: new mongoose.Types.ObjectId(),
                      appointmentId: new mongoose.Types.ObjectId(),
                      date: new Date('2025-06-10T14:00:00Z'),
                      physio: savedPhysios[2]._id,
                      diagnosis: 'Pendiente de evaluación',
                      treatment: 'Pendiente de evaluación',
                      observations: 'Pendiente de evaluación',
                      price: 50
                  },
                  {
                      id: new mongoose.Types.ObjectId(),
                      appointmentId: new mongoose.Types.ObjectId(),
                      date: new Date('2025-07-20T16:00:00Z'),
                      physio: savedPhysios[2]._id,
                      diagnosis: 'Pendiente de evaluación',
                      treatment: 'Pendiente de evaluación',
                      observations: 'Pendiente de evaluación',
                      price: 40
                  }
              ]
          })
      ];
  
      // Save all files using Promise.all
      const savedRecords = await Promise.all(records.map(record => record.save()));
      console.log('Added records:', savedRecords);
  
      mongoose.disconnect();
      console.log('Data successfully loaded and disconnected from MongoDB');
      } catch (error) {
          console.error('Error loading data:', error);
          mongoose.disconnect();
      }
}

// Connect to MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/physiocare')
  .then(() => {
    console.log('Successful connection to MongoDB');
    loadData();
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


