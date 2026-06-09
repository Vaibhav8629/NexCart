const mongoose = require('mongoose');
require("dotenv").config();
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI;

const products = [
  {
    "name": "Sony WH-1000XM5 Headphones",
    "description": "Industry-leading noise cancellation with 30-hour battery life. Bluetooth 5.2, multipoint connection, and premium audio performance make this the go-to choice for audiophiles and professionals alike.",
    "price": 34990,
    "discountPrice": 27990,
    "category": "Electronics",
    "brand": "Sony",
    "stock": 45,
    "images": [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
      "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=800&q=80"
    ],
    "rating": 4.8,
    "numReviews": 1243,
    "featured": true,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "boAt Rockerz 550 Wireless Headset",
    "description": "40-hour playback with fast charging, signature boAt bass, and foldable design. Dual EQ mode lets you switch between immersive bass and balanced audio.",
    "price": 3999,
    "discountPrice": 2499,
    "category": "Electronics",
    "brand": "boAt",
    "stock": 120,
    "images": [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80"
    ],
    "rating": 4.2,
    "numReviews": 8721,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Samsung Galaxy S24 Ultra",
    "description": "Snapdragon 8 Gen 3 processor, 200MP camera system, and built-in S Pen. A 6.8-inch Dynamic AMOLED display with 2600 nits peak brightness redefines smartphone photography.",
    "price": 134999,
    "discountPrice": 119999,
    "category": "Electronics",
    "brand": "Samsung",
    "stock": 30,
    "images": [
      "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=800&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80"
    ],
    "rating": 4.7,
    "numReviews": 2341,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "OnePlus Nord CE4 5G",
    "description": "100W SUPERVOOC charging, Snapdragon 7 Gen 3, and 6.7-inch AMOLED display. Slim 7.8mm body with impressive camera setup for the mid-range segment.",
    "price": 24999,
    "discountPrice": 21999,
    "category": "Electronics",
    "brand": "OnePlus",
    "stock": 75,
    "images": [
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80",
      "https://images.unsplash.com/photo-1581993192873-b3a6a70067e8?w=800&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80"
    ],
    "rating": 4.3,
    "numReviews": 956,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Logitech MX Master 3S Mouse",
    "description": "8000 DPI MagSpeed scrolling, quiet clicks, and Bolt USB receiver. Works on any surface including glass. Ergonomic design for all-day comfort with 70-day battery.",
    "price": 10995,
    "discountPrice": 8995,
    "category": "Electronics",
    "brand": "Logitech",
    "stock": 88,
    "images": [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80",
      "https://images.unsplash.com/photo-1563297007-0686b7003af7?w=800&q=80"
    ],
    "rating": 4.7,
    "numReviews": 3210,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Dell 27-inch 4K Monitor",
    "description": "UltraSharp 4K IPS display with 99% sRGB coverage, USB-C connectivity, and VESA DisplayHDR 400. Perfect for creative professionals needing color accuracy.",
    "price": 42990,
    "discountPrice": 36990,
    "category": "Electronics",
    "brand": "Dell",
    "stock": 22,
    "images": [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
      "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=800&q=80",
      "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=80"
    ],
    "rating": 4.6,
    "numReviews": 789,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "JBL Flip 6 Bluetooth Speaker",
    "description": "IP67 waterproof with 12-hour playtime and PartyBoost technology. Bold JBL sound with powerful bass radiators. Connect multiple JBL speakers for an even bigger sound.",
    "price": 11999,
    "discountPrice": 8999,
    "category": "Electronics",
    "brand": "JBL",
    "stock": 65,
    "images": [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
      "https://images.unsplash.com/photo-1589003511827-b41c8dcb0e7a?w=800&q=80",
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80"
    ],
    "rating": 4.5,
    "numReviews": 4532,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Realme Pad Mini 8.7-inch Tablet",
    "description": "8.7-inch FHD+ display, 6400mAh battery, and 18W Quick Charge. Ideal for students and light users needing a compact Android tablet for entertainment and productivity.",
    "price": 13999,
    "discountPrice": 11499,
    "category": "Electronics",
    "brand": "Realme",
    "stock": 40,
    "images": [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80",
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80"
    ],
    "rating": 4,
    "numReviews": 621,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Bose QuietComfort Earbuds II",
    "description": "World's best noise-cancelling earbuds with CustomTune technology. Personalized sound profile, 6-hour battery, and IPX4 sweat resistance in a comfortable secure-fit wing design.",
    "price": 26900,
    "discountPrice": 22900,
    "category": "Electronics",
    "brand": "Bose",
    "stock": 35,
    "images": [
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
      "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80"
    ],
    "rating": 4.6,
    "numReviews": 1876,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Apple MacBook Air M3",
    "description": "M3 chip with 18-hour battery, 15.3-inch Liquid Retina display, and fanless design. Weighs just 1.51kg with 8GB RAM and 256GB SSD. The ultimate laptop for portability and performance.",
    "price": 114900,
    "discountPrice": 109900,
    "category": "Electronics",
    "brand": "Apple",
    "stock": 18,
    "images": [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80"
    ],
    "rating": 4.9,
    "numReviews": 3456,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Nike Air Max 270 Running Shoes",
    "description": "Nike's largest Air unit in the heel delivers all-day comfort. Breathable mesh upper, rubber outsole, and iconic Max Air cushioning. Available in multiple colorways for versatile everyday wear.",
    "price": 12995,
    "discountPrice": 9995,
    "category": "Clothing",
    "brand": "Nike",
    "stock": 80,
    "images": [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
      "https://images.unsplash.com/photo-1600185365778-38def4cdb19f?w=800&q=80"
    ],
    "rating": 4.6,
    "numReviews": 5621,
    "featured": true,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Levi's 511 Slim Fit Jeans",
    "description": "Slim fit through the hip and thigh with a narrow leg opening. Made from stretch denim for comfort and mobility. Classic 5-pocket styling with Levi's signature leather patch.",
    "price": 3999,
    "discountPrice": 2799,
    "category": "Clothing",
    "brand": "Levi's",
    "stock": 150,
    "images": [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
      "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&q=80"
    ],
    "rating": 4.3,
    "numReviews": 9876,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Adidas Ultraboost 22 Shoes",
    "description": "BOOST midsole returns energy with every step. Primeknit+ upper molds to your foot, while Continental rubber outsole delivers superior grip. Perfect for running and everyday performance.",
    "price": 14999,
    "discountPrice": 11999,
    "category": "Clothing",
    "brand": "Adidas",
    "stock": 55,
    "images": [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80"
    ],
    "rating": 4.5,
    "numReviews": 4321,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "FabIndia Handloom Kurta",
    "description": "Handwoven cotton kurta with traditional block print. Relaxed fit with mandarin collar and side slits. Ethically crafted by Indian artisans — lightweight and breathable for all-day wear.",
    "price": 1899,
    "discountPrice": 1499,
    "category": "Clothing",
    "brand": "FabIndia",
    "stock": 200,
    "images": [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80"
    ],
    "rating": 4.4,
    "numReviews": 2154,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "H&M Oversized Hoodie",
    "description": "Relaxed-fit hoodie in soft cotton-blend fabric with a kangaroo pocket and adjustable drawstring hood. Perfect for layering in cooler months. Machine washable.",
    "price": 2499,
    "discountPrice": 1799,
    "category": "Clothing",
    "brand": "H&M",
    "stock": 180,
    "images": [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"
    ],
    "rating": 4.1,
    "numReviews": 3210,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Allen Solly Formal Shirt",
    "description": "Premium cotton formal shirt with a slim-fit cut. Wrinkle-resistant fabric keeps you looking sharp all day. Suitable for office, formal events, and business casual occasions.",
    "price": 1799,
    "discountPrice": 1349,
    "category": "Clothing",
    "brand": "Allen Solly",
    "stock": 160,
    "images": [
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80",
      "https://images.unsplash.com/photo-1620832655773-3c5f4a5ee5f4?w=800&q=80"
    ],
    "rating": 4.2,
    "numReviews": 1876,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Puma RSX3 Sneakers",
    "description": "Chunky retro design meets modern comfort. RS cushioning technology absorbs impact while the mesh and synthetic upper provides breathability. Lace-up fastening with padded collar.",
    "price": 7999,
    "discountPrice": 5999,
    "category": "Clothing",
    "brand": "Puma",
    "stock": 95,
    "images": [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
      "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&q=80"
    ],
    "rating": 4.3,
    "numReviews": 2987,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Zara Floral Midi Dress",
    "description": "Flowing midi dress with all-over floral print, V-neckline, and smocked back detail. 100% viscose — lightweight and breathable. Side pockets for practicality.",
    "price": 3990,
    "discountPrice": 2990,
    "category": "Clothing",
    "brand": "Zara",
    "stock": 70,
    "images": [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80"
    ],
    "rating": 4.4,
    "numReviews": 1543,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Reebok Classic Leather Sneakers",
    "description": "The timeless icon updated with a soft leather upper and low-profile EVA midsole. Versatile sneakers that transition from the gym to the street effortlessly.",
    "price": 6999,
    "discountPrice": 4999,
    "category": "Clothing",
    "brand": "Reebok",
    "stock": 110,
    "images": [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
      "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=800&q=80",
      "https://images.unsplash.com/photo-1467343397459-e7d0c37e3e6a?w=800&q=80"
    ],
    "rating": 4.2,
    "numReviews": 3456,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Peter England Chinos",
    "description": "Slim-fit cotton stretch chinos with 4-way flex technology. Wrinkle-resistant finish and neat taper make these ideal for both office and casual outings.",
    "price": 2299,
    "discountPrice": 1749,
    "category": "Clothing",
    "brand": "Peter England",
    "stock": 130,
    "images": [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80"
    ],
    "rating": 4,
    "numReviews": 987,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Prestige Iris 750W Mixer Grinder",
    "description": "750-watt motor with 3 stainless steel jars (1.5L liquidising, 1L dry grinding, 0.3L chutney). 5-year motor warranty, overload protection, and anti-skid feet for stability.",
    "price": 3999,
    "discountPrice": 2799,
    "category": "Home & Kitchen",
    "brand": "Prestige",
    "stock": 95,
    "images": [
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
      "https://images.unsplash.com/photo-1590794056226-79ef3a47ccf3?w=800&q=80"
    ],
    "rating": 4.5,
    "numReviews": 7823,
    "featured": true,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Borosil Vision Glass Set of 6",
    "description": "Set of 6 borosilicate glass tumblers (310ml each). Microwave and dishwasher safe. Shock-resistant and thermal-resistant — ideal for hot beverages, juices, and daily use.",
    "price": 799,
    "discountPrice": 599,
    "category": "Home & Kitchen",
    "brand": "Borosil",
    "stock": 200,
    "images": [
      "https://images.unsplash.com/photo-1516981879613-9f5da904015f?w=800&q=80",
      "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&q=80"
    ],
    "rating": 4.6,
    "numReviews": 5432,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Philips Air Fryer HD9252",
    "description": "Rapid Air technology circulates hot air for crispy results with up to 90% less fat. 4.1L capacity — perfect for families. Dishwasher-safe parts, digital display with 7 pre-set cooking programs.",
    "price": 12990,
    "discountPrice": 9990,
    "category": "Home & Kitchen",
    "brand": "Philips",
    "stock": 60,
    "images": [
      "https://images.unsplash.com/photo-1628191011227-522c6f598aad?w=800&q=80",
      "https://images.unsplash.com/photo-1593642702909-dec73df255d7?w=800&q=80",
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80"
    ],
    "rating": 4.7,
    "numReviews": 9234,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Milton Thermosteel Flask 1L",
    "description": "Double-wall insulation keeps beverages hot for 24 hours and cold for 12 hours. Food-grade stainless steel, BPA-free, and leak-proof lid. Compact neck design for easy pouring.",
    "price": 899,
    "discountPrice": 699,
    "category": "Home & Kitchen",
    "brand": "Milton",
    "stock": 180,
    "images": [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
      "https://images.unsplash.com/photo-1571241258975-2bdee3b28a87?w=800&q=80",
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80"
    ],
    "rating": 4.4,
    "numReviews": 3987,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Bajaj Rex 500W Dry Iron",
    "description": "Non-stick coated soleplate for smooth gliding over all fabrics. 500W power, temperature regulator for delicate to heavy fabrics. Lightweight design with cool-touch handle.",
    "price": 699,
    "discountPrice": 549,
    "category": "Home & Kitchen",
    "brand": "Bajaj",
    "stock": 220,
    "images": [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80",
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80"
    ],
    "rating": 4.1,
    "numReviews": 4321,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Cello Opalware Dinner Set 27pc",
    "description": "27-piece opalware dinner set with 6 full plates, 6 quarter plates, 6 bowls, and serving pieces. Microwave-safe, chip-resistant, and dishwasher-safe. Elegant floral design for everyday use.",
    "price": 2499,
    "discountPrice": 1799,
    "category": "Home & Kitchen",
    "brand": "Cello",
    "stock": 85,
    "images": [
      "https://images.unsplash.com/photo-1516745914749-8e9c1a5d2a39?w=800&q=80",
      "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"
    ],
    "rating": 4.3,
    "numReviews": 2134,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Havells Installment Ceiling Fan 1200mm",
    "description": "BLDC motor for 50% energy savings. 1200mm sweep with aerodynamically designed blades for optimum air delivery. Remote control included, operates on 25–300V wide voltage range.",
    "price": 3299,
    "discountPrice": 2699,
    "category": "Home & Kitchen",
    "brand": "Havells",
    "stock": 50,
    "images": [
      "https://images.unsplash.com/photo-1635048424329-a9bfb146d7aa?w=800&q=80",
      "https://images.unsplash.com/photo-1527515637462-cff94aca208b?w=800&q=80",
      "https://images.unsplash.com/photo-1416339134316-0e91dc9ded92?w=800&q=80"
    ],
    "rating": 4.4,
    "numReviews": 1876,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Pigeon By Stovekraft Non-Stick Tawa 30cm",
    "description": "5-layer non-stick coating with Tuff Shield technology. Suitable for gas, electric, and induction cooktops. Stay-cool handle, PFOA-free, and easy to clean. 30cm diameter.",
    "price": 599,
    "discountPrice": 449,
    "category": "Home & Kitchen",
    "brand": "Pigeon",
    "stock": 300,
    "images": [
      "https://images.unsplash.com/photo-1606890658317-7d14490b76fd?w=800&q=80",
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
      "https://images.unsplash.com/photo-1583394293214-bd96f57896d1?w=800&q=80"
    ],
    "rating": 4.2,
    "numReviews": 6543,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Orient Electric Wall Fan 400mm",
    "description": "400mm high-speed wall fan with double ball bearing motor for long life. 3-speed control, 90° oscillation, and thermal overload protection. Ideal for kitchens, workshops, and small rooms.",
    "price": 2199,
    "discountPrice": 1799,
    "category": "Home & Kitchen",
    "brand": "Orient",
    "stock": 40,
    "images": [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
      "https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=800&q=80",
      "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800&q=80"
    ],
    "rating": 4,
    "numReviews": 987,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "IKEA KALLAX Shelf Unit 77x147cm",
    "description": "Versatile shelf unit with 8 compartments. Works as room divider, sideboard, or display unit. Can be used with KALLAX inserts for customized storage. Durable particleboard with honeycomb structure.",
    "price": 6990,
    "discountPrice": 5990,
    "category": "Home & Kitchen",
    "brand": "IKEA",
    "stock": 25,
    "images": [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80"
    ],
    "rating": 4.6,
    "numReviews": 3421,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Decathlon Domyos Yoga Mat 8mm",
    "description": "8mm thick NBR foam for joint protection during yoga, pilates, and floor exercises. Non-slip textured surface on both sides. Lightweight at 800g with carry strap. Size: 173 × 61cm.",
    "price": 999,
    "discountPrice": 799,
    "category": "Sports & Fitness",
    "brand": "Decathlon",
    "stock": 150,
    "images": [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
      "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=80",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80"
    ],
    "rating": 4.5,
    "numReviews": 8932,
    "featured": true,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Nivia Storm Football Size 5",
    "description": "32-panel machine stitched football with EVA foam backing for better shape retention. Butyl bladder for long air retention. Suitable for training and match play on grass and turf.",
    "price": 899,
    "discountPrice": 699,
    "category": "Sports & Fitness",
    "brand": "Nivia",
    "stock": 90,
    "images": [
      "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80",
      "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
    ],
    "rating": 4.3,
    "numReviews": 3456,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Cosco Badminton Racket Aluminium",
    "description": "Aluminium shaft with full-carbon graphite head for optimal balance. Pre-strung at 24 lbs. Comfortable grip, suitable for beginners and intermediate players. Weight: 85-95g.",
    "price": 599,
    "discountPrice": 449,
    "category": "Sports & Fitness",
    "brand": "Cosco",
    "stock": 200,
    "images": [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
      "https://images.unsplash.com/photo-1583236666040-5f2f4e9eaf63?w=800&q=80"
    ],
    "rating": 4,
    "numReviews": 2109,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Koxton Adjustable Dumbbell Set 20kg",
    "description": "Adjustable dumbbell set with threaded steel bars and cast iron plates. Includes 2 rods (35cm), 4×2.5kg plates, and 8×1.25kg plates. Spin lock collars for safety during intense workouts.",
    "price": 4999,
    "discountPrice": 3799,
    "category": "Sports & Fitness",
    "brand": "Koxton",
    "stock": 35,
    "images": [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80"
    ],
    "rating": 4.6,
    "numReviews": 1543,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Yonex Mavis 350 Badminton Shuttlecocks",
    "description": "Pack of 6 nylon shuttlecocks for consistent flight and durability. Suitable for all weather conditions. The natural feather feel makes these ideal for intermediate to advanced players.",
    "price": 799,
    "discountPrice": 649,
    "category": "Sports & Fitness",
    "brand": "Yonex",
    "stock": 300,
    "images": [
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80",
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80"
    ],
    "rating": 4.7,
    "numReviews": 5678,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Speedo Fastskin Goggles",
    "description": "IQfit™ technology forms to your eye socket for a personalized fit. UV protection lenses with anti-fog coating. Hydrodynamic design reduces drag. Available in clear and tinted lenses.",
    "price": 1699,
    "discountPrice": 1299,
    "category": "Sports & Fitness",
    "brand": "Speedo",
    "stock": 75,
    "images": [
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
      "https://images.unsplash.com/photo-1600679472829-3044539ce405?w=800&q=80",
      "https://images.unsplash.com/photo-1516567727245-ad8d3f5c7b61?w=800&q=80"
    ],
    "rating": 4.4,
    "numReviews": 987,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Vector X Skipping Rope Steel",
    "description": "Heavy-duty steel cable skipping rope with smooth ball-bearing handles for tangle-free rotation. Adjustable length up to 10 feet. Ideal for cardio, boxing training, and HIIT workouts.",
    "price": 499,
    "discountPrice": 349,
    "category": "Sports & Fitness",
    "brand": "Vector X",
    "stock": 400,
    "images": [
      "https://images.unsplash.com/photo-1599058917765-a780eda5b1b2?w=800&q=80",
      "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&q=80",
      "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800&q=80"
    ],
    "rating": 4.2,
    "numReviews": 3219,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Adidas Predator Edge Football Boots",
    "description": "CONTROL SKIN zones on the upper enhance ball grip for deadly accuracy. Firm Ground outsole with multidirectional studs. Sock-like Primeknit collar for a secure fit.",
    "price": 7999,
    "discountPrice": 5999,
    "category": "Sports & Fitness",
    "brand": "Adidas",
    "stock": 45,
    "images": [
      "https://images.unsplash.com/photo-1556906781-9a412961a28c?w=800&q=80",
      "https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=800&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
    ],
    "rating": 4.5,
    "numReviews": 1234,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Nike Pro Compression Shorts",
    "description": "Dri-FIT technology wicks sweat away from the body. Compression fit supports muscles and improves circulation. 7-inch inseam, internal drawstring, and minimal side seams reduce irritation.",
    "price": 2499,
    "discountPrice": 1999,
    "category": "Sports & Fitness",
    "brand": "Nike",
    "stock": 120,
    "images": [
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=80",
      "https://images.unsplash.com/photo-1616677396686-e35f3be5d601?w=800&q=80",
      "https://images.unsplash.com/photo-1617224908579-c92cc5be8e7e?w=800&q=80"
    ],
    "rating": 4.3,
    "numReviews": 2876,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Reebok Nano X3 Training Shoes",
    "description": "Purpose-built for cross-training with a flat, stable base and flexible forefoot. Floatride Energy Foam for responsive cushioning. Durable rubber compound outsole and reinforced toe overlay.",
    "price": 11999,
    "discountPrice": 8999,
    "category": "Sports & Fitness",
    "brand": "Reebok",
    "stock": 55,
    "images": [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
      "https://images.unsplash.com/photo-1562183241-840b8af0721e?w=800&q=80"
    ],
    "rating": 4.6,
    "numReviews": 1876,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Atomic Habits by James Clear",
    "description": "The #1 New York Times bestseller on building good habits and breaking bad ones. James Clear's proven system for making 1% improvements that compound into extraordinary results over time.",
    "price": 499,
    "discountPrice": 374,
    "category": "Books",
    "brand": "Penguin",
    "stock": 300,
    "images": [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80"
    ],
    "rating": 4.9,
    "numReviews": 45678,
    "featured": true,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Rich Dad Poor Dad",
    "description": "Robert Kiyosaki's classic on financial literacy — the difference between working for money and making money work for you. Essential reading for anyone seeking financial independence.",
    "price": 399,
    "discountPrice": 299,
    "category": "Books",
    "brand": "Notion Press",
    "stock": 250,
    "images": [
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
      "https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=800&q=80",
      "https://images.unsplash.com/photo-1535398089889-dd807df1dfaa?w=800&q=80"
    ],
    "rating": 4.7,
    "numReviews": 32145,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "The Alchemist by Paulo Coelho",
    "description": "A philosophical novel about a young Andalusian shepherd's journey to find treasure. Coelho's timeless fable about following your dreams has sold over 150 million copies worldwide.",
    "price": 299,
    "discountPrice": 224,
    "category": "Books",
    "brand": "Harper Collins",
    "stock": 400,
    "images": [
      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=800&q=80",
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
      "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800&q=80"
    ],
    "rating": 4.8,
    "numReviews": 28943,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Wings of Fire — APJ Abdul Kalam",
    "description": "The inspiring autobiography of India's Missile Man and former President. A story of perseverance, scientific vision, and unwavering dedication to the nation — essential reading for every Indian.",
    "price": 250,
    "discountPrice": 199,
    "category": "Books",
    "brand": "Oxford",
    "stock": 500,
    "images": [
      "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=800&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&q=80"
    ],
    "rating": 4.9,
    "numReviews": 52341,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Clean Code by Robert C. Martin",
    "description": "A handbook of agile software craftsmanship. Martin covers writing code that is readable, maintainable, and elegant. Required reading for every software developer serious about their craft.",
    "price": 899,
    "discountPrice": 699,
    "category": "Books",
    "brand": "Wiley",
    "stock": 120,
    "images": [
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80"
    ],
    "rating": 4.7,
    "numReviews": 8712,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Ikigai: Japanese Secret to Long Life",
    "description": "Discover the Japanese concept of ikigai — your reason for being — and the diet, exercise, and mindset of the world's longest-living people in Okinawa, Japan.",
    "price": 350,
    "discountPrice": 275,
    "category": "Books",
    "brand": "Penguin",
    "stock": 280,
    "images": [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
      "https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=800&q=80",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80"
    ],
    "rating": 4.6,
    "numReviews": 19234,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "NCERT Physics Class 12 Part I",
    "description": "Official NCERT textbook for Class 12 Physics covering electrostatics, current electricity, magnetic effects, electromagnetic induction, and optics. Essential for JEE and board exams.",
    "price": 199,
    "discountPrice": 170,
    "category": "Books",
    "brand": "S. Chand",
    "stock": 600,
    "images": [
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b6f71?w=800&q=80",
      "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=800&q=80"
    ],
    "rating": 4.5,
    "numReviews": 12345,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Harry Potter and the Philosopher's Stone",
    "description": "J.K. Rowling's iconic first book in the Harry Potter series. Follow Harry's journey from the cupboard under the stairs to Hogwarts School of Witchcraft and Wizardry.",
    "price": 399,
    "discountPrice": 299,
    "category": "Books",
    "brand": "Scholastic",
    "stock": 350,
    "images": [
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80",
      "https://images.unsplash.com/photo-1618666185540-de27e28e1d26?w=800&q=80"
    ],
    "rating": 4.9,
    "numReviews": 67890,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Arihant JEE Advanced Mathematics",
    "description": "Comprehensive JEE Advanced Mathematics covering all chapters with solved examples, practice exercises, and previous year questions. Ideal for engineering entrance exam preparation.",
    "price": 699,
    "discountPrice": 549,
    "category": "Books",
    "brand": "Arihant",
    "stock": 200,
    "images": [
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=800&q=80"
    ],
    "rating": 4.5,
    "numReviews": 7654,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Deep Work by Cal Newport",
    "description": "Cal Newport argues that the ability to focus without distraction is becoming increasingly rare and valuable. Rules for focused success in a distracted world — a must-read for knowledge workers.",
    "price": 450,
    "discountPrice": 349,
    "category": "Books",
    "brand": "Disha",
    "stock": 175,
    "images": [
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
      "https://images.unsplash.com/photo-1517842536804-bb2e9f0dbf91?w=800&q=80",
      "https://images.unsplash.com/photo-1520716397945-f05d1dba37a8?w=800&q=80"
    ],
    "rating": 4.7,
    "numReviews": 11234,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Lakme 9to5 Primer + Matte Lipstick",
    "description": "12-hour stay formula with built-in primer for a flawless matte finish. Moisture-lock core prevents drying, while the pigment-rich formula delivers intense color payoff. 36 shades available.",
    "price": 499,
    "discountPrice": 374,
    "category": "Beauty & Personal Care",
    "brand": "Lakme",
    "stock": 250,
    "images": [
      "https://images.unsplash.com/photo-1586495777744-4e6232bf2919?w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80"
    ],
    "rating": 4.5,
    "numReviews": 15432,
    "featured": true,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Mamaearth Vitamin C Face Serum 30ml",
    "description": "2% Vitamin C with Turmeric for brightening skin and reducing dark spots. Dermatologically tested, toxin-free formula. Apply 2–3 drops daily for visibly radiant skin in 4 weeks.",
    "price": 599,
    "discountPrice": 449,
    "category": "Beauty & Personal Care",
    "brand": "Mamaearth",
    "stock": 300,
    "images": [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
      "https://images.unsplash.com/photo-1631390583584-a09c1db03553?w=800&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80"
    ],
    "rating": 4.3,
    "numReviews": 23456,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "WOW Skin Science Aloe Vera Gel 200ml",
    "description": "99% pure aloe vera with vitamins B12, C, and E. No parabens, sulphates, or mineral oils. Soothes sunburn, moisturizes skin, and tames frizzy hair. Suitable for all skin types.",
    "price": 299,
    "discountPrice": 224,
    "category": "Beauty & Personal Care",
    "brand": "WOW",
    "stock": 400,
    "images": [
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80",
      "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80"
    ],
    "rating": 4.4,
    "numReviews": 34567,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "L'Oreal Paris Elvive Shampoo 400ml",
    "description": "Extraordinary Oil shampoo with 6 flower oils — Lotus, Tiare, Rose, Jasmine, Ylang-Ylang, and Sunflower. Transforms dry and dull hair into silky smooth, luminous locks with lasting fragrance.",
    "price": 399,
    "discountPrice": 299,
    "category": "Beauty & Personal Care",
    "brand": "L'Oreal",
    "stock": 200,
    "images": [
      "https://images.unsplash.com/photo-1585305048723-24d0d8a7e78e?w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
      "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?w=800&q=80"
    ],
    "rating": 4.2,
    "numReviews": 8765,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Nivea Men Active Energy Face Wash",
    "description": "Caffeine energy complex revives tired skin and reduces dark circles. Deep-cleansing formula removes dirt and excess oil while strengthening the skin barrier. Suitable for all skin types.",
    "price": 249,
    "discountPrice": 199,
    "category": "Beauty & Personal Care",
    "brand": "Nivea",
    "stock": 350,
    "images": [
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80",
      "https://images.unsplash.com/photo-1601612628452-9e99ced43524?w=800&q=80",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80"
    ],
    "rating": 4.1,
    "numReviews": 12098,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Himalaya Herbals Neem Face Pack 100g",
    "description": "Purifying Neem and Turmeric face pack controls oil, unclogs pores, and prevents acne. Natural ayurvedic formula dermatologically tested. Apply weekly for clear, blemish-free skin.",
    "price": 175,
    "discountPrice": 140,
    "category": "Beauty & Personal Care",
    "brand": "Himalaya",
    "stock": 500,
    "images": [
      "https://images.unsplash.com/photo-1585735062-9e4e00c56073?w=800&q=80",
      "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800&q=80",
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80"
    ],
    "rating": 4.3,
    "numReviews": 19876,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "The Body Shop Tea Tree Oil 30ml",
    "description": "100% pure tea tree oil from Community Fair Trade in Kenya. Known for antibacterial properties — helps blemish-prone skin. Add 2 drops to moisturizer or apply directly with a cotton pad.",
    "price": 1195,
    "discountPrice": 899,
    "category": "Beauty & Personal Care",
    "brand": "The Body Shop",
    "stock": 120,
    "images": [
      "https://images.unsplash.com/photo-1611072965582-63f6c7e0c52e?w=800&q=80",
      "https://images.unsplash.com/photo-1573461160327-2049f4d4f7f5?w=800&q=80",
      "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80"
    ],
    "rating": 4.5,
    "numReviews": 5432,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Biotique Bio Honey Gel Moisturizer",
    "description": "Sparkling gel moisturizer with honey and botanical herbs. Hydrates without feeling greasy — ideal for oily and combination skin. Controls sebum production and leaves skin fresh.",
    "price": 199,
    "discountPrice": 159,
    "category": "Beauty & Personal Care",
    "brand": "Biotique",
    "stock": 450,
    "images": [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80"
    ],
    "rating": 4.1,
    "numReviews": 7654,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Nykaa FACES Matte Face Primer",
    "description": "Blurs pores and smoothens skin texture for a perfect makeup base. Lightweight water-gel formula controls oil for up to 8 hours. Vitamin E enriched for nourished, prepped skin.",
    "price": 399,
    "discountPrice": 299,
    "category": "Beauty & Personal Care",
    "brand": "Nykaa",
    "stock": 180,
    "images": [
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
      "https://images.unsplash.com/photo-1631390583584-a09c1db03553?w=800&q=80"
    ],
    "rating": 4.2,
    "numReviews": 9876,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Dove Body Lotion Deeply Nourishing 400ml",
    "description": "NutriumMoisture technology and plant-based moisturizing milk deeply nourish skin. 24-hour moisture proven by dermatologists. Instantly absorbs leaving skin soft, smooth, and radiant.",
    "price": 399,
    "discountPrice": 319,
    "category": "Beauty & Personal Care",
    "brand": "Dove",
    "stock": 280,
    "images": [
      "https://images.unsplash.com/photo-1585735062-9e4e00c56073?w=800&q=80",
      "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80",
      "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=800&q=80"
    ],
    "rating": 4.4,
    "numReviews": 14523,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "LEGO Classic Creative Bricks 10704",
    "description": "790 colorful bricks in 33 colors for open-ended creative building. Includes building ideas booklet and storage box. Compatible with all LEGO sets. Recommended for ages 4 and above.",
    "price": 3999,
    "discountPrice": 3199,
    "category": "Toys & Games",
    "brand": "LEGO",
    "stock": 80,
    "images": [
      "https://images.unsplash.com/photo-1518331483807-f6adb0e1ad23?w=800&q=80",
      "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=800&q=80",
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80"
    ],
    "rating": 4.8,
    "numReviews": 12345,
    "featured": true,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Funskool Monopoly Classic Board Game",
    "description": "Classic real estate trading game for the whole family. Includes game board, 6 tokens, 28 title deed cards, property cards, 2 dice, money, houses, and hotels. Ages 8 and above. 2–6 players.",
    "price": 899,
    "discountPrice": 699,
    "category": "Toys & Games",
    "brand": "Funskool",
    "stock": 150,
    "images": [
      "https://images.unsplash.com/photo-1611891487122-207579d67d98?w=800&q=80",
      "https://images.unsplash.com/photo-1606503153255-59d5e417b6d0?w=800&q=80",
      "https://images.unsplash.com/photo-1509539662397-d6c2f0af741c?w=800&q=80"
    ],
    "rating": 4.5,
    "numReviews": 8765,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Hot Wheels 20-Car Gift Pack",
    "description": "20 die-cast collectible Hot Wheels vehicles in a variety of designs and colors. Each car has unique detailing and paint finish. Ages 3 and above. Perfect birthday gift for young car enthusiasts.",
    "price": 1499,
    "discountPrice": 1199,
    "category": "Toys & Games",
    "brand": "Hot Wheels",
    "stock": 120,
    "images": [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80",
      "https://images.unsplash.com/photo-1594464225043-e8eb8a0f6a19?w=800&q=80"
    ],
    "rating": 4.7,
    "numReviews": 15678,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Hasbro Jenga Classic Game",
    "description": "The original block-stacking, tower-toppling game. 54 precision-crafted hardwood blocks, stacking sleeve, and instructions. Ages 6 and above. 1–6 players. Develops coordination and strategy.",
    "price": 799,
    "discountPrice": 649,
    "category": "Toys & Games",
    "brand": "Hasbro",
    "stock": 100,
    "images": [
      "https://images.unsplash.com/photo-1576015929099-47f5b5018a72?w=800&q=80",
      "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=800&q=80",
      "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=80"
    ],
    "rating": 4.6,
    "numReviews": 6789,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Skillmatics Guess in 10 Card Game",
    "description": "Fast-paced card game where players ask yes/no questions to guess animals, objects, and more. Develops critical thinking, vocabulary, and communication. 2–6 players, ages 6 and above. No reading required.",
    "price": 599,
    "discountPrice": 449,
    "category": "Toys & Games",
    "brand": "Skillmatics",
    "stock": 200,
    "images": [
      "https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?w=800&q=80",
      "https://images.unsplash.com/photo-1522069213448-443a614da9b6?w=800&q=80",
      "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80"
    ],
    "rating": 4.7,
    "numReviews": 9876,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Disney Princess Doll — Elsa 30cm",
    "description": "30cm Elsa fashion doll from Frozen 2 with glittery singing dress, beautiful hair, and accessories. Press her necklace to hear her iconic voice. For ages 3 and above.",
    "price": 1299,
    "discountPrice": 999,
    "category": "Toys & Games",
    "brand": "Disney",
    "stock": 90,
    "images": [
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
      "https://images.unsplash.com/photo-1544510808-91bc1d4da52c?w=800&q=80",
      "https://images.unsplash.com/photo-1558159955-0d1a57a1fd11?w=800&q=80"
    ],
    "rating": 4.4,
    "numReviews": 5432,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Mattel UNO Card Game 112 Cards",
    "description": "The classic card game of matching colors and numbers. 112 cards including action cards — Skip, Reverse, Draw Two, Wild, and Wild Draw Four. 2–10 players, ages 7 and above.",
    "price": 399,
    "discountPrice": 299,
    "category": "Toys & Games",
    "brand": "Mattel",
    "stock": 300,
    "images": [
      "https://images.unsplash.com/photo-1607457561901-e6ec3a6d16cf?w=800&q=80",
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&q=80",
      "https://images.unsplash.com/photo-1556452503-afb0e2e16b49?w=800&q=80"
    ],
    "rating": 4.7,
    "numReviews": 34567,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Spin Master Kinetic Sand 907g",
    "description": "907g of the original Kinetic Sand that flows, squishes, and moulds. 98% sand, 2% magic polymers. Never dries out. Sensory play that develops fine motor skills. Ages 3 and above. Non-toxic.",
    "price": 1499,
    "discountPrice": 1199,
    "category": "Toys & Games",
    "brand": "Spin Master",
    "stock": 75,
    "images": [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80",
      "https://images.unsplash.com/photo-1573408301185-9519f94816f1?w=800&q=80",
      "https://images.unsplash.com/photo-1546876914-ee3a0b4c95ba?w=800&q=80"
    ],
    "rating": 4.5,
    "numReviews": 4321,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Pressman Scrabble Deluxe Edition",
    "description": "Deluxe Scrabble with rotating turntable board and premium tile holders. 100 premium wooden tiles, 4 tile racks, 2 bags, score pad, and rules booklet. 2–4 players, ages 8 and above.",
    "price": 1799,
    "discountPrice": 1399,
    "category": "Toys & Games",
    "brand": "Pressman",
    "stock": 45,
    "images": [
      "https://images.unsplash.com/photo-1615209853186-e4bd66602508?w=800&q=80",
      "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
    ],
    "rating": 4.6,
    "numReviews": 3456,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  },
  {
    "name": "Orion Puzzles 1000pc Landscape Jigsaw",
    "description": "1000-piece jigsaw puzzle featuring a stunning mountain landscape. Premium quality cardboard pieces that fit together perfectly. Completed puzzle size: 50×70cm. Ages 12 and above.",
    "price": 799,
    "discountPrice": 649,
    "category": "Toys & Games",
    "brand": "Orion",
    "stock": 110,
    "images": [
      "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800&q=80",
      "https://images.unsplash.com/photo-1545670723-196ed0954986?w=800&q=80",
      "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&q=80"
    ],
    "rating": 4.3,
    "numReviews": 2134,
    "featured": false,
    "createdBy": "6a1fc48a35e1a1dbb0f71ac7"
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  
  await Product.deleteMany({});
  console.log('Cleared existing products');
  
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products successfully`);
  
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});