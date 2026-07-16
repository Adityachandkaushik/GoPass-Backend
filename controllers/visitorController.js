const Visitor = require('../models/visitor');

// @desc    Register a new visitor
// @route   POST /api/visitors
const registerVisitor = async (req, res) => {
  try {
    const { fullName, phone, visitorType, purpose, hostName, validUntil } = req.body;

    // Validate required fields
    if (!fullName || !phone || !purpose || !hostName) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // Generate Unique Pass ID (VIS-XXXX)
    const passId = `VIS-${Math.floor(1000 + Math.random() * 9000)}`;

    // Calculate Expiration
    let expirationDate;
    if (visitorType === 'oneday') {
      expirationDate = new Date();
      expirationDate.setHours(23, 59, 59, 999); // End of today
    } else {
      // Use provided date or default to 3 days
      expirationDate = validUntil ? new Date(validUntil) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      expirationDate.setHours(23, 59, 59, 999);
    }

    const visitor = await Visitor.create({
      passId,
      fullName,
      phone,
      visitorType,
      purpose,    // Stores Event Title
      hostName,   // Stores Event Host
      validUntil: expirationDate
    });

    res.status(201).json(visitor);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Scan visitor pass (Check-in / Check-out)
// @route   POST /api/visitors/scan
const scanVisitor = async (req, res) => {
  try {
    const { passId } = req.body;

    if (!passId) {
      return res.status(400).json({ message: 'Pass ID is required' });
    }

    const visitor = await Visitor.findOne({ passId });

    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    // Check if expired
    if (new Date() > new Date(visitor.validUntil)) {
      visitor.status = 'Expired';
      await visitor.save();
      return res.status(400).json({ message: 'Pass Expired', visitor });
    }

    // Check-in / Check-out Logic
    if (visitor.status === 'Registered' || !visitor.checkInTime) {
      visitor.checkInTime = new Date();
      visitor.status = 'Active';
      await visitor.save();
      return res.json({ message: 'Check-In Successful', type: 'check-in', visitor });

    } else if (visitor.status === 'Active') {
      visitor.checkOutTime = new Date();
      visitor.status = 'Checked Out';
      await visitor.save();
      return res.json({ message: 'Check-Out Successful', type: 'check-out', visitor });

    } else if (visitor.status === 'Checked Out') {
      return res.status(400).json({ message: 'Pass already used for Check-Out', visitor });
    }

    res.json(visitor);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all visitors
// @route   GET /api/visitors
const getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get visitor statistics (Daily counts)
// @route   GET /api/visitors/stats
const getVisitorStats = async (req, res) => {
  try {
    const stats = await Visitor.aggregate([
      {
        $group: {
          // Format date as YYYY-MM-DD to group by day
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by date ascending (oldest to newest)
    ]);

    // Format for Recharts (Frontend)
    const formattedStats = stats.map(item => ({
      date: item._id,
      visitors: item.count
    }));

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
// @desc    Delete a visitor
// @route   DELETE /api/visitors/:id
const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    res.json({ id: req.params.id, message: 'Visitor deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Don't forget to export it!
module.exports = { registerVisitor, getVisitors, scanVisitor, getVisitorStats, deleteVisitor };

