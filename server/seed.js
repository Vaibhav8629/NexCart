require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const categories = {
  Electronics: {
    brands: ["Apple", "Samsung", "Sony", "Dell", "HP"],
    products: [
      {
        name: "Wireless Earbuds",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/AirPods_Pro.jpg/800px-AirPods_Pro.jpg"
      },
      {
        name: "Gaming Laptop",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Dell_XPS_15_9500_2.jpg/800px-Dell_XPS_15_9500_2.jpg"
      },
      {
        name: "Smart Watch",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Apple_Watch_Series_7.jpg/800px-Apple_Watch_Series_7.jpg"
      },
      {
        name: "Bluetooth Speaker",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/JBL_Clip_4.jpg/800px-JBL_Clip_4.jpg"
      },
      {
        name: "4K Monitor",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/LG_UltraWide_Monitor.jpg/800px-LG_UltraWide_Monitor.jpg"
      },
      {
        name: "Mechanical Keyboard",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Corsair_K95_RGB_Platinum.jpg/800px-Corsair_K95_RGB_Platinum.jpg"
      },
      {
        name: "Tablet",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/iPad_Pro_2021.jpg/800px-iPad_Pro_2021.jpg"
      },
      {
        name: "Power Bank",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Anker_PowerCore_10000.jpg/800px-Anker_PowerCore_10000.jpg"
      },
      {
        name: "Webcam",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Logitech_C920_HD_Pro_Webcam.jpg/800px-Logitech_C920_HD_Pro_Webcam.jpg"
      },
      {
        name: "Smartphone",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/IPhone_14_Pro.jpg/800px-IPhone_14_Pro.jpg"
      }
    ]
  },

  Fashion: {
    brands: ["Nike", "Adidas", "Puma", "Levis", "Zara"],
    products: [
      {
        name: "Running Shoes",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/800px-Camponotus_flavomarginatus_ant.jpg"
      },
      {
        name: "Running Shoes",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
      },
      {
        name: "Denim Jacket",
        image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80"
      },
      {
        name: "Hoodie",
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"
      },
      {
        name: "Casual Shirt",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"
      },
      {
        name: "Sneakers",
        image: "https://images.unsplash.com/photo-1600185365778-bd75eb6c7e1e?w=800&q=80"
      },
      {
        name: "Cargo Pants",
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80"
      },
      {
        name: "Track Pants",
        image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80"
      },
      {
        name: "T-Shirt",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"
      },
      {
        name: "Cap",
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80"
      },
      {
        name: "Backpack",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
      }
    ]
  },

  HomeBeauty: {
    brands: ["Lakme", "Maybelline", "Loreal", "Philips", "Dyson"],
    products: [
      {
        name: "Hair Dryer",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"
      },
      {
        name: "Face Wash",
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80"
      },
      {
        name: "Skin Serum",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"
      },
      {
        name: "Makeup Kit",
        image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80"
      },
      {
        name: "Hair Straightener",
        image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80"
      },
      {
        name: "Body Lotion",
        image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80"
      },
      {
        name: "Perfume",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80"
      },
      {
        name: "Electric Trimmer",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80"
      },
      {
        name: "Face Cream",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80"
      },
      {
        name: "Beauty Brush",
        image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80"
      }
    ]
  },

  Sports: {
    brands: ["Nike", "Adidas", "Puma", "Yonex", "Nivia"],
    products: [
      {
        name: "Football",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Football_Pallo_valmiina-cropped.jpg/800px-Football_Pallo_valmiina-cropped.jpg"
      },
      {
        name: "Cricket Bat",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Cricket_bat_%26_ball.jpg/800px-Cricket_bat_%26_ball.jpg"
      },
      {
        name: "Yoga Mat",
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80"
      },
      {
        name: "Dumbbells",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
      },
      {
        name: "Basketball",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Basketball.png/800px-Basketball.png"
      },
      {
        name: "Badminton Racket",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Badminton_rackets_and_shuttlecocks.jpg/800px-Badminton_rackets_and_shuttlecocks.jpg"
      },
      {
        name: "Sports Bottle",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80"
      },
      {
        name: "Skipping Rope",
        image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80"
      },
      {
        name: "Training Gloves",
        image: "https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?w=800&q=80"
      },
      {
        name: "Gym Bag",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
      }
    ]
  },

  Books: {
    brands: ["Penguin", "HarperCollins", "Bloomsbury", "Pearson"],
    products: [
      {
        name: "Data Structures Guide",
        image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80"
      },
      {
        name: "Machine Learning Basics",
        image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80"
      },
      {
        name: "Clean Code",
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80"
      },
      {
        name: "Atomic Habits",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80"
      },
      {
        name: "Rich Dad Poor Dad",
        image: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=800&q=80"
      },
      {
        name: "Deep Work",
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80"
      },
      {
        name: "The Psychology of Money",
        image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80"
      },
      {
        name: "Algebra Handbook",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80"
      },
      {
        name: "Competitive Programming",
        image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80"
      },
      {
        name: "System Design Guide",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80"
      }
    ]
  },

  Grocery: {
    brands: ["Amul", "Nestle", "Tata", "Aashirvaad", "Fortune"],
    products: [
      {
        name: "Organic Rice",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/White_rice.jpg/800px-White_rice.jpg"
      },
      {
        name: "Whole Wheat Flour",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Fresh_made_bread_05.jpg/800px-Fresh_made_bread_05.jpg"
      },
      {
        name: "Green Tea",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Steeping_green_tea.jpg/800px-Steeping_green_tea.jpg"
      },
      {
        name: "Almonds",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Almonds.jpg/800px-Almonds.jpg"
      },
      {
        name: "Honey",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24701-nature-beauty-of-honey.jpg/800px-24701-nature-beauty-of-honey.jpg"
      },
      {
        name: "Olive Oil",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Olive-oil.jpg/800px-Olive-oil.jpg"
      },
      {
        name: "Coffee",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/800px-A_small_cup_of_coffee.JPG"
      },
      {
        name: "Peanut Butter",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Peanut_butter_on_a_spoon.JPG/800px-Peanut_butter_on_a_spoon.JPG"
      },
      {
        name: "Oats",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Porridge_Prepared.jpg/800px-Porridge_Prepared.jpg"
      },
      {
        name: "Dry Fruits Mix",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Walnuts_%28Juglans_regia%29.jpg/800px-Walnuts_%28Juglans_regia%29.jpg"
      }
    ]
  }
};

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProducts() {
  const products = [];
  const categoryNames = Object.keys(categories);

  for (let i = 1; i <= 70; i++) {
    const categoryName = categoryNames[random(0, categoryNames.length - 1)];
    const data = categories[categoryName];

    const productEntry = data.products[random(0, data.products.length - 1)];
    const brand = data.brands[random(0, data.brands.length - 1)];
    const price = random(200, 50000);

    products.push({
      name: `${brand} ${productEntry.name}`,
      description: `Premium quality ${productEntry.name.toLowerCase()} from ${brand}. Designed for daily use with excellent durability and performance.`,
      price,
      discountPrice: Math.floor(price * (0.7 + Math.random() * 0.2)),
      category: categoryName,
      brand,
      stock: random(5, 150),
      images: [productEntry.image],
      rating: 0,
      numReviews: 0,
      featured: Math.random() > 0.5,
      createdBy: "6a1fc48a35e1a1dbb0f71ac7"
    });
  }

  return products;
}

async function seedProducts() {
  try {
    console.log("Mongo URI:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Product.deleteMany({});

    const products = generateProducts();
    await Product.insertMany(products);

    console.log(`${products.length} products inserted`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedProducts();