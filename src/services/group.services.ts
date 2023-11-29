import { Types } from "mongoose";
import { Groups } from "../model/group.js";
import { IGroup, createGroupType } from "../types/group.type.js";
import { serviceResult } from "../util/response.js";
import { Users } from "../model/user.js";
import { IUser } from "../types/user.type.js";

export async function createGroup(userInput: createGroupType, userId: string) {
  let groups = (await Groups.findOne({ name: userInput.group_name })) as IGroup;

  if (groups) {
    return serviceResult(
      true,
      `Try different group name. ${userInput.group_name} already exist `,
      403,
    );
  }

  groups = (await Groups.create({
    name: userInput.group_name,
    admin: userId,
    category: userInput.category,
  })) as IGroup;

  if (!groups) {
    return serviceResult(true, "Groups does not exist", 500);
  }

  return serviceResult(false, "success", 200, groups);
}

export async function joinGroup(groupId: string, userId: Types.ObjectId) {
  let groups = (await Groups.findById(groupId)) as IGroup;

  if (!groups) {
    return serviceResult(true, "groups is not present", 404);
  }
  groups.users.push(userId);
  groups = await groups.save();

  if (!groups) {
    return serviceResult(
      true,
      "something went wrong with server. please try again",
      500,
    );
  }

  return serviceResult(false, "successfully joined the group", 200);
}

export async function leaveGroup(groupId: string, userId: Types.ObjectId) {
  let groups = (await Groups.findById(groupId)) as IGroup;

  if (!groups) {
    return serviceResult(true, "groups is not present", 404);
  }

  groups.users = groups.users.filter((val) => val != userId);

  groups = await groups.save();

  if (!groups) {
    return serviceResult(
      true,
      "something went wrong with server. please try again",
      500,
    );
  }
  return serviceResult(false, "successfully removed from the group", 200);
}

export async function removeFromTheGroup(
  userId: string,
  adminId: Types.ObjectId,
) {
  let groups = (await Groups.findOne({ admin: adminId })) as IGroup;

  if (!groups) {
    return serviceResult(true, "Admin can only kickout groups memebers", 404);
  }

  let removedUserId;

  groups.users = groups.users.filter((val) => {
    if (val.toString() === userId) {
      removedUserId = val;
    }
    return val.toString() !== userId;
  });

  let removedUser = (await Users.findById(removedUserId)) as IUser;

  groups = await groups.save();

  if (!groups) {
    return serviceResult(
      true,
      "something went wrong with server. please try again",
      500,
    );
  }
  return serviceResult(false, "successfully removed The user the group", 200, {
    username: removedUser.username,
  });
}
