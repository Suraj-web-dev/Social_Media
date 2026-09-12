import { Inngest } from "inngest";
import User from "./models/User.model.js";

export const inngest = new Inngest({ id: "social-media-app" });

// Sync user creation from Clerk
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk", triggers: [{ event: "clerk/user.created" }] },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    let username = email_addresses[0]?.email_address.split("@")[0];

    // Check availability of username
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      username = `${username}${Math.floor(Math.random() * 10000)}`;
    }

    const full_name = (first_name || last_name)
      ? `${first_name || ''} ${last_name || ''}`.trim()
      : username;

    const userData = {
      _id: id,
      email: email_addresses[0]?.email_address,
      full_name,
      username,
      profile_picture: image_url || ""
    };

    await User.create(userData);
  }
);

// Sync user update from Clerk
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk", triggers: [{ event: "clerk/user.updated" }] },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const full_name = (first_name || last_name)
      ? `${first_name || ''} ${last_name || ''}`.trim()
      : undefined;

    const updatedUserData = {
      email: email_addresses[0]?.email_address,
      ...(full_name && { full_name }),
      profile_picture: image_url
    };

    await User.findByIdAndUpdate(id, updatedUserData);
  }
);

// Sync user deletion from Clerk
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk", triggers: [{ event: "clerk/user.deleted" }] },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

// Export all inngest functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
