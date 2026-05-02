const categories = ["Electronics", "Fashion", "Home", "Beauty", "Sports"];

const specsTemplates = {
  Electronics: [
    { key: "Warranty", value: "1 Year Brand Warranty" },
    { key: "Material", value: "Premium Polycarbonate" },
    { key: "Battery", value: "Long-lasting 5000mAh" },
  ],
  Fashion: [
    { key: "Fabric", value: "100% Pure Cotton" },
    { key: "Fit", value: "Regular Fit" },
    { key: "Wash Care", value: "Machine Wash Cold" },
  ],
  Home: [
    { key: "Dimensions", value: "Standard 24x36 inches" },
    { key: "Material", value: "Engineered Wood" },
    { key: "Finish", value: "Matte Finish" },
  ],
  Beauty: [
    { key: "Skin Type", value: "All Skin Types" },
    { key: "Chemical Free", value: "Yes (Paraben Free)" },
    { key: "Volume", value: "100ml" },
  ],
  Sports: [
    { key: "Usage", value: "Indoor/Outdoor" },
    { key: "Grip", value: "Anti-Skid High Grip" },
    { key: "Durability", value: "Water Resistant" },
  ],
};

const generate100Products = () => {
  const products = [];
  for (let i = 1; i <= 100; i++) {
    const category = categories[i % categories.length];
    const basePrice = Math.floor(Math.random() * (10000 - 2000) + 2000);
    const discountPrice = Math.floor(basePrice * 0.75); // 25% discount logic

    products.push({
      name: `${category} Premium Item ${i}`,
      description: `Authentic ${category} product for your daily needs. Tested for quality and durability by Vendora experts.`,
      price: basePrice,
      discountPrice: discountPrice,
      category: category,
      stock: Math.floor(Math.random() * 50) + 5,
      images:
        "data:image/jpeg;base64,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",
      isApproved: true,
      specifications: specsTemplates[category],
      isActive: true,
      isAdminHidden: false,
    });
  }
  return products;
};

module.exports = generate100Products();
