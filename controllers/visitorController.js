// @desc    Register a new visitor
// @route   POST /api/visitors
const registerVisitor = async (req, res) => {
  try {
    let { fullName, phone, visitorType, purpose, hostName, validUntil } = req.body;

    // Validate required fields
    if (!fullName || !phone || !purpose || !hostName) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    // Trim input values
    fullName = fullName.trim();
    phone = phone.trim();
    purpose = purpose.trim();
    hostName = hostName.trim();

    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    // Generate unique Pass ID
    let passId;
    let existingPass;

    do {
      passId = `VIS-${Math.floor(1000 + Math.random() * 9000)}`;
      existingPass = await Visitor.findOne({ passId });
    } while (existingPass);

    // Calculate Expiration
    let expirationDate;

    if (visitorType === "oneday") {
      expirationDate = new Date();
      expirationDate.setHours(23, 59, 59, 999);
    } else {
      expirationDate = validUntil
        ? new Date(validUntil)
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      expirationDate.setHours(23, 59, 59, 999);
    }

    const visitor = await Visitor.create({
      passId,
      fullName,
      phone,
      visitorType,
      purpose,
      hostName,
      validUntil: expirationDate,
    });

    return res.status(201).json({
      success: true,
      message: "Visitor registered successfully",
      visitor,
    });

  } catch (error) {
    console.error("Register Visitor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};