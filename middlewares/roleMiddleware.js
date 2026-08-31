const { UserRole, Role } = require('../models');

const roleMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          message: 'Authentication required',
        });
      }

      const userRole = await UserRole.findOne({
        where: {
          userId: req.user.id,
        },
        include: [
          {
            model: Role,
            where: {
              name: requiredRole,
            },
          },
        ],
      });

      if (!userRole) {
        return res.status(403).json({
          message: 'Access denied',
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);

      return res.status(500).json({
        message: 'Something went wrong',
      });
    }
  };
};

module.exports = roleMiddleware;
