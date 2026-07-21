const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { sendSuccess } = require('../../utils/ApiResponse');
const Building = require('../../models/Building');
const User = require('../../models/User');
const Order = require('../../models/Order');
const { ROLES, ORDER_STATUS } = require('../../config/constants');

const WATCHMAN_FIELDS = 'name phone email';

const listBuildings = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };

  const buildings = await Building.find(filter).populate('watchman', WATCHMAN_FIELDS).sort({ name: 1 });

  // Attach live customer/order counts per society (matched on the free-text
  // building name customers saved at onboarding).
  const withStats = await Promise.all(
    buildings.map(async (b) => {
      const [userCount, orderCount] = await Promise.all([
        User.countDocuments({ role: ROLES.CUSTOMER, 'address.building': b.name }),
        Order.countDocuments({ 'deliveryAddress.building': b.name }),
      ]);
      return { ...b.toPublicJSON(), userCount, orderCount };
    })
  );

  sendSuccess(res, { data: { buildings: withStats } });
});

const createBuilding = asyncHandler(async (req, res) => {
  const exists = await Building.findOne({ name: req.body.name });
  if (exists) throw ApiError.conflict('A building with this name already exists');
  const building = await Building.create(req.body);
  sendSuccess(res, { statusCode: 201, message: 'Building created', data: { building: building.toPublicJSON() } });
});

const updateBuilding = asyncHandler(async (req, res) => {
  const building = await Building.findById(req.params.id);
  if (!building) throw ApiError.notFound('Building not found');
  Object.assign(building, req.body);
  await building.save();
  await building.populate('watchman', WATCHMAN_FIELDS);
  sendSuccess(res, { message: 'Building updated', data: { building: building.toPublicJSON() } });
});

const assignWatchman = asyncHandler(async (req, res) => {
  const building = await Building.findById(req.params.id);
  if (!building) throw ApiError.notFound('Building not found');

  const { watchmanId } = req.body;
  if (watchmanId) {
    const watchman = await User.findOne({ _id: watchmanId, role: ROLES.WATCHMAN });
    if (!watchman) throw ApiError.badRequest('Selected watchman not found');
  }
  building.watchman = watchmanId || null;
  await building.save();
  await building.populate('watchman', WATCHMAN_FIELDS);
  sendSuccess(res, { message: 'Watchman assigned', data: { building: building.toPublicJSON() } });
});

const deleteBuilding = asyncHandler(async (req, res) => {
  const building = await Building.findByIdAndDelete(req.params.id);
  if (!building) throw ApiError.notFound('Building not found');
  sendSuccess(res, { message: 'Building deleted', data: { id: req.params.id } });
});

// Building-wise customers + order/revenue stats for the detail drawer.
const buildingStats = asyncHandler(async (req, res) => {
  const building = await Building.findById(req.params.id).populate('watchman', WATCHMAN_FIELDS);
  if (!building) throw ApiError.notFound('Building not found');

  const [users, revenueAgg, orderCount] = await Promise.all([
    User.find({ role: ROLES.CUSTOMER, 'address.building': building.name }).select('name phone address'),
    Order.aggregate([
      { $match: { 'deliveryAddress.building': building.name, status: { $ne: ORDER_STATUS.CANCELLED } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments({ 'deliveryAddress.building': building.name }),
  ]);

  sendSuccess(res, {
    data: {
      building: building.toPublicJSON(),
      users: users.map((u) => ({ id: u._id, name: u.name, phone: u.phone, flat: u.address?.flat, wing: u.address?.wing })),
      orderCount,
      revenue: revenueAgg[0]?.total || 0,
    },
  });
});

module.exports = { listBuildings, createBuilding, updateBuilding, assignWatchman, deleteBuilding, buildingStats };
