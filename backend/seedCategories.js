import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grocery-app')
    .then(() => console.log('MongoDB Connected For Seeding'))
    .catch(err => console.error(err));

// Note: defining category schema locally to avoid import issues with compiled paths or models if tricky
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    bgColor: { type: String, default: "#FEE0E0" }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

const defaultCategories = [
    { name: "Organic veggies", image: "organic_vegitable_image.png", bgColor: "#FEF6DA" },
    { name: "Fresh Fruits", image: "fresh_fruits_image.png", bgColor: "#FEE0E0" },
    { name: "Cold Drinks", image: "bottles_image.png", bgColor: "#F0F5DE" },
    { name: "Instant Food", image: "maggi_image.png", bgColor: "#E1F5EC" },
    { name: "Dairy Products", image: "dairy_product_image.png", bgColor: "#FEE6CD" },
    { name: "Bakery & Breads", image: "bakery_image.png", bgColor: "#E0F6FE" },
    { name: "Grains & Cereals", image: "grain_image.png", bgColor: "#F1E3F9" },
];

const seedDB = async () => {
    try {
        const clientAssetsDir = path.join(process.cwd(), '..', 'client', 'src', 'assets');
        const uploadDir = path.join(process.cwd(), 'uploads');

        // Ensure upload dir exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        for (const cat of defaultCategories) {
            // Check if exists
            const existing = await Category.findOne({ name: cat.name });
            if (!existing) {
                // Copy image
                const srcPath = path.join(clientAssetsDir, cat.image);
                const destPath = path.join(uploadDir, cat.image);

                if (fs.existsSync(srcPath)) {
                    fs.copyFileSync(srcPath, destPath);
                    console.log(`Copied ${cat.image}`);
                } else {
                    console.warn(`Source image not found: ${srcPath}`);
                }

                // Insert into DB
                const newCat = new Category(cat);
                await newCat.save();
                console.log(`Seeded category: ${cat.name}`);
            } else {
                console.log(`Category ${cat.name} already exists. Skipping.`);
            }
        }

        console.log("Seeding complete!");
        process.exit();
    } catch (error) {
        console.error("Error seeding DB:", error);
        process.exit(1);
    }
};

seedDB();
