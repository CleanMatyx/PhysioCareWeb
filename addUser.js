const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/physiocare', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol:{type: String, required: true,  enum: ["admin", "physio", "patient"] },
    userId: { type: String, required: true }
});

const User = mongoose.model('users', userSchema);

const login = 'admin';
const password = 'password123';
const rol="admin";
const userId = 'null'; // ID del usuario

async function createUser() {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ login, password: hashedPassword, rol, userId });
        await user.save();
       
        console.log(user);
    } catch (error) {
        console.error("❌ Error al crear usuario:", error);
    } finally {
        mongoose.connection.close();
    }
}

createUser();
