const User = require("../models/user.model");
const ChurchList = require("../models/church.model");
const UserCommunity = require("../models/userCommunity.model");
const { getFileUrl } = require("../utils/fileUpload");

// Get user profile with church details
const getUserProfile = async (userId) => {
  try {
    const userData = await User.findById(userId);

    if (!userData) {
      return null;
    }

    const userObj = userData.toObject();

    // Convert profile image path to signed URL
    if (userObj.profile) {
      try {
        userObj.profile = await getFileUrl(userObj.profile);
      } catch (urlError) {
        console.error("Error getting file URL:", urlError);
        // Keep original path if URL generation fails
      }
    }

    if (userData.isPastor === 1) {
      if (userData.church_id) {
        const churchData = await ChurchList.findById(userData.church_id).select(
          "name address latitude longitude is_availability"
        );
        userObj.church = churchData;
      } else {
        userObj.church = null;
      }
    } else {
      userObj.church = {};
    }

    return userObj;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
};

// Check if user joined community
const isUserJoined = async (communityId, userId) => {
  try {
    const exists = await UserCommunity.findOne({
      community_id: communityId,
      user_id: userId,
    });
    return !!exists;
  } catch (error) {
    console.error("Error in isUserJoined:", error);
    return false;
  }
};

// Get joined member count for community
const joinedMemberCommunity = async (communityId) => {
  try {
    const count = await UserCommunity.countDocuments({
      community_id: communityId,
    });
    return count;
  } catch (error) {
    console.error("Error in joinedMemberCommunity:", error);
    return 0;
  }
};

// Get nearby users (within radius)
const nearByUser = async (userId, radius = 100) => {
  try {
    const userData = await User.findById(userId);

    if (!userData || !userData.latitude || !userData.longitude) {
      return [];
    }

    const latitude = parseFloat(userData.latitude);
    const longitude = parseFloat(userData.longitude);

    // MongoDB geospatial query
    const nearbyUsers = await User.find({
      _id: { $ne: userId },
      deleted_at: null,
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
    }).select("_id");

    // Calculate distance for each user (simplified - you might want to use MongoDB's $geoNear)
    const userIds = [];
    for (const user of nearbyUsers) {
      const distance = calculateDistance(
        latitude,
        longitude,
        parseFloat(user.latitude),
        parseFloat(user.longitude)
      );
      if (distance < radius) {
        userIds.push(user._id);
      }
    }

    return userIds;
  } catch (error) {
    console.error("Error in nearByUser:", error);
    return [];
  }
};

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Get user data
const userData = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (error) {
    console.error("Error in userData:", error);
    return null;
  }
};

module.exports = {
  getUserProfile,
  isUserJoined,
  joinedMemberCommunity,
  nearByUser,
  userData,
};
