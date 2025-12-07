require('dotenv').config();
const mongoose = require('mongoose');

class MongoDBConnection {
    static isConnected = false;
    static db;

    static async getConnection() {
        if (this.isConnected) return this.db;
        return await this.connect();
    }

    static async connect() {
        const mongoUri = process.env.MONGO_URI;
        const dbName = process.env.DB_NAME;

        if (!mongoUri || !dbName) {
            throw new Error('MONGO_URI or DB_NAME is not set in environment variables');
        }

        try {
            await mongoose.connect(mongoUri, {
                dbName,
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            this.db = mongoose;
            this.isConnected = true;
            console.log('MongoDB connection opened!');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }

        const db = mongoose.connection;
        db.on('connecting', () => console.log('Connecting to MongoDB...'));
        db.on('connected', () => console.log('MongoDB connected!'));
        db.on('reconnected', () => console.log('MongoDB reconnected!'));
        db.on('disconnected', () => {
            console.log('MongoDB disconnected! Retrying in 5 seconds...');
            setTimeout(() => this.connect().catch(() => {}), 5000);
        });
        db.on('error', (err) => console.error('MongoDB connection error:', err));

        return this.db;
    }
}

module.exports = MongoDBConnection;