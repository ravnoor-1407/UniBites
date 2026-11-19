const db = require('../data/fileDb');

// @desc    Create a new group ordering session
// @route   POST /api/groups/create
// @access  Public / Protected
const createGroup = (req, res) => {
  const { outletId, hostName, hostRoll } = req.body;

  if (!outletId) {
    return res.status(400).json({
      success: false,
      message: 'Outlet ID is required to start a group order.',
    });
  }

  const name = req.user?.name || hostName || 'Student';
  const roll = req.user?.rollNumber || hostRoll || '12204891';

  const group = db.createGroup(roll, name, outletId);
  const responseData = {
    ...group,
    code: group.groupCode,
  };

  res.status(201).json({
    success: true,
    message: `Group order created! Share code '${group.groupCode}' with friends.`,
    data: responseData,
  });
};

// @desc    Get group details by code
// @route   GET /api/groups/:code
// @access  Public
const getGroupByCode = (req, res) => {
  const { code } = req.params;
  const group = db.getGroup(code);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: `Group with code '${code}' not found.`,
    });
  }

  res.status(200).json({
    success: true,
    data: group,
  });
};

// @desc    Add item to a group session
// @route   POST /api/groups/:code/item
// @access  Public / Protected
const addItemToGroup = (req, res) => {
  const { code } = req.params;
  const { memberName, memberRoll, item } = req.body;

  if (!item || !item.id) {
    return res.status(400).json({
      success: false,
      message: 'Item details are required.',
    });
  }

  const dish = db.findMenuItem(item.id);
  if (!dish || dish.isAvailable === false) {
    return res.status(400).json({
      success: false,
      message: 'This dish is currently unavailable.',
    });
  }

  const name = req.user?.name || memberName || 'Friend';
  const roll = req.user?.rollNumber || memberRoll || `GUEST-${Date.now().toString().slice(-4)}`;

  const itemToAdd = {
    id: dish.id,
    name: dish.name,
    price: dish.price,
    quantity: item.quantity || 1,
    isVeg: dish.isVeg,
    prepMins: dish.prepMins,
    addedBy: name,
  };

  const updatedGroup = db.addItemToGroup(code, name, roll, itemToAdd);
  if (!updatedGroup) {
    return res.status(404).json({
      success: false,
      message: 'Group order not found or already closed.',
    });
  }

  res.status(200).json({
    success: true,
    message: `Added ${dish.name} to group order!`,
    data: updatedGroup,
  });
};

module.exports = {
  createGroup,
  getGroupByCode,
  addItemToGroup,
};
