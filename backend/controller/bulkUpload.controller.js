import xlsx from "xlsx";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

export const bulkUploadProducts = async (req, res) => {
  try {
    const { storageType } = req.body; // 'local' or 'cloudinary'
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    if (!['local', 'cloudinary'].includes(storageType)) {
      return res.status(400).json({ success: false, message: "Invalid storage type" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const allowedUnits = ["per kg", "per unit", "per dozen", "per packet", "per liter", "per 250g", "per 500g"];
    
    // Fetch all existing categories once for efficient lookup
    const categories = await Category.find({}).select("name");
    const categoryNames = new Set(categories.map(c => c.name));

    const successData = [];
    const incompleteData = [];

    for (const row of data) {
      const {
        product_name,
        product_description,
        Category: rowCategory,
        price,
        offer_price,
        unit,
        stock_quantity,
        product_image
      } = row;

      let errors = [];

      // Required fields check
      if (!product_name) errors.push("Product Name is empty");
      if (!product_description) errors.push("Product Description is empty");
      if (!rowCategory) errors.push("Category is empty");
      if (price === undefined) errors.push("Price is empty");
      if (offer_price === undefined) errors.push("Offer Price is empty");
      if (!unit) errors.push("Unit is empty");
      if (stock_quantity === undefined) errors.push("Stock Quantity is empty");

      // Name uniqueness check
      if (product_name) {
        const existingProduct = await Product.findOne({ name: product_name });
        if (existingProduct) {
          errors.push(`Product '${product_name}' already exists`);
        }
      }

      // Category exist check
      if (rowCategory && !categoryNames.has(rowCategory)) {
        errors.push(`Category '${rowCategory}' does not exist`);
      }

      // Unit validation
      if (unit && !allowedUnits.includes(unit.toLowerCase())) {
        errors.push(`Invalid unit: '${unit}'`);
      }

      if (errors.length > 0) {
        incompleteData.push({ ...row, Errors: errors.join(", ") });
        continue;
      }

      // Image handling
      let finalImages = [];
      if (product_image) {
        const imagesList = product_image.split(",").map(img => img.trim());
        
        for (const imgPath of imagesList) {
          if (storageType === 'cloudinary') {
            try {
              // Extract relative path if needed, e.g., if it starts with /upload/
              let cleanPath = imgPath;
              if (imgPath.startsWith('/upload/')) {
                  cleanPath = imgPath.replace('/upload/', '');
              }
              
              const absolutePath = path.join(process.cwd(), 'uploads', cleanPath);
              
              if (fs.existsSync(absolutePath)) {
                const result = await cloudinary.uploader.upload(absolutePath, {
                  folder: "products"
                });
                finalImages.push(result.secure_url);
              } else if (imgPath.startsWith('http')) {
                // It's already a URL, upload it to cloudinary
                const result = await cloudinary.uploader.upload(imgPath, {
                    folder: "products"
                });
                finalImages.push(result.secure_url);
              } else {
                // If it's a URL or something we can't find locally, maybe skip or try as URL
                finalImages.push(imgPath); 
              }
            } catch (err) {
              console.error(`Failed to upload ${imgPath} to Cloudinary:`, err);
              finalImages.push(imgPath); // Fallback to original
            }
          } else {
            // Local storage: just save the path
            finalImages.push(imgPath);
          }
        }
      }

      const qty = parseInt(stock_quantity) || 0;
      const newProduct = new Product({
        name: product_name,
        description: product_description.split('\n').filter(Boolean), // Assuming description can be multiline and we store as array
        category: rowCategory,
        price: parseFloat(price),
        offerPrice: parseFloat(offer_price),
        unit: unit.toLowerCase(),
        image: finalImages,
        stockQuantity: qty,
        inStock: qty > 0
      });

      await newProduct.save();
      successData.push(product_name);
    }

    let reportUrl = null;
    if (incompleteData.length > 0) {
      const newWorkbook = xlsx.utils.book_new();
      const newSheet = xlsx.utils.json_to_sheet(incompleteData);
      xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Incomplete Data");
      const reportBuffer = xlsx.write(newWorkbook, { type: "buffer", bookType: "xlsx" });
      
      const reportName = `incomplete_data_${Date.now()}.xlsx`;
      const reportPath = path.join(process.cwd(), 'uploads', reportName);
      fs.writeFileSync(reportPath, reportBuffer);
      reportUrl = `/images/${reportName}`;
    }

    res.status(200).json({
      success: true,
      message: `Bulk upload completed. Success: ${successData.length}, Failed: ${incompleteData.length}`,
      successCount: successData.length,
      failedCount: incompleteData.length,
      reportUrl
    });

  } catch (error) {
    console.error("Error in bulkUploadProducts:", error);
    res.status(500).json({ success: false, message: "Internal server error during bulk upload" });
  }
};

export const getBulkUploadTemplate = async (req, res) => {
    try {
        const columns = [
            {
                product_name: "Fresh Tomatoes",
                product_description: "Purely organic fresh tomatoes from farm",
                Category: "Fresh Fruits",
                price: 50,
                offer_price: 45,
                unit: "per kg",
                stock_quantity: 100,
                product_image: "/upload/tomato.png"
            }
        ];

        const workbook = xlsx.utils.book_new();
        const sheet = xlsx.utils.json_to_sheet(columns);
        xlsx.utils.book_append_sheet(workbook, sheet, "Template");
        const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="bulk_product_template.xlsx"',
            'Content-Length': buffer.length
        });
        res.send(buffer);
    } catch (error) {
        console.error("Error generating template:", error);
        res.status(500).json({ success: false, message: "Error generating template" });
    }
};
