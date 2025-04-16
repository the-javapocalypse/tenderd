import mongoose from 'mongoose';

class DB {
  private readonly connectionString: string;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  connectDatabase = async () => {
    try {
      await mongoose.connect(this.connectionString);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  };
}

export default DB;